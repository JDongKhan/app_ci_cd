<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { listApps } from "@/api/apps";
import { createPipeline } from "@/api/pipelines";
import { getErrorMessage } from "@/api/http";
import type { AppRecord, Pipeline, TaskDetail } from "@/types";

const props = defineProps<{
  modelValue: boolean;
  task?: TaskDetail | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [pipeline: Pipeline];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);
const apps = ref<AppRecord[]>([]);

const form = reactive({
  appId: "",
  name: "",
  branch: ""
});

const rules: FormRules = {
  appId: [{ required: true, message: "请选择应用", trigger: "change" }],
  branch: [
    { required: true, message: "请输入 Feature 分支", trigger: "blur" },
    { max: 120, message: "分支名不超过 120 个字符", trigger: "blur" }
  ]
};

const existing = computed(() => props.task?.pipelines[0] ?? null);

function defaultBranch(task: TaskDetail | null | undefined): string {
  if (!task) return "feature/";
  const shortId = task.id.replace(/-/g, "").slice(0, 8);
  return `feature/task-${shortId}`;
}

async function load() {
  loading.value = true;
  try {
    apps.value = await listApps();
    const first = existing.value;
    form.branch = first?.branch ?? defaultBranch(props.task);
    form.appId = apps.value[0]?.id ?? "";
    form.name = "";
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载应用列表失败"));
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return;
    formRef.value?.clearValidate();
    load();
  }
);

function onAppChange(appId: string) {
  const app = apps.value.find((item) => item.id === appId);
  if (app) {
    form.name = `${app.name} · ${app.artifactType}`;
  }
}

async function submit() {
  if (!formRef.value || !props.task) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    const result = await createPipeline(props.task.id, {
      appId: form.appId,
      name: form.name.trim() || undefined,
      branch: form.branch.trim()
    });
    ElMessage.success("CI 流水已创建");
    visible.value = false;
    emit("saved", result);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "创建流水失败"));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="新建 CI 流水" width="560px" destroy-on-close>
    <p class="dialog-hint">
      流水选择应用 + Feature 分支；同一任务下所有流水必须使用相同仓库与相同分支。分支名包含
      <code>conflict</code> 时会模拟合并冲突，便于演示冲突处理。
    </p>

    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-position="top">
      <el-form-item label="应用" prop="appId">
        <el-select
          v-model="form.appId"
          class="full-width"
          placeholder="选择应用"
          @change="onAppChange"
        >
          <el-option
            v-for="app in apps"
            :key="app.id"
            :label="`${app.name} · ${app.platform.toUpperCase()} · ${app.artifactType}`"
            :value="app.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="流水名称">
        <el-input v-model="form.name" placeholder="默认按应用与产物类型生成" />
      </el-form-item>

      <el-form-item label="Feature 分支" prop="branch">
        <el-input v-model="form.branch" :disabled="Boolean(existing)" placeholder="feature/xxx" />
        <span v-if="existing" class="field-hint">
          同一任务已使用分支 {{ existing.branch }}，新建流水必须保持一致。
        </span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">创建流水</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.field-hint {
  margin-top: 4px;
  color: var(--muted);
  font-size: 11px;
}

.dialog-hint code {
  padding: 1px 5px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: #f8fafc;
  font-size: 11px;
}
</style>
