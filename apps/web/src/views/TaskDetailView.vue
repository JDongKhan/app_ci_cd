<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft, Delete, Edit } from "@element-plus/icons-vue";
import { deleteTask, getTask } from "@/api/tasks";
import { getErrorMessage } from "@/api/http";
import { useAuthStore } from "@/stores/auth";
import { PRIORITY_META, TASK_STATUS_META } from "@/config/tasks";
import TaskFormDialog from "@/components/tasks/TaskFormDialog.vue";
import type { TaskDetail } from "@/types";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const task = ref<TaskDetail | null>(null);
const loading = ref(false);
const activeTab = ref("overview");
const editVisible = ref(false);

const taskId = computed(() => String(route.params.id || ""));
const statusMeta = computed(() =>
  task.value ? TASK_STATUS_META[task.value.status] : null
);

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("zh-CN");
}

async function load() {
  loading.value = true;
  try {
    task.value = await getTask(taskId.value);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载任务详情失败"));
  } finally {
    loading.value = false;
  }
}

function onSaved(next: TaskDetail) {
  task.value = next;
}

async function removeTask() {
  if (!task.value) return;

  try {
    await ElMessageBox.confirm(
      `确认删除任务「${task.value.title}」？删除后任务从需求中移除，历史流水与产物保留。`,
      "删除任务",
      { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" }
    );
  } catch {
    return;
  }

  try {
    await deleteTask(task.value.id);
    ElMessage.success("任务已删除");
    router.push(`/reqs/${task.value.requirement.id}`);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "删除任务失败"));
  }
}

onMounted(load);
</script>

<template>
  <div v-loading="loading" class="page-stack">
    <div class="crumb">
      <el-button link :icon="ArrowLeft" @click="router.push('/reqs')">需求管理</el-button>
      <span class="crumb-sep">/</span>
      <el-button v-if="task" link @click="router.push(`/reqs/${task.requirement.id}`)">
        {{ task.requirement.code }}
      </el-button>
      <span class="crumb-sep">/</span>
      <span>{{ task?.title ?? "任务详情" }}</span>
    </div>

    <template v-if="task">
      <section class="detail-card">
        <div class="detail-top">
          <div class="detail-main">
            <div class="detail-code">{{ task.requirement.code }} · 任务</div>
            <h2 class="detail-title">{{ task.title }}</h2>
            <p class="detail-desc">{{ task.description || "暂无任务描述" }}</p>
          </div>
          <div class="detail-badges">
            <span class="pri" :class="PRIORITY_META[task.priority].cls">
              {{ PRIORITY_META[task.priority].label }}
            </span>
            <span class="task-status" :class="statusMeta?.cls">{{ task.statusLabel }}</span>
            <span v-if="task.overdueType" class="overdue-tag">
              {{ task.overdueType === "dev" ? "开发超时" : "测试超时" }}
            </span>
          </div>
        </div>

        <div class="detail-meta">
          <span>任务负责人 <b>{{ task.owner.name }}</b></span>
          <span>开始 <b>{{ formatDate(task.startAt) }}</b></span>
          <span>截止 <b>{{ formatDate(task.dueAt) }}</b></span>
          <span>CI 流水 <b>{{ task.pipelineCount }}</b></span>
          <span>进度 <b>{{ task.progress }}%</b></span>
        </div>

        <div class="detail-actions">
          <el-button v-if="auth.isAdmin" type="danger" plain :icon="Delete" @click="removeTask">
            删除任务
          </el-button>
          <el-button
            v-if="auth.hasPermission('task_create')"
            type="primary"
            :icon="Edit"
            @click="editVisible = true"
          >
            编辑任务
          </el-button>
        </div>
      </section>

      <section class="tab-card">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="概览" name="overview">
            <div class="overview-grid">
              <div class="overview-item">
                <span class="ov-label">所属需求</span>
                <b>{{ task.requirement.code }} · {{ task.requirement.title }}</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">任务负责人</span>
                <b>{{ task.owner.name }}（{{ task.owner.account }}）</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">优先级</span>
                <b>{{ PRIORITY_META[task.priority].label }}</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">当前状态</span>
                <b>{{ task.statusLabel }}</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">最近状态变更</span>
                <b>{{ formatDate(task.statusAt) }}</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">创建时间</span>
                <b>{{ formatDate(task.createdAt) }}</b>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="CI 流水" name="pipelines">
            <div class="tab-empty">
              流水模块即将接入：在任务下新建 CI 流水，选择应用与 Feature 分支后执行合并、打包与验证。
            </div>
          </el-tab-pane>

          <el-tab-pane label="提交记录" name="commits">
            <div class="tab-empty">提交记录将在流水接入后读取任务的 Feature 分支最近提交。</div>
          </el-tab-pane>

          <el-tab-pane label="构建记录" name="builds">
            <div class="tab-empty">构建记录将在打包执行器接入后展示每次构建的日志与产物。</div>
          </el-tab-pane>
        </el-tabs>
      </section>

      <TaskFormDialog v-model="editVisible" :task="task" @saved="onSaved" />
    </template>

    <section v-else-if="!loading" class="empty-card">
      <div class="empty-title">任务不存在或已被删除</div>
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
.tab-card {
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
  flex-wrap: wrap;
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

.task-status {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
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
  color: #b91c1c;
  font-size: 10.5px;
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 14px;
  border: 1px solid var(--line-soft);
  border-radius: 9px;
  background: #f8fafc;
}

.ov-label {
  color: var(--muted);
  font-size: 11px;
}

.overview-item b {
  font-size: 13px;
  font-weight: 500;
}

.tab-empty {
  padding: 34px 24px;
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
</style>
