<script setup lang="ts">
import { computed, ref, watch, type Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Box,
  Document,
  Grid,
  HomeFilled,
  Lock,
  Menu as MenuIcon,
  Monitor,
  Reading,
  SwitchButton,
  User
} from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { LEVEL_META, MENU_ITEMS, ROLE_META } from "@/config/permissions";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const sidebarOpen = ref(false);

const iconMap: Record<string, Component> = {
  home: HomeFilled,
  board: Grid,
  reqs: Document,
  apps: Monitor,
  artifacts: Box,
  roles: Lock,
  staff: User,
  spec: Reading
};

const visibleMenus = computed(() => MENU_ITEMS.filter((item) => auth.hasPermission(item.key)));

const roleLabel = computed(() => (auth.user ? ROLE_META[auth.user.role]?.label ?? auth.user.role : ""));
const levelLabel = computed(() => {
  if (!auth.user?.level) return "管理员";
  return LEVEL_META[auth.user.level] ?? auth.user.level;
});

function isActive(path: string): boolean {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
}

function handleLogout() {
  auth.logout();
  router.push("/login");
}

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false;
  }
);
</script>

<template>
  <div class="app-shell">
    <div v-if="sidebarOpen" class="sidebar-mask" @click="sidebarOpen = false" />

    <aside class="app-sidebar" :class="{ open: sidebarOpen }">
      <div class="brand">
        <div class="brand-mark">SF</div>
        <div>
          <div class="brand-name">ShipFlow</div>
          <div class="brand-sub">代码合并 · 打包发布</div>
        </div>
      </div>

      <div class="nav-label">工作台</div>
      <nav class="side-nav">
        <router-link
          v-for="item in visibleMenus"
          :key="item.key"
          :to="item.route"
          class="nav-item"
          :class="{ active: isActive(item.route) }"
        >
          <el-icon class="nav-icon">
            <component :is="iconMap[item.key]" />
          </el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-foot">
        <div v-if="auth.user" class="user-card">
          <div class="user-avatar">{{ auth.user.name.slice(0, 1) }}</div>
          <div class="user-main">
            <b>{{ auth.user.name }}</b>
            <span>{{ roleLabel }} · {{ levelLabel }}</span>
            <small>{{ auth.user.team || "未分配团队" }}</small>
          </div>
        </div>
        <button class="logout-btn" type="button" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </button>
      </div>
    </aside>

    <div class="app-main">
      <header class="app-topbar">
        <button class="mobile-menu" type="button" aria-label="打开菜单" @click="sidebarOpen = true">
          <el-icon><MenuIcon /></el-icon>
        </button>
        <div v-if="auth.user" class="topbar-user">
          <span class="topbar-role">{{ roleLabel }}</span>
          <span class="topbar-name">{{ auth.user.name }}</span>
        </div>
      </header>

      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
