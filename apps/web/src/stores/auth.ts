import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { fetchMe, login as loginApi } from "@/api/auth";
import type { User } from "@/types";

const TOKEN_KEY = "shipflow_token";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || "");
  const user = ref<User | null>(null);
  const permissions = ref<string[]>([]);
  const isAdmin = ref(false);
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const role = computed(() => user.value?.role ?? null);

  function setSession(nextToken: string, nextUser: User, nextPermissions: string[], nextIsAdmin: boolean) {
    token.value = nextToken;
    user.value = nextUser;
    permissions.value = nextPermissions;
    isAdmin.value = nextIsAdmin;
    localStorage.setItem(TOKEN_KEY, nextToken);
  }

  async function login(account: string, password: string) {
    loading.value = true;
    try {
      const result = await loginApi(account, password);
      setSession(result.token, result.user, result.permissions, result.isAdmin);
      return result.user;
    } finally {
      loading.value = false;
    }
  }

  async function loadMe() {
    if (!token.value) return;
    loading.value = true;
    try {
      const result = await fetchMe();
      user.value = result.user;
      permissions.value = result.permissions;
      isAdmin.value = result.isAdmin;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = "";
    user.value = null;
    permissions.value = [];
    isAdmin.value = false;
    localStorage.removeItem(TOKEN_KEY);
  }

  function hasPermission(key?: string | null): boolean {
    if (!key) return true;
    if (isAdmin.value) return true;
    return permissions.value.includes(key);
  }

  return {
    token,
    user,
    permissions,
    isAdmin,
    loading,
    isAuthenticated,
    role,
    login,
    loadMe,
    logout,
    hasPermission
  };
});
