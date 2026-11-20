<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft, Edit, Plus, UserFilled } from "@element-plus/icons-vue";
import { getRequirement } from "@/api/requirements";
import { getErrorMessage } from "@/api/http";
import { useAuthStore } from "@/stores/auth";
import { TASK_STATUS_META } from "@/config/tasks";
import RequirementFormDialog from "@/components/requirements/RequirementFormDialog.vue";
import QaMembersDialog from "@/components/requirements/QaMembersDialog.vue";
import TaskFormDialog from "@/components/tasks/TaskFormDialog.vue";
import type { Requirement, RequirementPriority, TaskSummary } from "@/types";

const props = defineProps<{
  requirementId?: string;
  embedded?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  "open-task": [taskId: string];
}>();

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const requirement = ref<Requirement | null>(null);
const loading = ref(false);
const formVisible = ref(false);
const membersVisible = ref(false);
const taskDialogVisible = ref(false);

const PRIORITY_META: Record<RequirementPriority, { label: string; cls: string }> = {
  P0: { label: "P0 · 最高", cls: "pri-p0" },
  P1: { label: "P1 · 高", cls: "pri-p1" },
  P2: { label: "P2 · 普通", cls: "pri-p2" }
};

const STATUS_CLASS: Record<string, string> = {
  pending_tasks: "st-soft",
  pending: "st-none",
  in_progress: "st-dev",
  overdue: "st-overdue",
  done: "st-done"
};

const requirementId = computed(() => props.requirementId || String(route.params.id || ""));

function formatDate(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("zh-CN");
}

async function load() {
  loading.value = true;
  try {
    requirement.value = await getRequirement(requirementId.value);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载需求详情失败"));
  } finally {
    loading.value = false;
  }
}

function onSaved(next: Requirement) {
  requirement.value = next;
}

async function onTaskSaved() {
  await load();
}

function openTask(task: TaskSummary) {
  if (props.embedded) {
    emit("open-task", task.id);
    return;
  }
  router.push(`/tasks/${task.id}`);
}

onMounted(load);
</script>

<template>
  <div v-loading="loading" class="page-stack">
    <div v-if="!embedded" class="crumb">
      <el-button link :icon="ArrowLeft" @click="router.push('/reqs')">需求管理</el-button>
      <span class="crumb-sep">/</span>
      <span>{{ requirement?.code ?? "需求详情" }}</span>
    </div>

    <template v-if="requirement">
      <section class="detail-card">
        <div class="detail-top">
          <div class="detail-main">
            <div class="detail-code">{{ requirement.code }}</div>
            <h2 class="detail-title">{{ requirement.title }}</h2>
            <p class="detail-desc">{{ requirement.description || "暂无描述" }}</p>
          </div>
          <div class="detail-badges">
            <span class="pri" :class="PRIORITY_META[requirement.priority].cls">
              {{ PRIORITY_META[requirement.priority].label }}
            </span>
            <span class="pill" :class="STATUS_CLASS[requirement.status] || 'st-soft'">
              {{ requirement.statusLabel }}
            </span>
          </div>
        </div>

        <div class="detail-meta">
          <span>开发负责人 <b>{{ requirement.devOwner.name }}</b></span>
          <span>测试负责人 <b>{{ requirement.qaOwner.name }}</b></span>
          <span>产品负责人 <b>{{ requirement.pmOwner.name }}</b></span>
          <span>开始 <b>{{ formatDate(requirement.startAt) }}</b></span>
          <span>期望完成 <b>{{ formatDate(requirement.dueAt) }}</b></span>
          <span>任务 <b>{{ requirement.taskCount }}</b></span>
        </div>

        <div class="detail-actions">
          <el-button
            v-if="auth.hasPermission('req_member')"
            :icon="UserFilled"
            @click="membersVisible = true"
          >
            维护测试人员
          </el-button>
          <el-button
            v-if="auth.hasPermission('req_create')"
            type="primary"
            :icon="Edit"
            @click="formVisible = true"
          >
            编辑需求
          </el-button>
        </div>
      </section>

      <section class="members-card">
        <div class="card-head">
          <h3>测试人员</h3>
          <span class="muted-text">测试负责人自动在内，共 {{ requirement.qaMembers.length }} 人</span>
        </div>
        <div class="member-list">
          <span
            v-for="member in requirement.qaMembers"
            :key="member.id"
            class="member-chip"
            :class="{ owner: member.id === requirement.qaOwner.id }"
          >
            <span class="member-avatar">{{ member.name.slice(0, 1) }}</span>
            {{ member.name }}
            <small v-if="member.id === requirement.qaOwner.id">负责人</small>
          </span>
          <span v-if="!requirement.qaMembers.length" class="muted-text">还没有登记测试人员</span>
        </div>
      </section>

      <section class="task-card">
        <div class="card-head">
          <h3>任务拆分</h3>
          <div class="task-head-actions">
            <span class="muted-text">{{ requirement.taskCount }} 个任务</span>
            <el-button
              v-if="auth.hasPermission('task_create')"
              type="primary"
              size="small"
              :icon="Plus"
              @click="taskDialogVisible = true"
            >
              新建任务
            </el-button>
          </div>
        </div>

        <el-table
          v-if="requirement.tasks.length"
          :data="requirement.tasks"
          class="task-table"
          @row-click="openTask"
        >
          <el-table-column label="任务" min-width="240">
            <template #default="{ row }">
              <div class="task-title">{{ row.title }}</div>
              <div class="task-sub">{{ row.owner.name }} · {{ TASK_STATUS_META[row.status as keyof typeof TASK_STATUS_META]?.label }}</div>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="140">
            <template #default="{ row }">
              <span class="task-status" :class="TASK_STATUS_META[row.status as keyof typeof TASK_STATUS_META]?.cls">
                {{ row.statusLabel }}
              </span>
              <span v-if="row.overdueType" class="overdue-tag">
                {{ row.overdueType === "dev" ? "开发超时" : "测试超时" }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="进度" width="130">
            <template #default="{ row }">
              <div class="progress-wrap">
                <div class="progress-bar"><span :style="{ width: `${row.progress}%` }" /></div>
                <span class="progress-text">{{ row.progress }}%</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="流水" width="80">
            <template #default="{ row }">{{ row.pipelineCount }}</template>
          </el-table-column>

          <el-table-column label="截止" width="120">
            <template #default="{ row }">{{ formatDate(row.dueAt) }}</template>
          </el-table-column>

          <el-table-column label="" width="90" align="right">
            <template #default="{ row }">
              <el-button size="small" @click.stop="openTask(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-else class="task-empty">
          还没有任务。开发负责人可以把需求拆成任务，任务下再挂 CI 流水。
        </div>
      </section>

      <RequirementFormDialog
        v-model="formVisible"
        :requirement="requirement"
        @saved="onSaved"
      />
      <QaMembersDialog
        v-model="membersVisible"
        :requirement="requirement"
        @saved="onSaved"
      />
      <TaskFormDialog
        v-model="taskDialogVisible"
        :requirement="requirement"
        @saved="onTaskSaved"
      />
    </template>

    <section v-else-if="!loading" class="empty-card">
      <div class="empty-title">需求不存在或已被删除</div>
      <el-button @click="router.push('/reqs')">返回需求列表</el-button>
    </section>
  </div>
</template>

<style scoped>
.crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12.5px;
}

.crumb-sep {
  color: #cbd5e1;
}

.detail-card,
.members-card,
.task-card {
  padding: 20px 22px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.detail-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.detail-main {
  min-width: 0;
}

.detail-code {
  color: var(--muted);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}

.detail-title {
  margin: 4px 0 6px;
  font-size: 21px;
  line-height: 1.35;
}

.detail-desc {
  margin: 0;
  max-width: 820px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.detail-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.pri {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.pri-p0 {
  background: #fdecec;
  color: #b91c1c;
}

.pri-p1 {
  background: #fff5e6;
  color: #b45309;
}

.pri-p2 {
  background: #f1f5f9;
  color: #475569;
}

.pill {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.st-soft {
  background: #f1f5f9;
  color: #475569;
}

.st-none {
  background: #f1f5f9;
  color: #64748b;
}

.st-dev {
  background: #eef3ff;
  color: #1d4ed8;
}

.st-overdue {
  background: #fdecec;
  color: #b91c1c;
}

.st-done {
  background: #e9f7ee;
  color: #15803d;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
  color: var(--muted);
  font-size: 12px;
}

.detail-meta b {
  color: var(--ink-2);
  font-weight: 500;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.card-head h3 {
  margin: 0;
  font-size: 15px;
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px 4px 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ink-2);
  font-size: 12px;
}

.member-chip.owner {
  border-color: #bfd3fb;
  background: #f3f7ff;
}

.member-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--blue-soft);
  color: var(--blue);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 600;
}

.member-chip small {
  color: #1d4ed8;
  font-size: 10px;
}

.task-empty {
  padding: 26px;
  border: 1px dashed var(--line);
  border-radius: 10px;
  color: var(--muted);
  font-size: 12.5px;
  text-align: center;
}

.empty-card {
  padding: 44px 24px;
  background: #ffffff;
  border: 1px dashed var(--line);
  border-radius: 14px;
  text-align: center;
}

.empty-title {
  margin-bottom: 16px;
  font-size: 17px;
  font-weight: 600;
}

.task-head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-table {
  width: 100%;
  font-size: 12.5px;
}

.task-table :deep(.el-table__row) {
  cursor: pointer;
}

.task-title {
  color: var(--ink);
  font-weight: 500;
}

.task-sub {
  margin-top: 2px;
  color: var(--muted);
  font-size: 11px;
}

.task-status {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
}

.ts-none {
  background: #f1f5f9;
  color: #64748b;
}

.ts-dev {
  background: #eef3ff;
  color: #1d4ed8;
}

.ts-ready {
  background: #e8f5f2;
  color: #0f766e;
}

.ts-testing {
  background: #f4f0ff;
  color: #5b46b0;
}

.ts-release {
  background: #fff5e6;
  color: #b45309;
}

.ts-done {
  background: #e9f7ee;
  color: #15803d;
}

.overdue-tag {
  margin-left: 6px;
  color: #b91c1c;
  font-size: 10px;
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #eef2f7;
  overflow: hidden;
}

.progress-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--blue);
}

.progress-text {
  color: var(--muted);
  font-size: 10.5px;
  min-width: 28px;
  text-align: right;
}
</style>
