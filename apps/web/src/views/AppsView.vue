<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { createApp, listApps, updateApp } from "@/api/apps";
import { getErrorMessage } from "@/api/http";
import { useAuthStore } from "@/stores/auth";
import type {
  AppBranches,
  AppPlatform,
  AppRecord,
  ArtifactType,
  BranchStage
} from "@/types";

const auth = useAuthStore();

const PLATFORM_OPTIONS: { value: AppPlatform; label: string }[] = [
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "server", label: "服务端" },
  { value: "web", label: "Web" }
];

const ARTIFACT_OPTIONS: ArtifactType[] = ["apk", "ipa", "jar", "war"];

const BRANCH_STAGES: { key: BranchStage; label: string }[] = [
  { key: "qa", label: "QA" },
  { key: "uat", label: "UAT" },
  { key: "release", label: "Release" },
  { key: "master", label: "master" }
];

const DEFAULT_BRANCHES: AppBranches = {
  qa: "qa",
  uat: "uat",
  release: "release",
  master: "master"
};

const apps = ref<AppRecord[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const editingId = ref("");
const formRef = ref<FormInstance>();
const submitting = ref(false);

const form = reactive({
  name: "",
  platform: "android" as AppPlatform,
  code: "",
  repo: "",
  defaultBranch: "main",
  buildScript: "./build_app",
  artifactType: "apk" as ArtifactType,
  artifactPattern: "",
  channels: "",
  machine: "builder-01",
  stack: "",
  branches: { ...DEFAULT_BRANCHES } as AppBranches
});

const rules: FormRules = {
  name: [
    { required: true, message: "请输入应用名称", trigger: "blur" },
    { max: 64, message: "应用名称不超过 64 个字符", trigger: "blur" }
  ],
  platform: [{ required: true, message: "请选择平台", trigger: "change" }],
  code: [
    { required: true, message: "请输入项目标识", trigger: "blur" },
    { max: 128, message: "项目标识不超过 128 个字符", trigger: "blur" }
  ],
  repo: [{ required: true, message: "请输入 Git 仓库地址", trigger: "blur" }],
  artifactType: [{ required: true, message: "请选择产物类型", trigger: "change" }]
};

function platformLabel(platform: AppPlatform): string {
  return PLATFORM_OPTIONS.find((item) => item.value === platform)?.label ?? platform;
}

function patternSummary(pattern: string | null): string {
  if (!pattern) return "—";
  const list = pattern
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return list.length ? list.join("、") : "—";
}

function channelSummary(channels: string | null): string {
  if (!channels) return "—";
  const list = channels
    .split(/[,，]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return list.length ? list.join("、") : "—";
}

async function load() {
  loading.value = true;
  try {
    apps.value = await listApps();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载应用配置失败"));
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  dialogMode.value = "create";
  editingId.value = "";
  form.name = "";
  form.platform = "android";
  form.code = "";
  form.repo = "";
  form.defaultBranch = "main";
  form.buildScript = "./build_app";
  form.artifactType = "apk";
  form.artifactPattern = "";
  form.channels = "";
  form.machine = "builder-01";
  form.stack = "";
  form.branches = { ...DEFAULT_BRANCHES };
  dialogVisible.value = true;
  formRef.value?.clearValidate();
}

function openEdit(app: AppRecord) {
  dialogMode.value = "edit";
  editingId.value = app.id;
  form.name = app.name;
  form.platform = app.platform;
  form.code = app.code;
  form.repo = app.repo;
  form.defaultBranch = app.defaultBranch;
  form.buildScript = app.buildScript;
  form.artifactType = app.artifactType;
  form.artifactPattern = app.artifactPattern ?? "";
  form.channels = app.channels ?? "";
  form.machine = app.machine;
  form.stack = app.stack ?? "";
  form.branches = { ...app.branches };
  dialogVisible.value = true;
  formRef.value?.clearValidate();
}

async function submit() {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  const payload = {
    name: form.name.trim(),
    platform: form.platform,
    code: form.code.trim(),
    repo: form.repo.trim(),
    defaultBranch: form.defaultBranch.trim() || "main",
    buildScript: form.buildScript.trim() || "./build_app",
    artifactType: form.artifactType,
    artifactPattern: form.artifactPattern.trim() || null,
    channels: form.channels.trim() || null,
    branches: { ...form.branches },
    machine: form.machine.trim() || "builder-01",
    stack: form.stack.trim() || null
  };

  submitting.value = true;
  try {
    if (dialogMode.value === "create") {
      await createApp(payload);
      ElMessage.success("应用已创建");
    } else {
      await updateApp(editingId.value, payload);
      ElMessage.success("应用配置已更新");
    }
    dialogVisible.value = false;
    await load();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "保存应用配置失败"));
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-stack">
    <section class="page-head">
      <div>
        <h1>应用配置</h1>
        <p class="sub">
          应用按平台分开建（Android / iOS 各一个），仓库、分支映射、产物类型与构建脚本都在这里配置；CI 流水只选应用和 Feature 分支。
        </p>
      </div>
      <div class="head-actions">
        <el-button :icon="Refresh" @click="load">刷新</el-button>
        <el-button v-if="auth.isAdmin" type="primary" :icon="Plus" @click="openCreate">
          新建应用
        </el-button>
      </div>
    </section>

    <section v-loading="loading" class="apps-section">
      <div v-if="apps.length" class="app-grid">
        <article v-for="app in apps" :key="app.id" class="app-card">
          <div class="app-top">
            <div>
              <div class="app-name">
                {{ app.name }}
                <span class="platform-pill" :class="`platform-${app.platform}`">
                  {{ platformLabel(app.platform) }}
                </span>
              </div>
              <div class="app-code">{{ app.code }}</div>
            </div>
            <span class="artifact-pill">{{ app.artifactType }}</span>
          </div>

          <div class="app-repo" :title="app.repo">{{ app.repo }}</div>

          <div class="app-meta">
            <span>{{ app.stack || "未填写技术栈" }}</span>
            <span>{{ app.machine }}</span>
            <span>默认分支 {{ app.defaultBranch }}</span>
          </div>

          <div class="app-facts">
            <span>产物 <b>{{ app.artifactType }}</b></span>
            <span>路径 <b>{{ patternSummary(app.artifactPattern) }}</b></span>
            <span>渠道 <b>{{ channelSummary(app.channels) }}</b></span>
          </div>

          <div class="app-script">
            <span class="script-label">构建脚本</span>
            <pre class="script-code">{{ app.buildScript }}</pre>
          </div>

          <div class="branch-line">
            <span class="branch-key">分支</span>
            <span
              v-for="stage in BRANCH_STAGES"
              :key="stage.key"
              class="branch-chip"
              :class="`branch-${stage.key}`"
            >
              {{ app.branches[stage.key] }}
            </span>
          </div>

          <div class="app-foot">
            <el-button v-if="auth.isAdmin" size="small" @click="openEdit(app)">
              编辑配置
            </el-button>
            <span v-else class="readonly-hint">只读 · 仅管理员可修改</span>
          </div>
        </article>
      </div>

      <div v-else class="empty-card">
        <div class="empty-title">还没有应用</div>
        <p>应用描述仓库、构建脚本与产物，创建后才能在任务里挂 CI 流水。</p>
        <el-button v-if="auth.isAdmin" type="primary" :icon="Plus" @click="openCreate">
          新建应用
        </el-button>
      </div>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建应用' : '编辑应用配置'"
      width="720px"
      destroy-on-close
    >
      <p class="dialog-hint">应用只描述仓库、构建脚本与产物，被流水引用；构建脚本等同执行任意命令，仅管理员可改。</p>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="应用名称" prop="name">
            <el-input v-model="form.name" placeholder="例如 出行 App" />
          </el-form-item>

          <el-form-item label="平台" prop="platform">
            <el-select v-model="form.platform" class="full-width">
              <el-option
                v-for="option in PLATFORM_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="项目标识" prop="code">
            <el-input v-model="form.code" placeholder="例如 com.travel.overseas.app" />
          </el-form-item>

          <el-form-item label="默认分支">
            <el-input v-model="form.defaultBranch" placeholder="main" />
          </el-form-item>

          <el-form-item class="full-span" label="Git 仓库地址" prop="repo">
            <el-input v-model="form.repo" placeholder="git@git.example.com:travel/app.git" />
          </el-form-item>

          <el-form-item class="full-span" label="构建脚本">
            <el-input
              v-model="form.buildScript"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 12 }"
              class="script-input"
              placeholder="支持多行命令，例如：&#10;set -e&#10;./build_app"
            />
            <span class="field-hint">脚本按多行原样用 bash 执行，支持 set -e、变量与管道等 shell 语法。</span>
          </el-form-item>

          <el-form-item label="产物类型" prop="artifactType">
            <el-select v-model="form.artifactType" class="full-width">
              <el-option
                v-for="type in ARTIFACT_OPTIONS"
                :key="type"
                :label="type"
                :value="type"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="构建机">
            <el-input v-model="form.machine" placeholder="builder-01" />
          </el-form-item>

          <el-form-item label="产物扫描目录">
            <el-input
              v-model="form.artifactPattern"
              type="textarea"
              :rows="3"
              placeholder="每行一个 glob，例如：&#10;build/**/*.apk&#10;download/**/*.apk"
            />
            <span class="field-hint">
              支持多个匹配规则，每行一个（也可用逗号分隔）；留空时按产物类型使用默认规则。
            </span>
          </el-form-item>

          <el-form-item label="渠道">
            <el-input
              v-model="form.channels"
              placeholder="多个渠道用逗号隔开，如 official,googleplay,huawei"
            />
            <span class="field-hint">打包弹窗的渠道下拉从这里读取，支持多个，逗号分隔。</span>
          </el-form-item>

          <el-form-item label="技术栈">
            <el-input v-model="form.stack" placeholder="例如 Flutter 3.24" />
          </el-form-item>

          <el-form-item class="full-span" label="分支映射">
            <div class="branch-inputs">
              <div v-for="stage in BRANCH_STAGES" :key="stage.key" class="branch-input">
                <span class="branch-key">{{ stage.label }}</span>
                <el-input v-model="form.branches[stage.key]" :placeholder="stage.key" />
              </div>
            </div>
            <span class="field-hint">流水按阶段合并到这里配置的真实分支。</span>
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">
          {{ dialogMode === "create" ? "创建应用" : "保存配置" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.apps-section {
  min-height: 160px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
}

.app-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 18px 14px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.app-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.app-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}

.platform-pill {
  padding: 1px 7px;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 600;
}

.platform-android {
  background: #e9f7ee;
  color: #15803d;
}

.platform-ios {
  background: #eef3ff;
  color: #1d4ed8;
}

.platform-server {
  background: #f4f0ff;
  color: #5b46b0;
}

.platform-web {
  background: #fff5e6;
  color: #b45309;
}

.app-code {
  margin-top: 2px;
  color: var(--muted);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}

.artifact-pill {
  flex: 0 0 auto;
  padding: 2px 9px;
  border-radius: 999px;
  background: #f1f5f9;
  color: var(--ink-2);
  font-size: 11px;
  font-weight: 600;
}

.app-repo {
  padding: 6px 9px;
  border: 1px solid var(--line-soft);
  border-radius: 6px;
  background: #f8fafc;
  color: var(--ink-2);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  color: var(--muted);
  font-size: 11.5px;
}

.app-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  color: var(--muted);
  font-size: 11.5px;
}

.app-facts b {
  margin-left: 3px;
  color: var(--ink-2);
  font-weight: 500;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}

.app-script {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.script-label {
  color: var(--muted);
  font-size: 11.5px;
}

.script-code {
  margin: 0;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink-2);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 180px;
  overflow: auto;
}

.script-input :deep(.el-textarea__inner) {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
}

.branch-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px dashed var(--line);
}

.branch-key {
  color: var(--muted);
  font-size: 11px;
}

.branch-chip {
  padding: 1px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: var(--ink-2);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10.5px;
}

.branch-qa {
  background: #e8f5f2;
  color: #0f766e;
}

.branch-uat {
  background: #eef3ff;
  color: #1d4ed8;
}

.branch-release {
  background: #fff5e6;
  color: #b45309;
}

.branch-master {
  background: #f1f5f9;
  color: #334155;
}

.app-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 2px;
}

.readonly-hint {
  color: var(--muted);
  font-size: 11px;
}

.empty-card {
  padding: 44px 24px;
  background: #ffffff;
  border: 1px dashed var(--line);
  border-radius: 14px;
  text-align: center;
}

.empty-title {
  font-size: 17px;
  font-weight: 600;
}

.empty-card p {
  margin: 8px 0 16px;
  color: var(--muted);
  font-size: 12.5px;
}

.full-span {
  grid-column: 1 / -1;
}

.branch-inputs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}

.branch-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-hint {
  margin-top: 4px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .branch-inputs {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
