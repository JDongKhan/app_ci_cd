<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { ArrowRight, Refresh } from "@element-plus/icons-vue";
import { listMyTasks } from "@/api/tasks";
import { listMyRequirements } from "@/api/requirements";
import { getErrorMessage } from "@/api/http";
import { useAuthStore } from "@/stores/auth";
import { LEVEL_META, ROLE_META } from "@/config/permissions";
import { REQUIREMENT_STATUS_CLASS, TASK_STATUS_META } from "@/config/tasks";
import RequirementDrawer from "@/components/requirements/RequirementDrawer.vue";
import TaskDrawer from "@/components/tasks/TaskDrawer.vue";
import type { Requirement, TaskSummary } from "@/types";

const auth = useAuthStore();

const tasks = ref<TaskSummary[]>([]);
const requirements = ref<Requirement[]>([]);
const loading = ref(false);
const activeTab = ref("ongoing");
const taskDrawerVisible = ref(false);
const selectedTaskId = ref("");
const reqDrawerVisible = ref(false);
const selectedRequirementId = ref("");

const roleLabel = computed(() =>
  auth.user ? ROLE_META[auth.user.role]?.label ?? auth.user.role : ""
);
const levelLabel = computed(() => {
  if (!auth.user?.level) return "管理员";
  return LEVEL_META[auth.user.level] ?? auth.user.level;
});

const ongoingStatuses = computed<string[]>(() => {
  if (auth.isAdmin || auth.user?.role === "pm") return [];
  if (auth.user?.role === "qa") return ["ready", "testing", "release"];
  return ["none", "dev"];
});

const ongoingTasks = computed(() => {
  if (auth.isAdmin || auth.user?.role === "pm") {
    return tasks.value.filter((task) => task.status !== "done");
  }
  return tasks.value.filter((task) => ongoingStatuses.value.includes(task.status));
});

const otherTasks = computed(() => {
  if (auth.isAdmin || auth.user?.role === "pm") {
    return tasks.value.filter((task) => task.status === "done");
  }
  return tasks.value.filter((task) => !ongoingStatuses.value.includes(task.status));
});

const devOverdue = computed(
  () => tasks.value.filter((task) => task.overdueType === "dev").length
);
const testOverdue = computed(
  () => tasks.value.filter((task) => task.overdueType === "test").length
);
const activeCount = computed(
  () => tasks.value.filter((task) => task.status !== "done").length
);
const doneCount = computed(
  () => tasks.value.filter((task) => task.status === "done").length
);

const tabs = computed(() => [
  {
    key: "ongoing",
    label: "进行中",
    count: ongoingTasks.value.length,
    hint: "只看当前阶段归我处理的任务"
  },
  {
    key: "other",
    label: "其他状态",
    count: otherTasks.value.length,
    hint: "已交接 / 超时 / 已结束，仍可跟踪"
  },
  {
    key: "requirements",
    label: "我的需求",
    count: requirements.value.length,
    hint: "只显示我是开发 / 测试 / 产品负责人的需求"
  }
]);

const activeTabMeta = computed(
  () => tabs.value.find((tab) => tab.key === activeTab.value) ?? tabs.value[0]
);

const visibleTasks = computed(() =>
  activeTab.value === "other" ? otherTasks.value : ongoingTasks.value
);

function progressPercent(task: TaskSummary): number {
  return Math.min(100, Math.max(0, Math.round(((task.progress ?? 0) / 4) * 100)));
}


function formatDate(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("zh-CN");
}

function statusClass(status: string): string {
  return TASK_STATUS_META[status as keyof typeof TASK_STATUS_META]?.cls ?? "ts-none";
}

function reqStatusClass(status: string): string {
  return REQUIREMENT_STATUS_CLASS[status] ?? "ts-none";
}

async function load() {
  loading.value = true;
  try {
    const [taskList, requirementList] = await Promise.all([
      listMyTasks(),
      listMyRequirements()
    ]);
    tasks.value = taskList;
    requirements.value = requirementList;
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载首页数据失败"));
  } finally {
    loading.value = false;
  }
}

function openTask(task: TaskSummary) {
  selectedTaskId.value = task.id;
  taskDrawerVisible.value = true;
}

function openRequirement(requirement: Requirement) {
  selectedRequirementId.value = requirement.id;
  reqDrawerVisible.value = true;
}

onMounted(load);
</script>

<template>
  <div class="page-stack">
    <section class="page-head">
      <div>
        <h1>你好，{{ auth.user?.name }}</h1>
        <p class="sub">
          {{ roleLabel }}{{ auth.user?.level ? ` · ${levelLabel}` : "" }} 视角 · 进行中
          {{ activeCount }} 个，开发超时 {{ devOverdue }} 个，测试超时 {{ testOverdue }} 个。
        </p>
      </div>
      <div class="head-actions">
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </section>

    <section class="stats">
      <div class="stat">
        <div class="stat-k">我的任务</div>
        <div class="stat-v">{{ tasks.length }}</div>
        <div class="stat-n">按你的角色负责人归属</div>
      </div>
      <div class="stat">
        <div class="stat-k">进行中</div>
        <div class="stat-v">{{ activeCount }}</div>
        <div class="stat-n">未结束的任务</div>
      </div>
      <div class="stat">
        <div class="stat-k">开发超时</div>
        <div class="stat-v over">{{ devOverdue }}</div>
        <div class="stat-n">未开始 / 开发中且超过截止</div>
      </div>
      <div class="stat">
        <div class="stat-k">测试超时</div>
        <div class="stat-v over">{{ testOverdue }}</div>
        <div class="stat-n">提测后超过截止</div>
      </div>
      <div class="stat">
        <div class="stat-k">已结束</div>
        <div class="stat-v">{{ doneCount }}</div>
        <div class="stat-n">任务已发布并归档</div>
      </div>
    </section>

    <section class="home-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="htab"
        :class="{ on: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}<span class="cnt">{{ tab.count }}</span>
      </button>
      <span class="htab-hint">{{ activeTabMeta.hint }}</span>
    </section>

    <section v-loading="loading" class="table-card">
      <div class="card-head">
        <h3>{{ activeTabMeta.label }} · {{ activeTabMeta.count }} 条</h3>
        <span class="muted-text">
          {{ activeTab === "requirements" ? "点卡片打开需求详情" : "点任务打开详情，合并 / 打包在任务详情里操作" }}
        </span>
      </div>

      <el-table
        v-if="activeTab !== 'requirements' && visibleTasks.length"
        :data="visibleTasks"
        class="home-table"
        @row-click="openTask"
      >
        <el-table-column label="任务" min-width="240">
          <template #default="{ row }">
            <div class="task-title">{{ row.title }}</div>
            <div class="task-sub">{{ row.requirement?.code }} · {{ row.owner.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <span class="task-status" :class="statusClass(row.status)">{{ row.statusLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="开始 - 结束" width="200">
          <template #default="{ row }">
            <span class="task-range">
              {{ formatDate(row.startAt) }} ~ {{ formatDate(row.dueAt) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="150">
          <template #default="{ row }">
            <div class="pbar"><span :style="{ width: `${progressPercent(row)}%` }"></span></div>
            <div class="pbar-t">{{ progressPercent(row) }}%</div>
          </template>
        </el-table-column>
        <el-table-column label="" width="90" align="right">
          <template #default="{ row }">
            <el-button size="small" @click.stop="openTask(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-else-if="activeTab !== 'requirements'" class="empty-hint">
        {{ activeTab === "ongoing" ? "当前没有归你阶段的任务。" : "没有其他状态的任务。" }}
      </div>

      <div v-else-if="requirements.length" class="home-req-list">
        <button
          v-for="requirement in requirements"
          :key="requirement.id"
          type="button"
          class="home-req"
          @click="openRequirement(requirement)"
        >
          <span class="home-req-main">
            <span class="home-req-code">{{ requirement.code }}</span>
            <b>{{ requirement.title }}</b>
            <small>
              开发 {{ requirement.devOwner.name }} · 测试 {{ requirement.qaOwner.name }} ·
              产品 {{ requirement.pmOwner.name }}
            </small>
          </span>
          <span class="home-req-side">
            <span class="task-status" :class="reqStatusClass(requirement.status)">
              {{ requirement.statusLabel }}
            </span>
            <el-icon><ArrowRight /></el-icon>
          </span>
        </button>
      </div>
      <div v-else class="empty-hint">还没有和你相关的需求。</div>
    </section>

    <RequirementDrawer v-model="reqDrawerVisible" :requirement-id="selectedRequirementId" />
    <TaskDrawer v-model="taskDrawerVisible" :task-id="selectedTaskId" />
  </div>
</template>

<style scoped>
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--line-soft);
}

.card-head h3 {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
}

.home-table {
  width: 100%;
  font-size: 12.5px;
}

.home-table :deep(.el-table__row) {
  cursor: pointer;
}

.task-title {
  font-weight: 500;
}

.task-sub {
  margin-top: 2px;
  color: var(--muted);
  font-size: 11px;
}

.task-range {
  color: var(--ink-2);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
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

.empty-hint {
  padding: 34px 12px;
  color: var(--muted);
  font-size: 12.5px;
  text-align: center;
}

.home-req-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.home-req {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: #ffffff;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}

.home-req:hover {
  border-color: #bfd3fb;
  background: #f8fbff;
}

.home-req-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.home-req-code {
  color: var(--muted);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10.5px;
}

.home-req-main b {
  font-size: 13.5px;
}

.home-req-main small {
  color: var(--muted);
  font-size: 11px;
}

.home-req-side {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  color: var(--muted);
}
</style>
