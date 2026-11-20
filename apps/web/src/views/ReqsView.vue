<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import { listRequirements } from "@/api/requirements";
import { getErrorMessage } from "@/api/http";
import { useAuthStore } from "@/stores/auth";
import RequirementFormDialog from "@/components/requirements/RequirementFormDialog.vue";
import type { Person, Requirement, RequirementPriority } from "@/types";

const auth = useAuthStore();
const router = useRouter();

const filters = reactive({
  keyword: "",
  priority: ""
});

const requirements = ref<Requirement[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);

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

async function load() {
  loading.value = true;
  try {
    requirements.value = await listRequirements({
      keyword: filters.keyword.trim() || undefined,
      priority: filters.priority || undefined
    });
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载需求列表失败"));
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = "";
  filters.priority = "";
  load();
}

function openDetail(requirement: Requirement) {
  router.push(`/reqs/${requirement.id}`);
}

function peopleText(people: Person[]): string {
  return people.map((person) => person.name).join("、");
}

function dueText(requirement: Requirement): string {
  if (!requirement.dueAt) return "—";
  return new Date(requirement.dueAt).toLocaleDateString("zh-CN");
}

function onSaved() {
  load();
}

onMounted(load);
</script>

<template>
  <div class="page-stack">
    <section class="toolbar-card">
      <div class="toolbar-head">
        <div>
          <h2>需求管理</h2>
          <p>
            需求不绑定应用；应用在任务的 CI 流水里选择。开发负责人拆任务并指定任务负责人，测试负责人登记参与测试的测试人员。
          </p>
        </div>
        <div class="toolbar-actions">
          <el-button :icon="Refresh" @click="load">刷新</el-button>
          <el-button
            v-if="auth.hasPermission('req_create')"
            type="primary"
            :icon="Plus"
            @click="dialogVisible = true"
          >
            新建需求
          </el-button>
        </div>
      </div>

      <div class="filter-row">
        <el-input
          v-model="filters.keyword"
          class="filter-input"
          placeholder="搜索需求编号 / 标题 / 描述"
          clearable
          @keyup.enter="load"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select v-model="filters.priority" class="filter-select" placeholder="全部优先级" clearable>
          <el-option label="P0 · 最高" value="P0" />
          <el-option label="P1 · 高" value="P1" />
          <el-option label="P2 · 普通" value="P2" />
        </el-select>

        <el-button type="primary" :icon="Search" @click="load">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
        <span class="muted-text">{{ requirements.length }} 条需求</span>
      </div>
    </section>

    <section v-loading="loading" class="req-section">
      <div v-if="requirements.length" class="req-grid">
        <article
          v-for="requirement in requirements"
          :key="requirement.id"
          class="req-card"
          @click="openDetail(requirement)"
        >
          <div class="req-top">
            <span class="req-code">{{ requirement.code }}</span>
            <span class="pri" :class="PRIORITY_META[requirement.priority].cls">
              {{ PRIORITY_META[requirement.priority].label }}
            </span>
          </div>

          <h3 class="req-title">{{ requirement.title }}</h3>
          <p class="req-desc">{{ requirement.description || "暂无描述" }}</p>

          <div class="req-people">
            <span>开发 <b>{{ requirement.devOwner.name }}</b></span>
            <span>测试 <b>{{ requirement.qaOwner.name }}</b></span>
            <span>产品 <b>{{ requirement.pmOwner.name }}</b></span>
          </div>

          <div v-if="requirement.qaMembers.length" class="req-members">
            测试人员：{{ peopleText(requirement.qaMembers) }}
          </div>

          <div class="req-foot">
            <span class="pill" :class="STATUS_CLASS[requirement.status] || 'st-soft'">
              {{ requirement.statusLabel }}
            </span>
            <span class="muted-text">任务 {{ requirement.taskCount }}</span>
            <span class="muted-text due">截止 {{ dueText(requirement) }}</span>
          </div>
        </article>
      </div>

      <div v-else class="empty-card">
        <div class="empty-title">暂无需求</div>
        <p>新建一条需求，再把它拆成可以交付的任务。</p>
        <el-button
          v-if="auth.hasPermission('req_create')"
          type="primary"
          :icon="Plus"
          @click="dialogVisible = true"
        >
          新建需求
        </el-button>
      </div>
    </section>

    <RequirementFormDialog v-model="dialogVisible" @saved="onSaved" />
  </div>
</template>

<style scoped>
.req-section {
  min-height: 160px;
}

.req-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 14px;
}

.req-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 17px 18px 14px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}

.req-card:hover {
  border-color: #bfd3fb;
  transform: translateY(-1px);
}

.req-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.req-code {
  color: var(--muted);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}

.pri {
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10.5px;
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

.req-title {
  margin: 0;
  font-size: 15px;
  line-height: 1.45;
}

.req-desc {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.req-people {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  color: var(--muted);
  font-size: 11.5px;
}

.req-people b {
  color: var(--ink-2);
  font-weight: 500;
}

.req-members {
  color: var(--muted);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.req-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px dashed var(--line);
}

.req-foot .due {
  margin-left: auto;
}

.pill {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 10.5px;
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

.empty-card {
  padding: 44px 24px;
  background: #ffffff;
  border: 1px dashed var(--line);
  border-radius: 14px;
  text-align: center;
}

.empty-title {
  font-size: 17px;
  font-weight: 600;
}

.empty-card p {
  margin: 8px 0 16px;
  color: var(--muted);
  font-size: 12.5px;
}
</style>
