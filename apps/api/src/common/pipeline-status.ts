export const PIPELINE_STATUS_LABELS: Record<string, string> = {
  none: "未开始",
  dev_merging: "QA 合并中",
  dev_conflict: "QA 合并冲突",
  dev_merged: "已合入 QA",
  dev_built: "QA 包就绪",
  dev_passed: "自测通过",
  test_merging: "UAT 合并中",
  test_conflict: "UAT 合并冲突",
  testing: "测试中",
  release_merging: "Release 合并中",
  release_conflict: "Release 合并冲突",
  release_check: "Release 验证中",
  release_verified: "已验证",
  accept_merging: "master 合并中",
  accept_conflict: "master 合并冲突",
  done: "已合入 master"
};

export function pipelineStatusLabel(status: string): string {
  return PIPELINE_STATUS_LABELS[status] ?? status;
}

export type BuildStage = "qa" | "uat" | "release";

export function pipelineBuildStage(status: string): BuildStage | null {
  if (status === "dev_merged" || status === "dev_built") return "qa";
  if (status === "testing") return "uat";
  if (status === "release_check") return "release";
  return null;
}

export const MERGE_STAGES = ["qa", "uat", "release", "master"] as const;
export type MergeStage = (typeof MERGE_STAGES)[number];

export const MERGE_PLAN: Record<
  MergeStage,
  {
    label: string;
    busy: string;
    conflict: string;
    success: string;
    permission: string;
    taskStatus: string;
    allowedFrom: string[];
  }
> = {
  qa: {
    label: "合并 QA",
    busy: "dev_merging",
    conflict: "dev_conflict",
    success: "dev_merged",
    permission: "merge_qa",
    taskStatus: "dev",
    allowedFrom: ["none", "dev_conflict", "dev_merged", "dev_built"]
  },
  uat: {
    label: "合并 UAT",
    busy: "test_merging",
    conflict: "test_conflict",
    success: "testing",
    permission: "merge_uat",
    taskStatus: "testing",
    allowedFrom: ["dev_passed", "test_conflict"]
  },
  release: {
    label: "合并 Release",
    busy: "release_merging",
    conflict: "release_conflict",
    success: "release_check",
    permission: "merge_release",
    taskStatus: "release",
    allowedFrom: ["testing", "release_conflict"]
  },
  master: {
    label: "合回 master",
    busy: "accept_merging",
    conflict: "accept_conflict",
    success: "done",
    permission: "merge_master",
    taskStatus: "release",
    allowedFrom: ["release_verified", "accept_conflict"]
  }
};

export const CONFLICT_FILES: Record<MergeStage, string[]> = {
  qa: ["lib/features/transfer/transfer_service.dart", "lib/features/transfer/widgets/transfer_card.dart"],
  uat: ["lib/features/transfer/widgets/transfer_card.dart"],
  release: ["lib/features/transfer/widgets/transfer_card.dart", "lib/ui/common/theme.dart"],
  master: ["CHANGELOG.md"]
};

type MergeLike = {
  stage: string;
  invalidatedAt: Date | null;
};

export function pipelineProgress(merges: MergeLike[]): number {
  const valid = new Set(
    merges.filter((merge) => !merge.invalidatedAt).map((merge) => merge.stage)
  );
  return Math.round((valid.size / MERGE_STAGES.length) * 100);
}

export function averageProgress(pipelines: { merges: MergeLike[] }[]): number {
  if (pipelines.length === 0) return 0;
  const total = pipelines.reduce((sum, pipeline) => sum + pipelineProgress(pipeline.merges), 0);
  return Math.round(total / pipelines.length);
}
