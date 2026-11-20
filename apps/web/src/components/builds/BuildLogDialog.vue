<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { fetchBuildLog } from "@/api/builds";
import type { BuildRecord } from "@/types";

const props = defineProps<{
  modelValue: boolean;
  build?: BuildRecord | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

const content = ref("");
const loading = ref(false);
const logBox = ref<HTMLElement | null>(null);
const status = ref("running");
let offset = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

function stop() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (logBox.value) {
      logBox.value.scrollTop = logBox.value.scrollHeight;
    }
  });
}

async function tick() {
  if (!props.build) return;

  try {
    const chunk = await fetchBuildLog(props.build.id, offset);
    if (chunk.content) {
      content.value += chunk.content;
      offset = chunk.nextOffset;
      scrollToBottom();
    } else if (chunk.nextOffset > offset) {
      offset = chunk.nextOffset;
    }
    status.value = chunk.status;
    loading.value = false;

    if (chunk.status === "running") {
      timer = setTimeout(tick, 1000);
    }
  } catch {
    loading.value = false;
    timer = setTimeout(tick, 2000);
  }
}

async function start() {
  if (!props.build) return;

  stop();
  content.value = "";
  offset = 0;
  status.value = props.build.status;
  loading.value = true;
  await tick();
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      start();
    } else {
      stop();
    }
  }
);

onBeforeUnmount(stop);
</script>

<template>
  <el-dialog v-model="visible" title="打包日志" width="820px" destroy-on-close>
    <div class="log-meta">
      <span>流水 {{ build?.pipeline.name }}</span>
      <span>阶段 {{ build?.stageLabel }}</span>
      <span>状态 {{ status === "running" ? "打包中" : status === "success" ? "成功" : "失败" }}</span>
    </div>

    <pre ref="logBox" v-loading="loading" class="log-box">{{ content || "等待日志输出…" }}</pre>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.log-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
  color: var(--muted);
  font-size: 11.5px;
}

.log-box {
  height: 440px;
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  border: 1px solid #1e293b;
  border-radius: 8px;
  background: #0b1220;
  color: #cbd5e1;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
