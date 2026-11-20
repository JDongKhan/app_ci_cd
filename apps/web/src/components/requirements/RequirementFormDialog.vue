<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {
  createRequirement,
  getOwnerOptions,
  updateRequirement
} from "@/api/requirements";
import { getErrorMessage } from "@/api/http";
import type {
  Requirement,
  RequirementOwnerOptions,
  RequirementPriority
} from "@/types";

const props = defineProps<{
  modelValue: boolean;
  requirement?: Requirement | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [requirement: Requirement];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

const isEdit = computed(() => Boolean(props.requirement));
const title = computed(() => (isEdit.value ? "编辑需求" : "新建需求"));

const formRef = ref<FormInstance>();
const submitting = ref(false);
const optionsLoading = ref(false);
const options = ref<RequirementOwnerOptions>({ dev: [], qa: [], pm: [] });

const form = reactive({
  code: "",
  title: "",
  description: "",
  devOwnerId: "",
  qaOwnerId: "",
  pmOwnerId: "",
  priority: "P1" as RequirementPriority,
  startAt: "",
  dueAt: ""
});

const rules: FormRules = {
  title: [
    { required: true, message: "请输入需求标题", trigger: "blur" },
    { max: 120, message: "标题不超过 120 个字符", trigger: "blur" }
  ],
  devOwnerId: [{ required: true, message: "请选择开发负责人", trigger: "change" }],
  qaOwnerId: [{ required: true, message: "请选择测试负责人", trigger: "change" }],
  pmOwnerId: [{ required: true, message: "请选择产品负责人", trigger: "change" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
  startAt: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  dueAt: [{ required: true, message: "请选择结束时间", trigger: "change" }]
};

function toDateInput(value: string): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function resetForm() {
  form.code = "";
  form.title = "";
  form.description = "";
  form.devOwnerId = "";
  form.qaOwnerId = "";
  form.pmOwnerId = "";
  form.priority = "P1";
  form.startAt = todayString();
  form.dueAt = "";
}

async function loadOptions() {
  optionsLoading.value = true;
  try {
    options.value = await getOwnerOptions();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载负责人列表失败"));
  } finally {
    optionsLoading.value = false;
  }
}

watch(
  () => props.modelValue,
  async (value) => {
    if (!value) return;

    await loadOptions();
    formRef.value?.clearValidate();

    if (props.requirement) {
      form.code = props.requirement.code;
      form.title = props.requirement.title;
      form.description = props.requirement.description;
      form.devOwnerId = props.requirement.devOwner.id;
      form.qaOwnerId = props.requirement.qaOwner.id;
      form.pmOwnerId = props.requirement.pmOwner.id;
      form.priority = props.requirement.priority;
      form.startAt = toDateInput(props.requirement.startAt);
      form.dueAt = toDateInput(props.requirement.dueAt);
    } else {
      resetForm();
    }
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
    code: form.code.trim() || undefined,
    title: form.title.trim(),
    description: form.description.trim() || null,
    devOwnerId: form.devOwnerId,
    qaOwnerId: form.qaOwnerId,
    pmOwnerId: form.pmOwnerId,
    priority: form.priority,
    startAt: form.startAt,
    dueAt: form.dueAt
  };

  submitting.value = true;
  try {
    const result = props.requirement
      ? await updateRequirement(props.requirement.id, payload)
      : await createRequirement(payload);
    ElMessage.success(isEdit.value ? "需求已更新" : "需求已创建");
    visible.value = false;
    emit("saved", result);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "保存需求失败"));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="680px" destroy-on-close>
    <p class="dialog-hint">需求不绑定应用，应用在任务的 CI 流水里选择；三个负责人分别对应开发、测试、产品。</p>
    <el-form ref="formRef" v-loading="optionsLoading" :model="form" :rules="rules" label-position="top">
      <div class="form-grid">
        <el-form-item label="需求编号">
          <el-input v-model="form.code" :placeholder="isEdit ? '' : '留空自动生成 REQ-xxxx'" />
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" class="full-width">
            <el-option label="P0 · 最高" value="P0" />
            <el-option label="P1 · 高" value="P1" />
            <el-option label="P2 · 普通" value="P2" />
          </el-select>
        </el-form-item>

        <el-form-item label="开发负责人" prop="devOwnerId">
          <el-select v-model="form.devOwnerId" class="full-width" filterable placeholder="选择开发">
            <el-option
              v-for="person in options.dev"
              :key="person.id"
              :label="person.name"
              :value="person.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="测试负责人" prop="qaOwnerId">
          <el-select v-model="form.qaOwnerId" class="full-width" filterable placeholder="选择测试">
            <el-option
              v-for="person in options.qa"
              :key="person.id"
              :label="person.name"
              :value="person.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="产品负责人" prop="pmOwnerId">
          <el-select v-model="form.pmOwnerId" class="full-width" filterable placeholder="选择产品">
            <el-option
              v-for="person in options.pm"
              :key="person.id"
              :label="person.name"
              :value="person.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间" prop="startAt">
          <el-date-picker
            v-model="form.startAt"
            class="full-width"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="计划开始"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="dueAt">
          <el-date-picker
            v-model="form.dueAt"
            class="full-width"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="计划结束"
          />
        </el-form-item>

        <el-form-item class="full-span" label="需求标题" prop="title">
          <el-input v-model="form.title" placeholder="一句话说清要交付什么" />
        </el-form-item>

        <el-form-item class="full-span" label="需求描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="2000"
            show-word-limit
            placeholder="背景、验收标准、涉及端…"
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">
        {{ isEdit ? "保存修改" : "创建需求" }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.full-span {
  grid-column: 1 / -1;
}
</style>
