<script setup lang="ts">
import { computed } from "vue";
import TaskDetailView from "@/views/TaskDetailView.vue";

const props = defineProps<{
  modelValue: boolean;
  taskId: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  closed: [];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

function onClose() {
  emit("closed");
}
</script>

<template>
  <el-drawer
    v-model="visible"
    title="任务详情"
    size="760px"
    append-to-body
    destroy-on-close
    class="detail-drawer"
    @closed="onClose"
  >
    <TaskDetailView v-if="taskId" :task-id="taskId" embedded @close="visible = false" />
  </el-drawer>
</template>
