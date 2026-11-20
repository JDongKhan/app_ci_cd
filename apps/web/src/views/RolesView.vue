<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  fetchRolePermissions,
  resetRolePermissions,
  saveRolePermissions
} from "@/api/roles";
import { getErrorMessage } from "@/api/http";
import {
  ALL_PERMISSIONS,
  EDITABLE_ROLES,
  LEVEL_META,
  PERMISSION_GROUPS,
  ROLE_LEVELS,
  ROLE_META,
  roleLevelKey
} from "@/config/permissions";
import type { EditableRole, Level, RolePermissionItem } from "@/types";

type Matrix = Record<string, Record<string, boolean>>;

interface MatrixColumn {
  key: string;
  role: EditableRole;
  level: Level;
  label: string;
}

const matrix = reactive<Matrix>({});
const loading = ref(false);
const saving = ref(false);
const dirty = ref(false);
const search = ref("");

const columns = computed<MatrixColumn[]>(() =>
  EDITABLE_ROLES.flatMap((role) =>
    ROLE_LEVELS[role].map((level) => ({
      key: roleLevelKey(role, level),
      role,
      level,
      label: `${ROLE_META[role].label} ${LEVEL_META[level]}`
    }))
  )
);

const filteredGroups = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return PERMISSION_GROUPS;

  return PERMISSION_GROUPS.map((group) => ({
    ...group,
    permissions: group.permissions.filter(
      (permission) =>
        permission.label.toLowerCase().includes(keyword) ||
        permission.key.toLowerCase().includes(keyword)
    )
  })).filter((group) => group.permissions.length > 0);
});

const grantablePermissions = computed(() => ALL_PERMISSIONS.filter((permission) => !permission.adminOnly));

const totalChecked = computed(() =>
  columns.value.reduce((total, column) => {
    return (
      total +
      grantablePermissions.value.filter((permission) => matrix[column.key]?.[permission.key]).length
    );
  }, 0)
);

function ensureMatrix() {
  for (const column of columns.value) {
    if (!matrix[column.key]) matrix[column.key] = {};
  }
}

function applyItems(items: RolePermissionItem[]) {
  for (const column of columns.value) {
    matrix[column.key] = {};
  }

  for (const item of items) {
    const key = roleLevelKey(item.role, item.level);
    if (!matrix[key]) matrix[key] = {};
    for (const permission of item.permissions) {
      matrix[key][permission] = true;
    }
  }
}

async function load() {
  loading.value = true;
  try {
    ensureMatrix();
    const result = await fetchRolePermissions();
    applyItems(result.items);
    dirty.value = false;
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载角色权限失败"));
  } finally {
    loading.value = false;
  }
}

function isChecked(columnKey: string, permissionKey: string): boolean {
  return Boolean(matrix[columnKey]?.[permissionKey]);
}

function toggle(columnKey: string, permissionKey: string, value: boolean | string | number) {
  if (!matrix[columnKey]) matrix[columnKey] = {};
  matrix[columnKey][permissionKey] = Boolean(value);
  dirty.value = true;
}

function columnCount(columnKey: string): number {
  return grantablePermissions.value.filter((permission) => matrix[columnKey]?.[permission.key]).length;
}

function toggleColumn(column: MatrixColumn, value: boolean) {
  if (!matrix[column.key]) matrix[column.key] = {};
  for (const permission of grantablePermissions.value) {
    matrix[column.key][permission.key] = value;
  }
  dirty.value = true;
}

async function save() {
  saving.value = true;
  try {
    const items: RolePermissionItem[] = columns.value.map((column) => ({
      role: column.role,
      level: column.level,
      permissions: grantablePermissions.value
        .filter((permission) => matrix[column.key]?.[permission.key])
        .map((permission) => permission.key)
    }));

    const result = await saveRolePermissions(items);
    applyItems(result.items);
    dirty.value = false;
    ElMessage.success("角色权限已保存，相关账号刷新后生效");
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "保存角色权限失败"));
  } finally {
    saving.value = false;
  }
}

async function reset() {
  try {
    await ElMessageBox.confirm(
      "恢复默认后，当前所有角色 × 级别的权限配置会被覆盖，是否继续？",
      "恢复默认权限",
      { type: "warning", confirmButtonText: "恢复默认", cancelButtonText: "取消" }
    );
  } catch {
    return;
  }

  saving.value = true;
  try {
    const result = await resetRolePermissions();
    applyItems(result.items);
    dirty.value = false;
    ElMessage.success("已恢复默认权限");
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "恢复默认权限失败"));
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-stack">
    <section class="toolbar-card">
      <div class="toolbar-head">
        <div>
          <h2>角色权限矩阵</h2>
          <p>
            菜单权限按角色 × 级别配置；动作执行仍由角色决定。权限项定义来自
            <code>apps/web/src/config/permissions.ts</code>，勾选结果存储在数据库。
          </p>
        </div>
        <div class="toolbar-actions">
          <span v-if="dirty" class="dirty-tag">有未保存修改</span>
          <el-button :disabled="saving" @click="reset">恢复默认</el-button>
          <el-button type="primary" :loading="saving" :disabled="!dirty" @click="save">
            保存权限
          </el-button>
        </div>
      </div>

      <div class="matrix-toolbar">
        <el-input v-model="search" class="search-input" placeholder="搜索权限名称或 key" clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <span class="muted-text">
          共 {{ ALL_PERMISSIONS.length }} 项权限 · 已勾选 {{ totalChecked }} 项
        </span>
      </div>
    </section>

    <section v-loading="loading" class="matrix-card">
      <div class="matrix-scroll">
        <table class="perm-table">
          <thead>
            <tr>
              <th class="perm-name-col">权限项</th>
              <th v-for="column in columns" :key="column.key" class="perm-col">
                <div class="perm-col-title">{{ column.label }}</div>
                <small>{{ columnCount(column.key) }} 项</small>
              </th>
              <th class="perm-col admin-col">
                <div class="perm-col-title">管理员</div>
                <small>固定全量</small>
              </th>
            </tr>
            <tr class="bulk-row">
              <th class="perm-name-col">批量操作</th>
              <th v-for="column in columns" :key="column.key">
                <button type="button" @click="toggleColumn(column, true)">全选</button>
                <span>·</span>
                <button type="button" @click="toggleColumn(column, false)">清空</button>
              </th>
              <th class="admin-col">只读</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in filteredGroups" :key="group.key">
              <tr class="group-row">
                <td :colspan="columns.length + 2">
                  <b>{{ group.label }}</b>
                  <span>{{ group.description }}</span>
                </td>
              </tr>
              <tr v-for="permission in group.permissions" :key="permission.key">
                <td class="perm-name-col">
                  <div class="perm-label">
                    {{ permission.label }}
                    <span v-if="permission.adminOnly" class="mini-badge admin">管理员</span>
                  </div>
                  <div class="perm-key">
                    <code>{{ permission.key }}</code>
                    <span class="mini-badge" :class="permission.menu ? 'menu' : 'op'">
                      {{ permission.menu ? "菜单" : "操作" }}
                    </span>
                  </div>
                </td>
                <td v-for="column in columns" :key="column.key" class="perm-cell">
                  <el-checkbox
                    v-if="!permission.adminOnly"
                    :model-value="isChecked(column.key, permission.key)"
                    @change="(value) => toggle(column.key, permission.key, value)"
                  />
                  <el-checkbox v-else :model-value="false" disabled />
                </td>
                <td class="perm-cell admin-col">
                  <el-checkbox :model-value="true" disabled />
                </td>
              </tr>
            </template>
            <tr v-if="filteredGroups.length === 0">
              <td :colspan="columns.length + 2" class="matrix-empty">没有匹配的权限项</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
