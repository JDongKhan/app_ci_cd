<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { artifactDownloadUrl, listArtifacts } from "@/api/artifacts";
import { getErrorMessage } from "@/api/http";
import BuildLogDialog from "@/components/builds/BuildLogDialog.vue";
import type { BuildRecord } from "@/types";

const builds = ref<BuildRecord[]>([]);
const loading = ref(false);
const statusFilter = ref("");
const logVisible = ref(false);
const activeBuild = ref<BuildRecord | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;

const stats = computed(() => {
  const success = builds.value.filter((build) => build.status === "success").length;
  const running = builds.value.filter((build) => build.status === "running").length;
  const failed = builds.value.filter((build) => build.status === "failed").length;
  return { success, running, failed };
});

async function load() {
  loading.value = true;
  try {
    builds.value = await listArtifacts(statusFilter.value || undefined);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "加载打包产物失败"));
  } finally {
    loading.value = false;
  }

  if (builds.value.some((build) => build.status === "running")) {
    if (!timer) {
      timer = setInterval(load, 2000);
    }
  } else if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function buildStatusClass(status: string): string {
  if (status === "success") return "bs-success";
  if (status === "failed") return "bs-failed";
  return "bs-running";
}

function openLog(build: BuildRecord) {
  activeBuild.value = build;
  logVisible.value = true;
}

function download(artifactId: string) {
  window.open(artifactDownloadUrl(artifactId), "_blank");
}

onMounted(load);

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="page-stack">
    <section class="page-head">
      <div>
        <h1>打包产物</h1>
        <p class="sub">
          已入库产物可下载；正在打包与打包失败的构建也在列表里，点行看详情与打包日志。
        </p>
      </div>
      <div class="head-actions">
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </section>

    <section class="page-toolbar">
      <el-select v-model="statusFilter" class="filter-select" placeholder="全部状态" clearable @change="load">
        <el-option label="已入库" value="success" />
        <el-option label="打包中" value="running" />
        <el-option label="失败" value="failed" />
      </el-select>
      <span class="muted-text">
        已入库 {{ stats.success }} · 打包中 {{ stats.running }} · 失败 {{ stats.failed }}
      </span>
    </section>

    <section v-loading="loading" class="table-card">
      <el-table v-if="builds.length" :data="builds" stripe empty-text="暂无构建">
        <el-table-column label="流水 / 应用" min-width="220">
          <template #default="{ row }">
            <div class="art-name">{{ row.pipeline.name }}</div>
            <div class="art-sub">
              {{ row.pipeline.app.name }} · {{ row.pipeline.app.platform.toUpperCase() }} ·
              {{ row.pipeline.branch }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="版本 / Build" width="140">
          <template #default="{ row }">
            <div>{{ row.versionName || "—" }}</div>
            <div class="art-sub">#{{ row.buildNumber }}</div>
          </template>
        </el-table-column>

        <el-table-column label="阶段" width="90">
          <template #default="{ row }">
            <span class="stage-tag">{{ row.stageLabel }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <span class="build-status" :class="buildStatusClass(row.status)">
              {{ row.statusLabel }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="产物文件" min-width="220">
          <template #default="{ row }">
            <template v-if="row.artifacts.length">
              <div v-for="artifact in row.artifacts" :key="artifact.id" class="artifact-line">
                <span class="artifact-name" :title="artifact.displayName">
                  {{ artifact.displayName }}
                </span>
                <span class="artifact-size">{{ formatSize(artifact.sizeBytes) }}</span>
              </div>
            </template>
            <span v-else class="muted-text">
              {{ row.status === "running" ? `打包中 ${row.progress}%` : row.failReason || "无产物" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="触发人" width="100">
          <template #default="{ row }">{{ row.triggeredByName || "—" }}</template>
        </el-table-column>

        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.startedAt || row.createdAt) }}</template>
        </el-table-column>

        <el-table-column label="" width="150" align="right">
          <template #default="{ row }">
            <el-button
              v-if="row.artifacts.length"
              size="small"
              type="primary"
              @click="download(row.artifacts[0].id)"
            >
              下载
            </el-button>
            <el-button size="small" @click="openLog(row)">日志</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-else-if="!loading" class="empty-card">
        <div class="empty-title">暂无打包记录</div>
        <p>在任务的 CI 流水中点击打包后，构建与产物会出现在这里。</p>
      </div>
    </section>

    <BuildLogDialog v-model="logVisible" :build="activeBuild" />
  </div>
</template>

<style scoped>
.art-name {
  font-weight: 500;
}

.art-sub {
  margin-top: 2px;
  color: var(--muted);
  font-size: 11px;
}

.stage-tag {
  padding: 1px 7px;
  border-radius: 4px;
  background: #f1f5f9;
  color: var(--ink-2);
  font-size: 10.5px;
  font-weight: 600;
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

.artifact-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.artifact-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink-2);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}

.artifact-size {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 10.5px;
}

.empty-card {
  padding: 44px 24px;
  text-align: center;
}

.empty-title {
  font-size: 17px;
  font-weight: 600;
}

.empty-card p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 12.5px;
}
</style>
