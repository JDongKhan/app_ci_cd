<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft, Delete, Edit, Plus } from "@element-plus/icons-vue";
import { deleteTask, getTask, listTaskCommits } from "@/api/tasks";
import {
  advanceTaskStatus,
  mergePipeline,
  resolvePipeline,
  testReject,
  verifyPipeline
} from "@/api/pipelines";
import { listTaskBuilds, qaVerdict, triggerBuild } from "@/api/builds";
import { artifactDownloadUrl } from "@/api/artifacts";
import { getErrorMessage } from "@/api/http";
import { useAuthStore } from "@/stores/auth";
import { PRIORITY_META, TASK_STATUS_META } from "@/config/tasks";
import {
  PIPELINE_STAGES,
  isConflictStatus,
  pipelineStatusClass
} from "@/config/pipelines";
import TaskFormDialog from "@/components/tasks/TaskFormDialog.vue";
import PipelineFormDialog from "@/components/pipelines/PipelineFormDialog.vue";
import BuildLogDialog from "@/components/builds/BuildLogDialog.vue";
import type { BuildRecord, Pipeline, TaskCommit, TaskDetail } from "@/types";

const props = defineProps<{
  taskId?: string;
  embedded?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const task = ref<TaskDetail | null>(null);
const loading = ref(false);
const activeTab = ref("overview");
const editVisible = ref(false);
const pipelineVisible = ref(false);
const actingPipelineId = ref("");
const builds = ref<BuildRecord[]>([]);
const buildingPipelineId = ref("");
const buildLogVisible = ref(false);
const activeBuild = ref<BuildRecord | null>(null);
const commits = ref<TaskCommit[]>([]);
let buildsTimer: ReturnType<typeof setInterval> | null = null;

const taskId = computed(() => props.taskId || String(route.params.id || ""));
const statusMeta = computed(() =>
  task.value ? TASK_STATUS_META[task.value.status] : null
);

const NEXT_ACTION: Record<string, { label: string; target: string; role: string }> = {
  none: { label: "开始开发", target: "dev", role: "dev" },
  dev: { label: "提测", target: "ready", role: "dev" },
  ready: { label: "开始测试", target: "testing", role: "qa" },
  testing: { label: "进入待发布", target: "release", role: "qa" },
  release: { label: "完成发布", target: "done", role: "qa" }
};

const nextAction = computed(() => (task.value ? NEXT_ACTION[task.value.status] : null));

const MERGE_PERMISSION: Record<string, string> = {
  qa: "merge_qa",
  uat: "merge_uat",
  release: "merge_release",
  master: "merge_master"
};

const MERGE_ALLOWED: Record<string, string[]> = {
  qa: ["none", "dev_merged"],
  uat: ["dev_passed"],
  release: ["testing"],
  master: ["release_verified"]
};

const CONFLICT_STAGE: Record<string, string> = {
  dev_conflict: "qa",
  test_conflict: "uat",
  release_conflict: "release",
  accept_conflict: "master"
};

const MERGE_LABEL: Record<string, string> = {
  qa: "合并 QA",
  uat: "合并 UAT",
  release: "合并 Release",
  master: "合回 master"
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("zh-CN");
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function formatCommitDate(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function canRoleAct(role: string): boolean {
  return auth.isAdmin || auth.user?.role === role;
}

function canMerge(pipeline: Pipeline, stage: string): boolean {
  return (
    MERGE_ALLOWED[stage].includes(pipeline.status) &&
    auth.hasPermission(MERGE_PERMISSION[stage])
  );
}

function canResolve(pipeline: Pipeline): boolean {
  const stage = CONFLICT_STAGE[pipeline.status];
  return Boolean(stage) && auth.hasPermission(MERGE_PERMISSION[stage]);
}

function openConflict(pipeline: Pipeline) {
  return pipeline.conflicts.find((conflict) => !conflict.resolvedAt) ?? null;
}

function hasStage(pipeline: Pipeline, stage: string): boolean {
  return pipeline.merges.some((merge) => merge.stage === stage && !merge.invalidatedAt);
}

const BUILD_LABEL: Record<string, string> = {
  dev_merged: "打包 QA",
  dev_built: "重新打包",
  testing: "打包 UAT",
  release_check: "打包 Release"
};

const BUILD_STAGE: Record<string, string> = {
  dev_merged: "qa",
  dev_built: "qa",
  testing: "uat",
  release_check: "release"
};

function canBuild(pipeline: Pipeline): boolean {
  const stage = BUILD_STAGE[pipeline.status];
  if (!stage || !auth.hasPermission("build_run")) return false;

  const stageRole = stage === "qa" ? "dev" : "qa";
  return auth.isAdmin || auth.user?.role === stageRole;
}

async function loadBuilds() {
  try {
    builds.value = await listTaskBuilds(taskId.value);
  } catch {
    builds.value = [];
  }

  if (builds.value.some((record) => record.status === "running")) {
    if (!buildsTimer) {
      buildsTimer = setInterval(async () => {
        await loadBuilds();
        await load();
      }, 2000);
    }
  } else if (buildsTimer) {
    clearInterval(buildsTimer);
    buildsTimer = null;
  }
}

async function loadCommits() {
  try {
    commits.value = await listTaskCommits(taskId.value, 20);
  } catch {
    commits.value = [];
  }
}

watch(activeTab, (value) => {
  if (value === "commits") loadCommits();
});

async function load() {
  loading.value = true;
  try {
    task.value = await getTask(taskId.value);
    await loadBuilds();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载任务详情失败"));
  } finally {
    loading.value = false;
  }
}

function onSaved(next: TaskDetail) {
  task.value = next;
}

async function onPipelineSaved() {
  await load();
}

async function advance() {
  if (!task.value || !nextAction.value) return;

  try {
    await ElMessageBox.confirm(
      `确认将任务推进到「${TASK_STATUS_META[nextAction.value.target].label}」？`,
      nextAction.value.label,
      { type: "info", confirmButtonText: "确认", cancelButtonText: "取消" }
    );
  } catch {
    return;
  }

  try {
    task.value = await advanceTaskStatus(task.value.id, nextAction.value.target);
    ElMessage.success(`任务已进入「${task.value.statusLabel}」`);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "推进任务状态失败"));
  }
}

async function doMerge(pipeline: Pipeline, stage: "qa" | "uat" | "release" | "master") {
  actingPipelineId.value = pipeline.id;
  try {
    await mergePipeline(pipeline.id, stage);
    ElMessage.success(`${MERGE_LABEL[stage]}完成`);
    await load();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, `${MERGE_LABEL[stage]}失败`));
    await load();
  } finally {
    actingPipelineId.value = "";
  }
}

async function resolve(pipeline: Pipeline) {
  actingPipelineId.value = pipeline.id;
  try {
    await resolvePipeline(pipeline.id);
    ElMessage.success("冲突已解决并完成合并");
    await load();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "解决冲突失败"));
  } finally {
    actingPipelineId.value = "";
  }
}

async function build(pipeline: Pipeline) {
  buildingPipelineId.value = pipeline.id;
  try {
    const record = await triggerBuild(pipeline.id);
    ElMessage.success("已进入打包队列");
    activeBuild.value = record;
    buildLogVisible.value = true;
    await load();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "触发打包失败"));
  } finally {
    buildingPipelineId.value = "";
  }
}

async function verdict(pipeline: Pipeline, pass: boolean) {
  let reason = "";

  if (!pass) {
    try {
      const result = await ElMessageBox.prompt("请填写自测拒绝原因", "自测拒绝", {
        confirmButtonText: "拒绝",
        cancelButtonText: "取消",
        inputPlaceholder: "例如 首页列表滚动卡顿"
      });
      reason = result.value || "自测拒绝";
    } catch {
      return;
    }
  } else {
    try {
      await ElMessageBox.confirm("确认 QA 包自测通过？", "自测通过", {
        type: "info",
        confirmButtonText: "通过",
        cancelButtonText: "取消"
      });
    } catch {
      return;
    }
  }

  try {
    await qaVerdict(pipeline.id, pass, reason || undefined);
    ElMessage.success(pass ? "已标记自测通过" : "已拒绝并退回开发");
    await load();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "自测判定失败"));
  }
}

function openBuildLog(record: BuildRecord) {
  activeBuild.value = record;
  buildLogVisible.value = true;
}

function downloadArtifact(artifactId: string) {
  window.open(artifactDownloadUrl(artifactId), "_blank");
}

function buildStatusClass(status: string): string {
  if (status === "success") return "bs-success";
  if (status === "failed") return "bs-failed";
  return "bs-running";
}

function formatDuration(value: number | null): string {
  if (!value && value !== 0) return "—";
  if (value < 1000) return `${value}ms`;
  return `${(value / 1000).toFixed(1)}s`;
}

async function rejectTest(pipeline: Pipeline) {
  let reason = "";
  try {
    const result = await ElMessageBox.prompt("请填写测试不通过原因", "测试不通过", {
      confirmButtonText: "退回开发",
      cancelButtonText: "取消",
      inputPlaceholder: "例如 UAT 包登录态失效"
    });
    reason = result.value || "测试不通过";
  } catch {
    return;
  }

  try {
    await testReject(pipeline.id, reason);
    ElMessage.success("已退回开发，任务回到开发中");
    await load();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "测试不通过操作失败"));
  }
}

async function verify(pipeline: Pipeline, pass: boolean) {
  let reason = "";

  if (!pass) {
    try {
      const result = await ElMessageBox.prompt("请填写验证不通过原因", "验证不通过", {
        confirmButtonText: "不通过",
        cancelButtonText: "取消",
        inputPlaceholder: "例如 Release 包闪退"
      });
      reason = result.value || "Release 验证不通过";
    } catch {
      return;
    }
  } else {
    try {
      await ElMessageBox.confirm("确认 Release 验证通过？", "验证通过", {
        type: "info",
        confirmButtonText: "通过",
        cancelButtonText: "取消"
      });
    } catch {
      return;
    }
  }

  try {
    await verifyPipeline(pipeline.id, pass, reason || undefined);
    ElMessage.success(pass ? "Release 验证通过" : "已退回测试中");
    await load();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "发布验证失败"));
  }
}

async function removeTask() {
  if (!task.value) return;

  try {
    await ElMessageBox.confirm(
      `确认删除任务「${task.value.title}」？删除后任务从需求中移除，历史流水与产物保留。`,
      "删除任务",
      { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" }
    );
  } catch {
    return;
  }

  try {
    await deleteTask(task.value.id);
    ElMessage.success("任务已删除");
    if (props.embedded) {
      emit("close");
      return;
    }
    router.push(`/reqs/${task.value.requirement.id}`);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "删除任务失败"));
  }
}

onMounted(load);

onBeforeUnmount(() => {
  if (buildsTimer) clearInterval(buildsTimer);
});
</script>

<template>
  <div v-loading="loading" class="page-stack">
    <div v-if="!embedded" class="crumb">
      <el-button link :icon="ArrowLeft" @click="router.push('/reqs')">需求管理</el-button>
      <span class="crumb-sep">/</span>
      <el-button v-if="task" link @click="router.push(`/reqs/${task.requirement.id}`)">
        {{ task.requirement.code }}
      </el-button>
      <span class="crumb-sep">/</span>
      <span>{{ task?.title ?? "任务详情" }}</span>
    </div>

    <template v-if="task">
      <section class="detail-card">
        <div class="detail-top">
          <div class="detail-main">
            <div class="detail-code">{{ task.requirement.code }} · 任务</div>
            <h2 class="detail-title">{{ task.title }}</h2>
            <p class="detail-desc">{{ task.description || "暂无任务描述" }}</p>
          </div>
          <div class="detail-badges">
            <span class="pri" :class="PRIORITY_META[task.priority].cls">
              {{ PRIORITY_META[task.priority].label }}
            </span>
            <span class="task-status" :class="statusMeta?.cls">{{ task.statusLabel }}</span>
            <span v-if="task.overdueType" class="overdue-tag">
              {{ task.overdueType === "dev" ? "开发超时" : "测试超时" }}
            </span>
          </div>
        </div>

        <div class="detail-meta">
          <span>任务负责人 <b>{{ task.owner.name }}</b></span>
          <span>开始 <b>{{ formatDate(task.startAt) }}</b></span>
          <span>截止 <b>{{ formatDate(task.dueAt) }}</b></span>
          <span>CI 流水 <b>{{ task.pipelineCount }}</b></span>
          <span>进度 <b>{{ task.progress }}%</b></span>
        </div>

        <div class="detail-actions">
          <el-button v-if="auth.isAdmin" type="danger" plain :icon="Delete" @click="removeTask">
            删除任务
          </el-button>
          <el-button
            v-if="nextAction && canRoleAct(nextAction.role)"
            type="primary"
            @click="advance"
          >
            {{ nextAction.label }}
          </el-button>
          <el-button
            v-if="auth.hasPermission('task_create')"
            :icon="Edit"
            @click="editVisible = true"
          >
            编辑任务
          </el-button>
        </div>
      </section>

      <section class="tab-card">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="概览" name="overview">
            <div class="overview-grid">
              <div class="overview-item">
                <span class="ov-label">所属需求</span>
                <b>{{ task.requirement.code }} · {{ task.requirement.title }}</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">任务负责人</span>
                <b>{{ task.owner.name }}（{{ task.owner.account }}）</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">优先级</span>
                <b>{{ PRIORITY_META[task.priority].label }}</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">当前状态</span>
                <b>{{ task.statusLabel }}</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">最近状态变更</span>
                <b>{{ formatDate(task.statusAt) }}</b>
              </div>
              <div class="overview-item">
                <span class="ov-label">创建时间</span>
                <b>{{ formatDate(task.createdAt) }}</b>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="CI 流水" name="pipelines">
            <div class="pipeline-head">
              <span class="muted-text">
                共 {{ task.pipelines.length }} 条流水 · 合并 / 打包 / 验证都在这里操作
              </span>
              <el-button
                v-if="auth.hasPermission('pipe_create')"
                type="primary"
                size="small"
                :icon="Plus"
                @click="pipelineVisible = true"
              >
                新建流水
              </el-button>
            </div>

            <div v-if="task.pipelines.length" class="pipe-list">
              <article v-for="pipeline in task.pipelines" :key="pipeline.id" class="pipe-card">
                <div class="pipe-top">
                  <div>
                    <div class="pipe-name">
                      {{ pipeline.name }}
                      <span class="platform-tag">{{ pipeline.app.platform.toUpperCase() }}</span>
                      <span class="artifact-tag">{{ pipeline.app.artifactType }}</span>
                    </div>
                    <div class="pipe-repo">{{ pipeline.app.repo }}</div>
                  </div>
                  <span class="pipe-status" :class="pipelineStatusClass(pipeline.status)">
                    {{ pipeline.statusLabel }}
                  </span>
                </div>

                <div class="pipe-branch">
                  <span class="branch-key">分支</span>
                  <code>{{ pipeline.branch }}</code>
                </div>

                <div class="stage-row">
                  <span
                    v-for="stage in PIPELINE_STAGES"
                    :key="stage.key"
                    class="stage-dot"
                    :class="{ on: hasStage(pipeline, stage.key) }"
                    :title="stage.label"
                  />
                  <span class="stage-label">{{ pipeline.progress }}%</span>
                </div>

                <div v-if="openConflict(pipeline)" class="conflict-box">
                  <b>合并冲突 · {{ openConflict(pipeline)?.stage.toUpperCase() }}</b>
                  <div>临时分支：<code>{{ openConflict(pipeline)?.tempBranch }}</code></div>
                  <div class="conflict-files">
                    冲突文件：{{ openConflict(pipeline)?.files.join("、") }}
                  </div>
                  <div class="conflict-note">
                    请在临时分支解决冲突并推送，然后点击「已解决冲突 · 合并」。
                  </div>
                </div>

                <div class="pipe-actions">
                  <el-button
                    v-if="canMerge(pipeline, 'qa')"
                    size="small"
                    type="primary"
                    :loading="actingPipelineId === pipeline.id"
                    @click="doMerge(pipeline, 'qa')"
                  >
                    {{ pipeline.status === "dev_merged" ? "重新合并 QA" : "合并 QA" }}
                  </el-button>
                  <el-button
                    v-if="isConflictStatus(pipeline.status) && canResolve(pipeline)"
                    size="small"
                    type="primary"
                    :loading="actingPipelineId === pipeline.id"
                    @click="resolve(pipeline)"
                  >
                    已解决冲突 · 合并
                  </el-button>
                  <el-button
                    v-if="canMerge(pipeline, 'uat')"
                    size="small"
                    type="primary"
                    :loading="actingPipelineId === pipeline.id"
                    @click="doMerge(pipeline, 'uat')"
                  >
                    合并 UAT
                  </el-button>
                  <el-button
                    v-if="canMerge(pipeline, 'release')"
                    size="small"
                    type="primary"
                    :loading="actingPipelineId === pipeline.id"
                    @click="doMerge(pipeline, 'release')"
                  >
                    合并 Release
                  </el-button>
                  <el-button
                    v-if="canMerge(pipeline, 'master')"
                    size="small"
                    type="primary"
                    :loading="actingPipelineId === pipeline.id"
                    @click="doMerge(pipeline, 'master')"
                  >
                    合回 master
                  </el-button>

                  <el-button
                    v-if="canBuild(pipeline)"
                    size="small"
                    :loading="buildingPipelineId === pipeline.id"
                    @click="build(pipeline)"
                  >
                    {{ BUILD_LABEL[pipeline.status] }}
                  </el-button>
                  <template
                    v-if="
                      pipeline.status === 'dev_built' &&
                      auth.hasPermission('build_run') &&
                      (auth.isAdmin || auth.user?.role === 'dev')
                    "
                  >
                    <el-button size="small" type="success" @click="verdict(pipeline, true)">
                      自测通过
                    </el-button>
                    <el-button size="small" type="danger" plain @click="verdict(pipeline, false)">
                      自测不通过
                    </el-button>
                  </template>

                  <el-button
                    v-if="pipeline.status === 'testing' && auth.hasPermission('test_run')"
                    size="small"
                    type="danger"
                    plain
                    @click="rejectTest(pipeline)"
                  >
                    测试不通过
                  </el-button>
                  <template v-if="pipeline.status === 'release_check' && auth.hasPermission('verify')">
                    <el-button size="small" type="success" @click="verify(pipeline, true)">
                      验证通过
                    </el-button>
                    <el-button size="small" type="danger" plain @click="verify(pipeline, false)">
                      验证不通过
                    </el-button>
                  </template>

                  <span v-if="pipeline.status === 'none'" class="stage-hint">
                    任务进入开发中后可合并 QA
                  </span>
                  <span v-else-if="pipeline.status === 'dev_passed'" class="stage-hint">
                    任务进入测试中后可合并 UAT
                  </span>
                  <span v-else-if="pipeline.status === 'testing'" class="stage-hint">
                    打包 UAT 后可合并 Release
                  </span>
                  <span v-else-if="pipeline.status === 'release_check'" class="stage-hint">
                    Release 打包后等待验证
                  </span>
                  <span v-else-if="pipeline.status === 'done'" class="stage-hint">
                    流水已结束，可从构建记录查看日志
                  </span>
                </div>

                <div v-if="pipeline.merges.length" class="merge-list">
                  <div v-for="merge in pipeline.merges" :key="merge.id" class="merge-row">
                    <span class="merge-stage">{{ merge.stage.toUpperCase() }}</span>
                    <code class="merge-branches">{{ merge.fromBranch }} → {{ merge.toBranch }}</code>
                    <span class="merge-sha">{{ merge.sha.slice(0, 7) }}</span>
                    <span class="merge-commits">{{ merge.commits }} commits</span>
                    <span class="merge-time">{{ formatDateTime(merge.mergedAt) }}</span>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="tab-empty">
              还没有 CI 流水。新建流水后，任务进入开发中即可合并 QA。
            </div>
          </el-tab-pane>

          <el-tab-pane label="提交记录" name="commits">
            <el-table
              v-if="commits.length"
              :data="commits"
              class="build-table"
              empty-text="暂无提交"
            >
              <el-table-column label="提交" width="100">
                <template #default="{ row }">
                  <code class="commit-sha">{{ row.sha.slice(0, 7) }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="说明" min-width="260" show-overflow-tooltip />
              <el-table-column prop="author" label="作者" width="120" />
              <el-table-column label="时间" width="180">
                <template #default="{ row }">{{ formatCommitDate(row.date) }}</template>
              </el-table-column>
            </el-table>
            <div v-else class="tab-empty">
              暂无提交记录。任务的 Feature 分支尚未接入本地 workspace，真实 Git 接入后会展示最近 20 条提交。
            </div>
          </el-tab-pane>

          <el-tab-pane label="构建记录" name="builds">
            <el-table
              v-if="builds.length"
              :data="builds"
              class="build-table"
              empty-text="暂无构建"
            >
              <el-table-column label="流水 / 阶段" min-width="200">
                <template #default="{ row }">
                  <div class="build-name">{{ row.pipeline.name }}</div>
                  <div class="build-sub">
                    {{ row.stageLabel }} · {{ row.pipeline.branch }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="状态" width="130">
                <template #default="{ row }">
                  <span class="build-status" :class="buildStatusClass(row.status)">
                    {{ row.statusLabel }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="进度" width="150">
                <template #default="{ row }">
                  <div class="build-progress">
                    <div class="build-progress-bar">
                      <span
                        :class="{ failed: row.status === 'failed' }"
                        :style="{ width: `${row.status === 'failed' ? 100 : row.progress}%` }"
                      />
                    </div>
                    <span class="build-progress-text">
                      {{ row.status === "failed" ? "失败" : `${row.progress}%` }}
                    </span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="耗时" width="90">
                <template #default="{ row }">{{ formatDuration(row.durationMs) }}</template>
              </el-table-column>

              <el-table-column label="触发人" width="100">
                <template #default="{ row }">{{ row.triggeredByName || "—" }}</template>
              </el-table-column>

              <el-table-column label="开始时间" width="170">
                <template #default="{ row }">{{ row.startedAt ? formatDateTime(row.startedAt) : "排队中" }}</template>
              </el-table-column>

              <el-table-column label="" width="150" align="right">
                <template #default="{ row }">
                  <el-button
                    v-if="row.artifacts.length"
                    size="small"
                    type="primary"
                    @click="downloadArtifact(row.artifacts[0].id)"
                  >
                    下载产物
                  </el-button>
                  <el-button size="small" @click="openBuildLog(row)">日志</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="tab-empty">
              还没有构建记录。在 CI 流水里打包后，这里会展示每次构建的状态、耗时与日志。
            </div>
          </el-tab-pane>
        </el-tabs>
      </section>

      <TaskFormDialog v-model="editVisible" :task="task" @saved="onSaved" />
      <PipelineFormDialog v-model="pipelineVisible" :task="task" @saved="onPipelineSaved" />
      <BuildLogDialog v-model="buildLogVisible" :build="activeBuild" />
    </template>

    <section v-else-if="!loading" class="empty-card">
      <div class="empty-title">任务不存在或已被删除</div>
      <el-button @click="router.push('/reqs')">返回需求列表</el-button>
    </section>
  </div>
</template>

<style scoped>
.crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12.5px;
}

.crumb-sep {
  color: #cbd5e1;
}

.detail-card,
.tab-card {
  padding: 20px 22px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.detail-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.detail-main {
  min-width: 0;
}

.detail-code {
  color: var(--muted);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}

.detail-title {
  margin: 4px 0 6px;
  font-size: 21px;
  line-height: 1.35;
}

.detail-desc {
  margin: 0;
  max-width: 820px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.detail-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  flex-wrap: wrap;
}

.pri {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.pri-p0 {
  background: #fdecec;
  color: #b91c1c;
}

.pri-p1 {
  background: #fff5e6;
  color: #b45309;
}

.pri-p2 {
  background: #f1f5f9;
  color: #475569;
}

.task-status {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.ts-none {
  background: #f1f5f9;
  color: #64748b;
}

.ts-dev {
  background: #eef3ff;
  color: #1d4ed8;
}

.ts-ready {
  background: #e8f5f2;
  color: #0f766e;
}

.ts-testing {
  background: #f4f0ff;
  color: #5b46b0;
}

.ts-release {
  background: #fff5e6;
  color: #b45309;
}

.ts-done {
  background: #e9f7ee;
  color: #15803d;
}

.overdue-tag {
  color: #b91c1c;
  font-size: 10.5px;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
  color: var(--muted);
  font-size: 12px;
}

.detail-meta b {
  color: var(--ink-2);
  font-weight: 500;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 14px;
  border: 1px solid var(--line-soft);
  border-radius: 9px;
  background: #f8fafc;
}

.ov-label {
  color: var(--muted);
  font-size: 11px;
}

.overview-item b {
  font-size: 13px;
  font-weight: 500;
}

.tab-empty {
  padding: 34px 24px;
  border: 1px dashed var(--line);
  border-radius: 10px;
  color: var(--muted);
  font-size: 12.5px;
  text-align: center;
}

.empty-card {
  padding: 44px 24px;
  background: #ffffff;
  border: 1px dashed var(--line);
  border-radius: 14px;
  text-align: center;
}

.empty-title {
  margin-bottom: 16px;
  font-size: 17px;
  font-weight: 600;
}

.pipeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.pipe-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pipe-card {
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #ffffff;
}

.pipe-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.pipe-name {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  font-weight: 600;
}

.platform-tag,
.artifact-tag {
  padding: 1px 6px;
  border-radius: 4px;
  background: #f1f5f9;
  color: var(--muted);
  font-size: 10px;
  font-weight: 500;
}

.artifact-tag {
  background: #eef3ff;
  color: #1d4ed8;
}

.pipe-repo {
  margin-top: 2px;
  color: var(--muted);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pipe-status {
  flex: 0 0 auto;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
}

.ps-none {
  background: #f1f5f9;
  color: #64748b;
}

.ps-busy {
  background: #eef3ff;
  color: #1d4ed8;
}

.ps-merged,
.ps-built {
  background: #e8f5f2;
  color: #0f766e;
}

.ps-passed {
  background: #e9f7ee;
  color: #15803d;
}

.ps-testing {
  background: #f4f0ff;
  color: #5b46b0;
}

.ps-check {
  background: #fff5e6;
  color: #b45309;
}

.ps-verified,
.ps-done {
  background: #e9f7ee;
  color: #15803d;
}

.ps-conflict {
  background: #fdecec;
  color: #b91c1c;
}

.pipe-branch {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--muted);
  font-size: 11.5px;
}

.pipe-branch code {
  color: var(--ink-2);
  font-size: 11px;
}

.branch-key {
  color: var(--muted);
  font-size: 11px;
}

.stage-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
}

.stage-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #e2e8f0;
}

.stage-dot.on {
  background: var(--blue);
}

.stage-label {
  margin-left: 5px;
  color: var(--muted);
  font-size: 10.5px;
}

.conflict-box {
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px solid #f1cccc;
  border-radius: 8px;
  background: #fdf6f6;
  color: #7f1d1d;
  font-size: 11.5px;
  line-height: 1.7;
}

.conflict-box b {
  display: block;
  margin-bottom: 3px;
  color: #991b1b;
  font-size: 12px;
}

.conflict-box code {
  font-size: 10.5px;
  word-break: break-all;
}

.conflict-files {
  color: #7f1d1d;
}

.conflict-note {
  color: #a15c5c;
  font-size: 11px;
}

.pipe-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.stage-hint {
  color: var(--muted);
  font-size: 11px;
}

.merge-list {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--line);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.merge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 10.5px;
}

.merge-stage {
  padding: 0 6px;
  border-radius: 4px;
  background: #f1f5f9;
  color: var(--ink-2);
  font-weight: 600;
}

.merge-branches {
  color: var(--ink-2);
  font-size: 10.5px;
}

.merge-sha {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.build-table {
  width: 100%;
  font-size: 12.5px;
}

.build-name {
  font-weight: 500;
}

.build-sub {
  margin-top: 2px;
  color: var(--muted);
  font-size: 11px;
}

.build-status {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
}

.bs-running {
  background: #eef3ff;
  color: #1d4ed8;
}

.bs-success {
  background: #e9f7ee;
  color: #15803d;
}

.bs-failed {
  background: #fdecec;
  color: #b91c1c;
}

.build-progress {
  display: flex;
  align-items: center;
  gap: 7px;
}

.build-progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #eef2f7;
  overflow: hidden;
}

.build-progress-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--blue);
}

.build-progress-bar span.failed {
  background: #dc2626;
}

.build-progress-text {
  min-width: 32px;
  color: var(--muted);
  font-size: 10.5px;
  text-align: right;
}

.commit-sha {
  font-size: 11px;
}
</style>
