<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Document, Plus, Refresh } from "@element-plus/icons-vue";
import { listApps } from "@/api/apps";
import {
  addAppComponents,
  listAppComponents,
  removeAppComponent
} from "@/api/components";
import { getErrorMessage } from "@/api/http";
import { useAuthStore } from "@/stores/auth";
import type { AppComponentRecord, AppRecord } from "@/types";

const auth = useAuthStore();

const apps = ref<AppRecord[]>([]);
const components = ref<AppComponentRecord[]>([]);
const selectedAppId = ref("");
const loading = ref(false);

const addVisible = ref(false);
const addAppId = ref("");
const addExisting = ref<Set<string>>(new Set());
const pickedIds = ref<string[]>([]);
const submitting = ref(false);

const apiVisible = ref(false);

const hostApps = computed(() => apps.value.filter((app) => !app.isComponent));
const componentApps = computed(() => apps.value.filter((app) => app.isComponent));
const selectedApp = computed(
  () => hostApps.value.find((app) => app.id === selectedAppId.value) ?? null
);
const canEdit = computed(() => auth.hasPermission("component_edit"));

const availableComponents = computed(() =>
  componentApps.value.filter((app) => !addExisting.value.has(app.id))
);

const apiSample = computed(() =>
  JSON.stringify(
    {
      appCode: selectedApp.value?.code ?? "",
      appName: selectedApp.value?.name ?? "",
      components: components.value.map((row) => ({
        name: row.component.name,
        code: row.component.code,
        repo: row.component.repo,
        version: row.version ?? "—"
      }))
    },
    null,
    2
  )
);

const versionSample = computed(() =>
  JSON.stringify(
    {
      appCode: selectedApp.value?.code ?? "{应用标识}",
      componentCode: components.value[0]?.component.code ?? "{组件标识}",
      version: components.value[0]?.version ?? "1.0.0"
    },
    null,
    2
  )
);

const versionResponseSample = computed(() => {
  const first = components.value[0]?.component;
  return JSON.stringify(
    {
      appCode: selectedApp.value?.code ?? "{应用标识}",
      appName: selectedApp.value?.name ?? "{应用名称}",
      componentCode: first?.code ?? "{组件标识}",
      componentName: first?.name ?? "{组件名称}",
      version: components.value[0]?.version ?? "1.0.0",
      component: {
        id: first?.id ?? "{组件应用ID}",
        name: first?.name ?? "{组件名称}",
        code: first?.code ?? "{组件标识}",
        repo: first?.repo ?? "{项目地址}",
        platform: first?.platform ?? "{平台}",
        isComponent: true
      }
    },
    null,
    2
  );
});

function formatDateTime(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

async function loadApps() {
  try {
    apps.value = await listApps();
    if (!selectedAppId.value && hostApps.value.length) {
      selectedAppId.value = hostApps.value[0].id;
    }
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载应用列表失败"));
  }
}

async function loadComponents() {
  if (!selectedAppId.value) {
    components.value = [];
    return;
  }

  loading.value = true;
  try {
    components.value = await listAppComponents(selectedAppId.value);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载组件列表失败"));
  } finally {
    loading.value = false;
  }
}

async function loadAddExisting() {
  addExisting.value = new Set();
  pickedIds.value = [];
  if (!addAppId.value) return;

  try {
    const rows = await listAppComponents(addAppId.value);
    addExisting.value = new Set(rows.map((row) => row.component.id));
  } catch {
    addExisting.value = new Set();
  }
}

function openAdd() {
  addAppId.value = selectedAppId.value || hostApps.value[0]?.id || "";
  pickedIds.value = [];
  addVisible.value = true;
  void loadAddExisting();
}

async function submitAdd() {
  if (!addAppId.value) {
    ElMessage.warning("请选择应用");
    return;
  }
  if (!pickedIds.value.length) {
    ElMessage.warning("请至少选择一个组件");
    return;
  }

  submitting.value = true;
  try {
    await addAppComponents(addAppId.value, pickedIds.value);
    ElMessage.success("组件已添加");
    addVisible.value = false;
    selectedAppId.value = addAppId.value;
    await loadComponents();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "添加组件失败"));
  } finally {
    submitting.value = false;
  }
}

async function remove(row: AppComponentRecord) {
  try {
    await ElMessageBox.confirm(
      `确认移除组件「${row.component.name}」？`,
      "移除组件",
      { type: "warning", confirmButtonText: "移除", cancelButtonText: "取消" }
    );
  } catch {
    return;
  }

  try {
    await removeAppComponent(selectedAppId.value, row.component.id);
    ElMessage.success("组件已移除");
    await loadComponents();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "移除组件失败"));
  }
}

watch(selectedAppId, () => {
  void loadComponents();
});

onMounted(loadApps);
</script>

<template>
  <div class="page-stack">
    <section class="page-head">
      <div>
        <h1>组件管理</h1>
        <p class="sub">
          按应用维护组件列表；在「应用配置」勾选「组件」的应用只作为依赖，不产出安装包。
        </p>
      </div>
      <div class="head-actions">
        <el-button :icon="Document" @click="apiVisible = true">获取版本接口</el-button>
        <el-button v-permission:disable="'component_edit'" type="primary" :icon="Plus" @click="openAdd">
          新增组件
        </el-button>
      </div>
    </section>

    <section class="page-toolbar">
      <el-select
        v-model="selectedAppId"
        class="app-select"
        placeholder="选择应用"
        filterable
      >
        <el-option
          v-for="app in hostApps"
          :key="app.id"
          :label="`${app.name} · ${app.code}`"
          :value="app.id"
        />
      </el-select>
      <span class="muted-text">{{ components.length }} 个组件</span>
      <el-button :icon="Refresh" @click="loadComponents">刷新</el-button>
    </section>

    <section v-loading="loading" class="table-card">
      <el-table v-if="components.length" :data="components" class="component-table">
        <el-table-column label="组件名称" min-width="200">
          <template #default="{ row }">
            <div class="comp-name">{{ row.component.name }}</div>
            <div class="comp-code">{{ row.component.code }}</div>
          </template>
        </el-table-column>
        <el-table-column label="仓库地址" min-width="280">
          <template #default="{ row }">
            <span class="mono">{{ row.component.repo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本号" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.version || "—" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="添加时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column v-if="canEdit" label="" width="90" align="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="remove(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">
        <div class="empty-title">该应用还没有组件</div>
        <p>点右上角「新增组件」，先选应用，再勾选组件应用。</p>
      </div>
    </section>

    <el-dialog v-model="addVisible" title="新增组件" width="540px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="应用">
          <el-select
            v-model="addAppId"
            class="full-width"
            placeholder="选择应用"
            @change="loadAddExisting"
          >
            <el-option
              v-for="app in hostApps"
              :key="app.id"
              :label="`${app.name} · ${app.code}`"
              :value="app.id"
            />
          </el-select>
          <span class="field-hint">只列出未勾选「组件」的应用。</span>
        </el-form-item>

        <el-form-item label="组件列表">
          <div v-if="availableComponents.length" class="comp-pool">
            <label
              v-for="app in availableComponents"
              :key="app.id"
              class="comp-option"
            >
              <el-checkbox v-model="pickedIds" :value="app.id">
                <b>{{ app.name }}</b>
                <span class="comp-option-meta">{{ app.code }}</span>
              </el-checkbox>
            </label>
          </div>
          <span v-else class="muted-text">
            没有可添加的组件应用，请先在「应用配置」勾选「组件」。
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitAdd">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="apiVisible" title="获取组件版本" width="600px">
      <p class="api-hint">构建脚本按应用标识拉取组件列表与版本：</p>
      <pre class="api-code">GET /api/components?appCode={{ selectedApp?.code || "{应用标识}" }}</pre>
      <pre class="api-code">{{ apiSample }}</pre>

      <p class="api-hint api-hint-gap">
        组件合并代码并推送仓库后，调用下面接口更新版本号：
      </p>
      <pre class="api-code">POST /api/components/version
Content-Type: application/json

{{ versionSample }}</pre>
      <p class="api-hint">返回更新后的版本与组件应用信息（含项目地址）：</p>
      <pre class="api-code">{{ versionResponseSample }}</pre>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-select {
  width: 340px;
}

.component-table {
  width: 100%;
}

.comp-name {
  font-weight: 500;
}

.comp-code {
  margin-top: 2px;
  color: var(--muted);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}

.mono {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
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

.comp-pool {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.comp-option {
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfe;
  cursor: pointer;
}

.comp-option:hover {
  border-color: #c9d9f8;
}

.comp-option-meta {
  margin-left: 8px;
  color: var(--muted);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}

.api-hint {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 12.5px;
}

.api-hint-gap {
  margin-top: 16px;
}

.api-code {
  margin: 0 0 8px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink-2);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 240px;
  overflow: auto;
}
</style>
