<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { getOwnerOptions } from "@/api/requirements";
import { createTask, updateTask } from "@/api/tasks";
import { getErrorMessage } from "@/api/http";
import type {
  Person,
  Requirement,
  RequirementPriority,
  TaskDetail
} from "@/types";

const props = defineProps<{
  modelValue: boolean;
  requirement?: Requirement | null;
  task?: TaskDetail | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [task: TaskDetail];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

const isEdit = computed(() => Boolean(props.task));
const title = computed(() => (isEdit.value ? "编辑任务" : "新建任务"));

const formRef = ref<FormInstance>();
const submitting = ref(false);
const ownersLoading = ref(false);
const owners = ref<Person[]>([]);

const form = reactive({
  title: "",
  description: "",
  ownerId: "",
  priority: "P1" as RequirementPriority,
  startAt: "",
  dueAt: ""
});

const rules: FormRules = {
  title: [
    { required: true, message: "请输入任务标题", trigger: "blur" },
    { max: 120, message: "标题不超过 120 个字符", trigger: "blur" }
  ],
  ownerId: [{ required: true, message: "请选择任务负责人", trigger: "change" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
  startAt: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  dueAt: [{ required: true, message: "请选择结束时间", trigger: "change" }]
};

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function toDateInput(value: string): string {
  return value ? value.slice(0, 10) : "";
}

async function loadOwners() {
  ownersLoading.value = true;
  try {
    const options = await getOwnerOptions();
    owners.value = options.dev;
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载开发人员失败"));
  } finally {
    ownersLoading.value = false;
  }
}

watch(
  () => props.modelValue,
  async (value) => {
    if (!value) return;

    await loadOwners();
    formRef.value?.clearValidate();

    if (props.task) {
      form.title = props.task.title;
      form.description = props.task.description;
      form.ownerId = props.task.owner.id;
      form.priority = props.task.priority;
      form.startAt = toDateInput(props.task.startAt);
      form.dueAt = toDateInput(props.task.dueAt);
      return;
    }

    form.title = "";
    form.description = "";
    form.ownerId = props.requirement?.devOwner.id ?? "";
    form.priority = props.requirement?.priority ?? "P1";
    form.startAt = todayString();
    form.dueAt = props.requirement ? toDateInput(props.requirement.dueAt) : "";
  }
);

async function submit() {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  if (form.dueAt < form.startAt) {
    ElMessage.warning("结束时间不能早于开始时间");
    return;
  }

  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    ownerId: form.ownerId,
    priority: form.priority,
    startAt: form.startAt,
    dueAt: form.dueAt
  };

  submitting.value = true;
  try {
    let result: TaskDetail;
    if (props.task) {
      result = await updateTask(props.task.id, payload);
      ElMessage.success("任务已更新");
    } else {
      result = await createTask({
        ...payload,
        reqId: props.requirement?.id
      });
      ElMessage.success("任务已创建");
    }
    visible.value = false;
    emit("saved", result);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "保存任务失败"));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="620px" destroy-on-close>
    <p class="dialog-hint">
      {{ requirement ? `${requirement.code} · ${requirement.title}` : "任务负责人默认取需求的开发负责人。" }}
    </p>
    <el-form ref="formRef" v-loading="ownersLoading" :model="form" :rules="rules" label-position="top">
      <div class="form-grid">
        <el-form-item class="full-span" label="任务标题" prop="title">
          <el-input v-model="form.title" placeholder="例如 首页信息流改版" />
        </el-form-item>

        <el-form-item label="任务负责人" prop="ownerId">
          <el-select v-model="form.ownerId" class="full-width" filterable placeholder="选择开发">
            <el-option
              v-for="person in owners"
              :key="person.id"
              :label="person.name"
              :value="person.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" class="full-width">
            <el-option label="P0 · 最高" value="P0" />
            <el-option label="P1 · 高" value="P1" />
            <el-option label="P2 · 普通" value="P2" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间" prop="startAt">
          <el-date-picker
            v-model="form.startAt"
            class="full-width"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="dueAt">
          <el-date-picker
            v-model="form.dueAt"
            class="full-width"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item class="full-span" label="任务描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="2000"
            show-word-limit
            placeholder="交付范围、验收要点…"
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">
        {{ isEdit ? "保存修改" : "创建任务" }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.full-span {
  grid-column: 1 / -1;
}
</style>
