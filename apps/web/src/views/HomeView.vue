<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight, Lock, Setting, User } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { LEVEL_META, MENU_ITEMS, ROLE_META } from "@/config/permissions";

const auth = useAuthStore();
const router = useRouter();

const roleLabel = computed(() =>
  auth.user ? ROLE_META[auth.user.role]?.label ?? auth.user.role : ""
);
const levelLabel = computed(() => {
  if (!auth.user?.level) return "管理员";
  return LEVEL_META[auth.user.level] ?? auth.user.level;
});

const permissionLabels = computed(() => {
  if (auth.isAdmin) return ["全部菜单与动作"];
  return MENU_ITEMS.filter((item) => auth.hasPermission(item.key)).map((item) => item.label);
});
</script>

<template>
  <div class="page-stack">
    <section class="hero-card">
      <div>
        <div class="eyebrow">WELCOME BACK</div>
        <h2>你好，{{ auth.user?.name }}</h2>
        <p>
          当前以 <b>{{ roleLabel }}</b> · <b>{{ levelLabel }}</b> 身份登录。
          本阶段已完成登录、角色权限矩阵和人员管理，其他业务模块将在后续阶段接入。
        </p>
      </div>
      <div class="hero-avatar">{{ auth.user?.name.slice(0, 1) }}</div>
    </section>

    <section class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon"><el-icon><User /></el-icon></div>
        <div class="stat-label">当前角色</div>
        <div class="stat-value">{{ roleLabel }}</div>
        <div class="stat-note">{{ auth.user?.team || "未分配团队" }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><el-icon><Lock /></el-icon></div>
        <div class="stat-label">可用菜单</div>
        <div class="stat-value">{{ auth.isAdmin ? "全部" : permissionLabels.length }}</div>
        <div class="stat-note">{{ auth.isAdmin ? "管理员不受矩阵限制" : "来自角色权限矩阵" }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><el-icon><Setting /></el-icon></div>
        <div class="stat-label">权限模式</div>
        <div class="stat-value">{{ auth.isAdmin ? "Admin" : "Role × Level" }}</div>
        <div class="stat-note">菜单按级别，动作按角色</div>
      </div>
    </section>

    <section class="split-grid">
      <div class="panel">
        <div class="panel-head">
          <h3>已完成模块</h3>
          <span class="pill-done">Phase 1</span>
        </div>
        <ul class="check-list">
          <li>账号密码登录与 JWT 鉴权</li>
          <li>角色 × 级别菜单权限矩阵</li>
          <li>人员新增、编辑、重置密码、启停</li>
          <li>权限项前端配置文件驱动</li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>快捷入口</h3>
        </div>
        <div v-if="auth.isAdmin" class="quick-actions">
          <button type="button" class="quick-action" @click="router.push('/roles')">
            <span><b>角色权限</b><small>维护角色与级别的权限矩阵</small></span>
            <el-icon><ArrowRight /></el-icon>
          </button>
          <button type="button" class="quick-action" @click="router.push('/staff')">
            <span><b>人员管理</b><small>新增账号、调整角色与启停</small></span>
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
        <p v-else class="muted-text">
          角色权限和人员管理仅管理员可见。你可以在左侧菜单查看当前角色开放的页面。
        </p>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h3>当前可用菜单</h3>
        <span class="muted-text">{{ permissionLabels.length }} 项</span>
      </div>
      <div class="tag-list">
        <span v-for="label in permissionLabels" :key="label" class="soft-tag">{{ label }}</span>
      </div>
    </section>
  </div>
</template>
