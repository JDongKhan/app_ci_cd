<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, Search } from "@element-plus/icons-vue";
import { listLogModules, listLogs } from "@/api/logs";
import { getErrorMessage } from "@/api/http";
import { ROLE_META } from "@/config/permissions";
import type { AuditAction, AuditLogRecord, Role } from "@/types";

const ACTION_META: Record<
  AuditAction,
  { label: string; type: "success" | "warning" | "danger" }
> = {
  create: { label: "新增", type: "success" },
  update: { label: "更新", type: "warning" },
  delete: { label: "删除", type: "danger" }
};

const logs = ref<AuditLogRecord[]>([]);
const modules = ref<string[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const actionFilter = ref("");
const moduleFilter = ref("");
const keyword = ref("");

function formatDateTime(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function actionMeta(action: AuditAction) {
  return ACTION_META[action] ?? { label: action, type: "info" as const };
}

function roleLabel(role: Role | null): string {
  if (!role) return "—";
  return ROLE_META[role]?.label ?? role;
}

async function load() {
  loading.value = true;
  try {
    const result = await listLogs({
      page: page.value,
      pageSize: pageSize.value,
      action: actionFilter.value || undefined,
      module: moduleFilter.value || undefined,
      keyword: keyword.value.trim() || undefined
    });
    logs.value = result.items;
    total.value = result.total;
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载操作日志失败"));
  } finally {
    loading.value = false;
  }
}

async function loadModules() {
  try {
    modules.value = await listLogModules();
  } catch {
    modules.value = [];
  }
}

function search() {
  page.value = 1;
  load();
}

function resetFilters() {
  actionFilter.value = "";
  moduleFilter.value = "";
  keyword.value = "";
  page.value = 1;
  load();
}

function onPageChange(value: number) {
  page.value = value;
  load();
}

function onSizeChange(value: number) {
  pageSize.value = value;
  page.value = 1;
  load();
}

onMounted(() => {
  load();
  loadModules();
});
</script>

<template>
  <div class="page-stack">
    <section class="page-head">
      <div>
        <h1>操作日志</h1>
        <p class="sub">
          记录服务端关键操作（新增、更新、删除）的执行人、内容与结果；查询类操作不记录。
        </p>
      </div>
      <div class="head-actions">
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </section>

    <section class="page-toolbar">
      <el-input
        v-model="keyword"
        class="keyword-input"
        placeholder="操作人 / 内容 / 模块"
        clearable
        @keyup.enter="search"
        @clear="search"
      />
      <el-select
        v-model="actionFilter"
        class="filter-select"
        placeholder="全部动作"
        clearable
        @change="search"
      >
        <el-option label="新增" value="create" />
        <el-option label="更新" value="update" />
        <el-option label="删除" value="delete" />
      </el-select>
      <el-select
        v-model="moduleFilter"
        class="filter-select"
        placeholder="全部模块"
        clearable
        filterable
        @change="search"
      >
        <el-option v-for="item in modules" :key="item" :label="item" :value="item" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="search">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
      <span class="muted-text">共 {{ total }} 条</span>
    </section>

    <section v-loading="loading" class="table-card">
      <el-table v-if="logs.length" :data="logs" stripe empty-text="暂无操作日志">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="log-detail">
              <p class="log-detail-title">
                请求：{{ row.method }} {{ row.path }} · HTTP {{ row.statusCode }}
              </p>
              <p class="log-detail-title">请求参数：</p>
              <pre class="log-payload">{{ row.payload || "无" }}</pre>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>

        <el-table-column label="操作人" min-width="170">
          <template #default="{ row }">
            <div class="log-actor-name">{{ row.actorName }}</div>
            <div class="log-actor-account">
              {{ row.actorAccount || "—" }} · {{ roleLabel(row.actorRole) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="动作" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="actionMeta(row.action).type">
              {{ actionMeta(row.action).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="模块" width="110">
          <template #default="{ row }">{{ row.module }}</template>
        </el-table-column>

        <el-table-column label="操作内容" min-width="240">
          <template #default="{ row }">{{ row.summary }}</template>
        </el-table-column>

        <el-table-column label="结果" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="row.statusCode < 400 ? 'success' : 'danger'">
              {{ row.statusCode < 400 ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="empty-state">
        <div class="empty-title">暂无操作日志</div>
        <p>新增、更新、删除等关键操作后，这里会出现记录。</p>
      </div>

      <div v-if="total > 0" class="log-pager">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.keyword-input {
  width: 220px;
}

.log-actor-name {
  font-weight: 500;
}

.log-actor-account {
  margin-top: 2px;
  color: var(--muted);
  font-size: 11px;
}

.log-detail {
  padding: 4px 16px 12px;
}

.log-detail-title {
  margin: 0 0 6px;
  color: var(--muted);
  font-size: 12px;
}

.log-payload {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f8fafc;
  color: var(--ink-2);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 220px;
  overflow: auto;
}

.log-pager {
  display: flex;
  justify-content: flex-end;
  padding: 14px 4px 2px;
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
}

.empty-state p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 12.5px;
}
</style>
