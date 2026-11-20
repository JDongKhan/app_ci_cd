<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { listBoard } from "@/api/tasks";
import { getErrorMessage } from "@/api/http";
import { TASK_STATUS_META } from "@/config/tasks";
import TaskDrawer from "@/components/tasks/TaskDrawer.vue";
import type { TaskSummary } from "@/types";

const tasks = ref<TaskSummary[]>([]);
const loading = ref(false);
const taskDrawerVisible = ref(false);
const selectedTaskId = ref("");

const columns = [
  {
    key: "none",
    label: "未开始",
    hint: "开发还没开始",
    pick: (task: TaskSummary) => task.status === "none" && !task.overdueType
  },
  {
    key: "dev",
    label: "开发中",
    hint: "开发实现中",
    pick: (task: TaskSummary) => task.status === "dev" && !task.overdueType
  },
  {
    key: "ready",
    label: "已提测",
    hint: "等待测试开始",
    pick: (task: TaskSummary) => task.status === "ready" && !task.overdueType
  },
  {
    key: "testing",
    label: "测试中",
    hint: "测试验证中",
    pick: (task: TaskSummary) => task.status === "testing" && !task.overdueType
  },
  {
    key: "release",
    label: "待发布",
    hint: "等待发布验证",
    pick: (task: TaskSummary) => task.status === "release" && !task.overdueType
  },
  {
    key: "overdue",
    label: "超时",
    hint: "开发或测试超时",
    pick: (task: TaskSummary) => Boolean(task.overdueType)
  },
  {
    key: "done",
    label: "已结束",
    hint: "任务已完成",
    pick: (task: TaskSummary) => task.status === "done"
  }
];

const grouped = computed(() =>
  columns.map((column) => ({
    ...column,
    items: tasks.value.filter(column.pick)
  }))
);

function filledStages(task: TaskSummary): number {
  return Math.min(4, Math.max(0, Math.round(task.progress ?? 0)));
}

function openTask(task: TaskSummary) {
  selectedTaskId.value = task.id;
  taskDrawerVisible.value = true;
}

async function load() {
  loading.value = true;
  try {
    tasks.value = await listBoard();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载任务看板失败"));
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-stack">
    <section class="page-head">
      <div>
        <h1>任务看板</h1>
        <p class="sub">
          看板只看任务状态（未开始 / 开发中 / 已提测 / 测试中 / 待发布 / 超时 / 已结束）·
          合并 / 打包 / 下载都在「任务详情 → CI 流水」里操作
        </p>
      </div>
      <div class="head-actions">
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </section>

    <section v-loading="loading" class="board-wrap">
      <div class="board-stats">
        <div class="bs">
          <span>任务总数</span>
          <b>{{ tasks.length }}</b>
        </div>
        <div v-for="column in grouped" :key="column.key" class="bs">
          <span>{{ column.label }}</span>
          <b :class="{ hot: column.key === 'overdue' && column.items.length > 0 }">
            {{ column.items.length }}
          </b>
        </div>
      </div>

      <div class="board">
        <div
          v-for="column in grouped"
          :key="column.key"
          class="board-col"
          :class="`col-${column.key}`"
        >
          <div class="col-head">
            <span class="col-name">{{ column.label }}</span>
            <span class="col-count">{{ column.items.length }}</span>
          </div>
          <div class="col-sub">{{ column.hint }}</div>

          <div class="col-cards">
            <article
              v-for="task in column.items"
              :key="task.id"
              class="board-card"
              @click="openTask(task)"
            >
              <div class="card-top">
                <span class="card-req">{{ task.requirement?.code ?? "—" }}</span>
                <span class="card-owner">{{ task.owner.name }}</span>
              </div>
              <div class="card-title">{{ task.title }}</div>
              <div class="stage-dots">
                <span
                  v-for="index in 4"
                  :key="index"
                  class="sd"
                  :class="{ on: index <= filledStages(task) }"
                ></span>
              </div>
              <div class="card-foot">
                <span class="card-status" :class="TASK_STATUS_META[task.status]?.cls">
                  {{ task.statusLabel }}
                </span>
                <span class="card-pipes">{{ task.pipelineCount }} 条流水</span>
              </div>
            </article>
            <div v-if="!column.items.length" class="col-empty">暂无任务</div>
          </div>
        </div>
      </div>
    </section>

    <TaskDrawer v-model="taskDrawerVisible" :task-id="selectedTaskId" />
  </div>
</template>

<style scoped>
.board-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  padding: 11px 15px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 11px;
}

.bs {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-right: 18px;
  border-right: 1px solid var(--line-soft);
  color: var(--muted);
  font-size: 11.5px;
}

.bs:last-child {
  padding-right: 0;
  border-right: 0;
}

.bs b {
  color: var(--ink);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}

.bs b.hot {
  color: #b45309;
}

.board {
  display: grid;
  grid-template-columns: repeat(7, minmax(200px, 1fr));
  gap: 10px;
  align-items: start;
  overflow-x: auto;
  padding-bottom: 6px;
}

.board-col {
  min-height: 280px;
  padding: 11px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 3px 8px;
  border-bottom: 1px solid var(--line-soft);
}

.col-name {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--ink-2);
  font-size: 12.5px;
  font-weight: 600;
}

.col-name::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
}

.col-dev .col-name::before {
  background: #3b82f6;
}

.col-ready .col-name::before {
  background: #8b5cf6;
}

.col-testing .col-name::before {
  background: #0d9488;
}

.col-release .col-name::before {
  background: #f59e0b;
}

.col-overdue .col-name::before {
  background: #ef4444;
}

.col-done .col-name::before {
  background: #22c55e;
}

.col-count {
  padding: 1px 7px;
  border-radius: 5px;
  background: #f4f6f9;
  color: var(--muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.col-sub {
  padding: 7px 3px 9px;
  color: #9aa8b8;
  font-size: 10.5px;
}

.col-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.board-card {
  padding: 10px 11px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 9px;
  cursor: pointer;
  transition: 0.15s;
}

.board-card:hover {
  border-color: #c9d6e8;
  box-shadow: 0 8px 20px -16px rgba(15, 23, 42, 0.5);
  transform: translateY(-1px);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
  font-size: 10.5px;
}

.card-req {
  color: #5b6b80;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.card-owner {
  margin-left: auto;
  color: #7d8a9b;
}

.card-title {
  display: -webkit-box;
  margin-bottom: 7px;
  overflow: hidden;
  color: #16202e;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.stage-dots {
  display: flex;
  gap: 3px;
  margin: 6px 0;
}

.sd {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #edf1f6;
}

.sd.on {
  background: #22c55e;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3px;
}

.card-status {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
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
  background: #f4f0ff;
  color: #5b46b0;
}

.ts-testing {
  background: #e8f5f2;
  color: #0f766e;
}

.ts-release {
  background: #fff5e6;
  color: #b45309;
}

.ts-done {
  background: #e9f7ee;
  color: #15803d;
}

.card-pipes {
  color: var(--muted);
  font-size: 10.5px;
}

.col-empty {
  padding: 20px 0;
  border: 1px dashed #e6ecf4;
  border-radius: 8px;
  color: #a5b1c2;
  font-size: 11.5px;
  text-align: center;
}
</style>
