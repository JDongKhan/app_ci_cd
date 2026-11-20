<script setup lang="ts">
import { useRouter } from "vue-router";
import { Lock } from "@element-plus/icons-vue";

const router = useRouter();
</script>

<template>
  <div class="forbidden-page">
    <div class="forbidden-card">
      <div class="forbidden-icon"><el-icon><Lock /></el-icon></div>
      <div class="forbidden-code">403</div>
      <h1>无权限访问</h1>
      <p>当前账号的角色或级别没有该页面的菜单权限，请联系管理员调整角色权限矩阵。</p>
      <div class="forbidden-actions">
        <el-button type="primary" @click="router.push('/')">返回首页</el-button>
        <el-button @click="router.push('/login')">切换账号</el-button>
      </div>
    </div>
  </div>
</template>
