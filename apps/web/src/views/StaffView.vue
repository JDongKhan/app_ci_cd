<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules
} from "element-plus";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import {
  createStaff,
  listStaff,
  resetStaffPassword,
  updateStaff,
  updateStaffStatus
} from "@/api/staff";
import { getErrorMessage } from "@/api/http";
import {
  LEVEL_META,
  LEVEL_OPTIONS,
  ROLE_META,
  ROLE_OPTIONS
} from "@/config/permissions";
import { useAuthStore } from "@/stores/auth";
import type { Level, Role, User } from "@/types";

const auth = useAuthStore();

const filters = reactive({
  keyword: "",
  role: "",
  active: ""
});

const users = ref<User[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const editingUser = ref<User | null>(null);
const formRef = ref<FormInstance>();
const submitting = ref(false);

const form = reactive({
  account: "",
  name: "",
  password: "",
  role: "dev" as Role,
  level: "l1" as Level | null,
  team: "",
  active: true
});

const passwordDialogVisible = ref(false);
const passwordTarget = ref<User | null>(null);
const passwordFormRef = ref<FormInstance>();
const passwordSubmitting = ref(false);
const passwordForm = reactive({ password: "" });

const roleFilterOptions = [
  ...ROLE_OPTIONS,
  { value: "admin", label: ROLE_META.admin.label }
];

const dialogTitle = computed(() =>
  dialogMode.value === "create" ? "新增人员" : `编辑人员 · ${editingUser.value?.name ?? ""}`
);

const rules: FormRules = {
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, max: 32, message: "账号长度为 3~32 个字符", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9._-]+$/,
      message: "账号只能包含字母、数字、点、下划线和短横线",
      trigger: "blur"
    }
  ],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (dialogMode.value === "create" && !value) {
          callback(new Error("请输入初始密码"));
          return;
        }
        if (value && value.length < 6) {
          callback(new Error("密码至少 6 位"));
          return;
        }
        callback();
      },
      trigger: "blur"
    }
  ],
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  level: [
    {
      validator: (_rule, value, callback) => {
        if (form.role !== "admin" && !value) {
          callback(new Error("非管理员必须选择级别"));
          return;
        }
        callback();
      },
      trigger: "change"
    }
  ]
};

const passwordRules: FormRules = {
  password: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 64, message: "密码长度为 6~64 位", trigger: "blur" }
  ]
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

function levelLabel(user: User): string {
  if (user.role === "admin" || !user.level) return "—";
  return LEVEL_META[user.level] ?? user.level;
}

async function load() {
  loading.value = true;
  try {
    users.value = await listStaff({
      keyword: filters.keyword || undefined,
      role: filters.role || undefined,
      active: filters.active || undefined
    });
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载人员列表失败"));
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = "";
  filters.role = "";
  filters.active = "";
  load();
}

function openCreate() {
  dialogMode.value = "create";
  editingUser.value = null;
  form.account = "";
  form.name = "";
  form.password = "Init@123";
  form.role = "dev";
  form.level = "l1";
  form.team = "";
  form.active = true;
  dialogVisible.value = true;
  formRef.value?.clearValidate();
}

function openEdit(user: User) {
  dialogMode.value = "edit";
  editingUser.value = user;
  form.account = user.account;
  form.name = user.name;
  form.password = "";
  form.role = user.role;
  form.level = user.level;
  form.team = user.team ?? "";
  form.active = user.active;
  dialogVisible.value = true;
  formRef.value?.clearValidate();
}

function onRoleChange(role: Role) {
  if (role === "admin") {
    form.level = null;
    return;
  }
  if (!form.level) form.level = "l1";
}

async function submit() {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (dialogMode.value === "create") {
      await createStaff({
        account: form.account.trim(),
        password: form.password,
        name: form.name.trim(),
        role: form.role,
        level: form.role === "admin" ? null : form.level,
        team: form.team.trim() || null
      });
      ElMessage.success("人员已创建");
    } else if (editingUser.value) {
      await updateStaff(editingUser.value.id, {
        name: form.name.trim(),
        role: form.role,
        level: form.role === "admin" ? null : form.level,
        team: form.team.trim() || null,
        active: form.active
      });
      ElMessage.success("人员信息已更新");
    }

    dialogVisible.value = false;
    await load();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "保存人员失败"));
  } finally {
    submitting.value = false;
  }
}

async function toggleStatus(user: User) {
  const nextActive = !user.active;
  try {
    await ElMessageBox.confirm(
      nextActive ? `确认启用「${user.name}」？` : `确认停用「${user.name}」？停用后该账号将无法登录。`,
      nextActive ? "启用人员" : "停用人员",
      {
        type: nextActive ? "info" : "warning",
        confirmButtonText: nextActive ? "启用" : "停用",
        cancelButtonText: "取消"
      }
    );
  } catch {
    return;
  }

  try {
    await updateStaffStatus(user.id, nextActive);
    ElMessage.success(nextActive ? "账号已启用" : "账号已停用");
    await load();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "更新账号状态失败"));
  }
}

function openPasswordDialog(user: User) {
  passwordTarget.value = user;
  passwordForm.password = "";
  passwordDialogVisible.value = true;
  passwordFormRef.value?.clearValidate();
}

async function submitPassword() {
  if (!passwordFormRef.value || !passwordTarget.value) return;

  const valid = await passwordFormRef.value.validate().catch(() => false);
  if (!valid) return;

  passwordSubmitting.value = true;
  try {
    await resetStaffPassword(passwordTarget.value.id, passwordForm.password);
    ElMessage.success(`已重置「${passwordTarget.value.name}」的密码`);
    passwordDialogVisible.value = false;
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "重置密码失败"));
  } finally {
    passwordSubmitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-stack">
    <section class="toolbar-card">
      <div class="toolbar-head">
        <div>
          <h2>人员管理</h2>
          <p>管理员可以新增账号、调整角色与级别、重置密码和停用账号。账号数据全部存储在数据库中。</p>
        </div>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增人员</el-button>
      </div>

      <div class="filter-row">
        <el-input
          v-model="filters.keyword"
          class="filter-input"
          placeholder="搜索姓名、账号或团队"
          clearable
          @keyup.enter="load"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select v-model="filters.role" class="filter-select" placeholder="全部角色" clearable>
          <el-option
            v-for="option in roleFilterOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-select v-model="filters.active" class="filter-select" placeholder="全部状态" clearable>
          <el-option label="启用" value="true" />
          <el-option label="停用" value="false" />
        </el-select>

        <el-button type="primary" :icon="Search" @click="load">查询</el-button>
        <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
      </div>
    </section>

    <section v-loading="loading" class="table-card">
      <el-table :data="users" stripe class="staff-table" empty-text="暂无人员">
        <el-table-column label="姓名 / 账号" min-width="180">
          <template #default="{ row }">
            <div class="person-cell">
              <span class="person-avatar">{{ row.name.slice(0, 1) }}</span>
              <div>
                <b>{{ row.name }}</b>
                <div class="person-account">{{ row.account }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色 / 级别" min-width="150">
          <template #default="{ row }">
            <div class="role-cell">
              <span class="role-tag" :class="`role-${row.role}`">
                {{ ROLE_META[row.role as Role]?.label ?? row.role }}
              </span>
              <span class="level-text">{{ levelLabel(row) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="team" label="团队" min-width="140">
          <template #default="{ row }">{{ row.team || "—" }}</template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.active ? 'on' : 'off'">
              {{ row.active ? "启用" : "停用" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="最近登录" min-width="170">
          <template #default="{ row }">
            <span class="muted-text">{{ formatDate(row.lastLoginAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
              <el-button link @click="openPasswordDialog(row)">重置密码</el-button>
              <el-button
                link
                :type="row.active ? 'danger' : 'success'"
                :disabled="row.id === auth.user?.id"
                @click="toggleStatus(row)"
              >
                {{ row.active ? "停用" : "启用" }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="账号" prop="account">
            <el-input v-model="form.account" :disabled="dialogMode === 'edit'" placeholder="例如 chenmo" />
          </el-form-item>

          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="例如 陈默" />
          </el-form-item>

          <el-form-item v-if="dialogMode === 'create'" label="初始密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" />
          </el-form-item>

          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" class="full-width" @change="onRoleChange">
              <el-option label="开发" value="dev" />
              <el-option label="测试" value="qa" />
              <el-option label="管理员" value="admin" />
              <el-option label="产品" value="pm" />
            </el-select>
          </el-form-item>

          <el-form-item label="级别" prop="level">
            <el-select
              v-model="form.level"
              class="full-width"
              :disabled="form.role === 'admin'"
              placeholder="管理员不设级别"
            >
              <el-option
                v-for="option in LEVEL_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="团队">
            <el-input v-model="form.team" placeholder="例如 出行 App 组" />
          </el-form-item>

          <el-form-item v-if="dialogMode === 'edit'" label="账号状态">
            <el-switch v-model="form.active" active-text="启用" inactive-text="停用" />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">
          {{ dialogMode === "create" ? "创建人员" : "保存修改" }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordDialogVisible" title="重置密码" width="420px" destroy-on-close>
      <p class="dialog-hint">
        为「{{ passwordTarget?.name }}」设置新密码，保存后立即生效。
      </p>
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-position="top">
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            show-password
            placeholder="至少 6 位"
            @keyup.enter="submitPassword"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordSubmitting" @click="submitPassword">
          确认重置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
