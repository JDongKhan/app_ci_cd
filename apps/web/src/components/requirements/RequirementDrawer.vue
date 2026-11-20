<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ReqDetailView from "@/views/ReqDetailView.vue";
import TaskDrawer from "@/components/tasks/TaskDrawer.vue";

const props = defineProps<{
  modelValue: boolean;
  requirementId: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

const taskVisible = ref(false);
const taskId = ref("");
const refreshKey = ref(0);

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      taskVisible.value = false;
      taskId.value = "";
    }
  }
);

function openTask(id: string) {
  taskId.value = id;
  taskVisible.value = true;
}

function onTaskClosed() {
  refreshKey.value += 1;
}
</script>

<template>
  <el-drawer
    v-model="visible"
    title="需求详情"
    size="760px"
    append-to-body
    destroy-on-close
    class="detail-drawer"
  >
    <ReqDetailView
      v-if="requirementId"
      :key="refreshKey"
      :requirement-id="requirementId"
      embedded
      @open-task="openTask"
    />
    <TaskDrawer v-model="taskVisible" :task-id="taskId" @closed="onTaskClosed" />
  </el-drawer>
</template>
