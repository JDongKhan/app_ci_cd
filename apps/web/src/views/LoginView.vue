<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { fetchLoginAccounts } from "@/api/auth";
import { getErrorMessage } from "@/api/http";
import { LEVEL_META, ROLE_META } from "@/config/permissions";
import type { LoginAccount } from "@/types";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const form = reactive({
  account: "chenmo",
  password: "Init@123"
});

const error = ref("");
const submitting = ref(false);
const accountsLoading = ref(false);
const accounts = ref<LoginAccount[]>([]);

const roleOrder: Record<string, number> = {
  dev: 0,
  qa: 1,
  admin: 2,
  pm: 3
};

const sortedAccounts = computed(() =>
  [...accounts.value].sort((left, right) => {
    const roleDiff = (roleOrder[left.role] ?? 9) - (roleOrder[right.role] ?? 9);
    if (roleDiff !== 0) return roleDiff;
    const levelDiff = String(left.level ?? "").localeCompare(String(right.level ?? ""));
    if (levelDiff !== 0) return levelDiff;
    return left.account.localeCompare(right.account);
  })
);

function accountRoleLabel(account: LoginAccount): string {
  const roleLabel = ROLE_META[account.role]?.label ?? account.role;
  if (account.role === "admin" || !account.level) return roleLabel;
  return `${roleLabel} · ${LEVEL_META[account.level] ?? account.level}`;
}

async function loadAccounts() {
  accountsLoading.value = true;
  try {
    accounts.value = await fetchLoginAccounts();
  } catch {
    accounts.value = [];
  } finally {
    accountsLoading.value = false;
  }
}

function fillAccount(account: string) {
  form.account = account;
  form.password = "Init@123";
  error.value = "";
}

async function submit() {
  error.value = "";

  if (!form.account.trim() || !form.password) {
    error.value = "请输入账号和密码";
    return;
  }

  submitting.value = true;
  try {
    await auth.login(form.account, form.password);
    ElMessage.success("登录成功");
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
    router.replace(redirect);
  } catch (err) {
    error.value = getErrorMessage(err, "登录失败");
  } finally {
    submitting.value = false;
  }
}

onMounted(loadAccounts);
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-mark large">SF</div>
        <div>
          <h1>ShipFlow</h1>
          <p>代码合并 · CI 打包 · 发布归档</p>
        </div>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <label class="field-label">账号</label>
        <el-input v-model="form.account" placeholder="请输入账号" autocomplete="username" />

        <label class="field-label">密码</label>
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
          autocomplete="current-password"
        />

        <p v-if="error" class="login-error">{{ error }}</p>

        <el-button class="login-submit" type="primary" native-type="submit" :loading="submitting">
          登录
        </el-button>
      </form>

      <div class="demo-head">
        <span>快捷登录账号（来自数据库）</span>
        <el-button link :icon="Refresh" :loading="accountsLoading" @click="loadAccounts">刷新</el-button>
      </div>

      <div v-loading="accountsLoading" class="demo-accounts">
        <button
          v-for="item in sortedAccounts"
          :key="item.account"
          type="button"
          class="demo-account"
          :class="{ active: form.account === item.account }"
          @click="fillAccount(item.account)"
        >
          <span class="demo-avatar">{{ item.name.slice(0, 1) }}</span>
          <span class="demo-main">
            <b>{{ item.name }}</b>
            <small>{{ accountRoleLabel(item) }}</small>
          </span>
          <code>{{ item.account }}</code>
        </button>

        <p v-if="!accountsLoading && sortedAccounts.length === 0" class="login-empty">
          没有可快捷登录的账号，请直接输入账号和密码。
        </p>
      </div>

      <p class="login-hint">点击账号会填入默认密码 Init@123；如密码已修改，请手动输入。</p>
    </div>
  </div>
</template>
