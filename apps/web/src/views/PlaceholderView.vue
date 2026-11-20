<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Tools } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

const title = computed(() => (route.meta.title as string) || "模块建设中");
const description = computed(() => (route.meta.description as string) || "该模块将在后续阶段接入。");
</script>

<template>
  <div class="placeholder-page">
    <div class="placeholder-icon"><el-icon><Tools /></el-icon></div>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <div class="placeholder-note">
      当前阶段先完成登录、角色权限和人员管理。需求、任务、流水、构建和产物模块会按设计文档逐步接入。
    </div>
    <el-button :icon="ArrowLeft" @click="router.push('/')">返回首页</el-button>
  </div>
</template>
