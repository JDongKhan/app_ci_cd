<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { listBoard } from "@/api/tasks";
import { getErrorMessage } from "@/api/http";
import { PRIORITY_META, TASK_STATUS_META } from "@/config/tasks";
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

function formatDate(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("zh-CN");
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
    <section class="toolbar-card">
      <div class="toolbar-head">
        <div>
          <h2>任务看板</h2>
          <p>看板只看任务状态：未开始 / 开发中 / 已提测 / 测试中 / 待发布 / 超时 / 已结束。合并、打包、验证都在任务详情里操作。</p>
        </div>
        <div class="toolbar-actions">
          <el-button :icon="Refresh" @click="load">刷新</el-button>
        </div>
      </div>
    </section>

    <section v-loading="loading" class="board">
      <div v-for="column in grouped" :key="column.key" class="board-col" :class="`col-${column.key}`">
        <div class="col-head">
          <span>{{ column.label }}</span>
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
              <span class="card-pri" :class="PRIORITY_META[task.priority].cls">
                {{ task.priority }}
              </span>
            </div>
            <div class="card-title">{{ task.title }}</div>
            <div class="card-owner">{{ task.owner.name }}</div>
            <div class="card-foot">
              <span class="card-status" :class="TASK_STATUS_META[task.status]?.cls">
                {{ task.statusLabel }}
              </span>
              <span v-if="task.overdueType" class="card-overdue">
                {{ task.overdueType === "dev" ? "开发超时" : "测试超时" }}
              </span>
              <span v-else class="card-due">{{ formatDate(task.dueAt) }}</span>
            </div>
          </article>
          <div v-if="!column.items.length" class="col-empty">暂无任务</div>
        </div>
      </div>
    </section>

    <TaskDrawer v-model="taskDrawerVisible" :task-id="selectedTaskId" />
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(7, minmax(210px, 1fr));
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.board-col {
  display: flex;
  flex-direction: column;
  min-height: 320px;
  padding: 12px;
  background: #eef2f7;
  border-radius: 12px;
}

.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-2);
}

.col-count {
  padding: 0 7px;
  border-radius: 999px;
  background: #ffffff;
  color: var(--muted);
  font-size: 10.5px;
}

.col-sub {
  margin: 2px 0 10px;
  color: var(--muted);
  font-size: 10.5px;
}

.col-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.board-card {
  padding: 10px 11px;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 9px;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}

.board-card:hover {
  border-color: #bfd3fb;
  transform: translateY(-1px);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.card-req {
  color: var(--muted);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
}

.card-pri {
  padding: 0 6px;
  border-radius: 4px;
  font-size: 9.5px;
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

.card-title {
  margin-top: 5px;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.45;
}

.card-owner {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10.5px;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 8px;
}

.card-status {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 9.5px;
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

.card-overdue {
  color: #b91c1c;
  font-size: 9.5px;
}

.card-due {
  color: var(--muted);
  font-size: 9.5px;
}

.col-empty {
  padding: 18px 6px;
  color: var(--muted);
  font-size: 11px;
  text-align: center;
}

@media (max-width: 960px) {
  .board {
    grid-template-columns: repeat(7, minmax(190px, 1fr));
  }
}
</style>
