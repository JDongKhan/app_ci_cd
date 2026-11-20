<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { getOwnerOptions, updateQaMembers } from "@/api/requirements";
import { getErrorMessage } from "@/api/http";
import type { Person, Requirement } from "@/types";

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

const loading = ref(false);
const submitting = ref(false);
const qaUsers = ref<Person[]>([]);
const selected = ref<string[]>([]);

async function load() {
  loading.value = true;
  try {
    const options = await getOwnerOptions();
    qaUsers.value = options.qa;
    selected.value = props.requirement
      ? props.requirement.qaMembers.map((member) => member.id)
      : [];
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载测试人员失败"));
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) load();
  }
);

function isOwner(user: Person): boolean {
  return props.requirement?.qaOwner.id === user.id;
}

const ownerInList = computed(() => {
  if (!props.requirement) return false;
  return qaUsers.value.some((user) => user.id === props.requirement?.qaOwner.id);
});

async function submit() {
  if (!props.requirement) return;

  const ownerId = props.requirement.qaOwner.id;
  const userIds = Array.from(new Set([...selected.value, ownerId]));

  submitting.value = true;
  try {
    const result = await updateQaMembers(props.requirement.id, userIds);
    ElMessage.success("测试人员已更新");
    visible.value = false;
    emit("saved", result);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "保存测试人员失败"));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="维护测试人员" width="520px" destroy-on-close>
    <p class="dialog-hint">
      {{ requirement ? `${requirement.code} · ${requirement.title}` : "" }}
      <br />
      测试负责人固定在列表内；被登记的测试人员也会在「我的需求」里看到该需求。
    </p>

    <div v-loading="loading">
      <el-checkbox-group v-model="selected" class="qa-pool">
        <div
          v-for="user in qaUsers"
          :key="user.id"
          class="qa-item"
          :class="{ locked: isOwner(user) }"
        >
          <el-checkbox :value="user.id" :disabled="isOwner(user)" class="qa-check">
            <span class="qa-avatar">{{ user.name.slice(0, 1) }}</span>
            <span class="qa-main">
              <b>{{ user.name }}</b>
              <small>{{ user.account }} · {{ user.level?.toUpperCase() || "—" }}</small>
            </span>
          </el-checkbox>
          <span v-if="isOwner(user)" class="owner-tag">负责人</span>
        </div>
      </el-checkbox-group>

      <p v-if="!loading && qaUsers.length === 0" class="qa-empty">没有启用中的测试人员。</p>
      <p v-if="!loading && requirement && !ownerInList" class="qa-empty">
        测试负责人「{{ requirement.qaOwner.name }}」当前不在启用列表中，保存时会自动保留。
      </p>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.qa-pool {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 4px;
}

.qa-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 9px;
  cursor: pointer;
}

.qa-item:hover {
  border-color: #c8d3e1;
  background: #f8fafc;
}

.qa-item.locked {
  background: #f8fafc;
  cursor: default;
}

.qa-check {
  flex: 1;
  min-width: 0;
}

.qa-check :deep(.el-checkbox__label) {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.qa-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--blue-soft);
  color: var(--blue);
  display: grid;
  place-items: center;
  font-weight: 600;
  flex: 0 0 auto;
}

.qa-main {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.qa-main b {
  font-size: 13px;
}

.qa-main small {
  color: var(--muted);
  font-size: 11px;
}

.owner-tag {
  padding: 1px 8px;
  border-radius: 999px;
  background: #eef3ff;
  color: #1d4ed8;
  font-size: 10.5px;
  font-weight: 600;
}

.qa-empty {
  margin: 6px 0;
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}
</style>
