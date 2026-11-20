export const PIPELINE_STATUS_CLASS: Record<string, string> = {
  none: "ps-none",
  dev_merging: "ps-busy",
  dev_merged: "ps-merged",
  dev_built: "ps-built",
  dev_passed: "ps-passed",
  test_merging: "ps-busy",
  testing: "ps-testing",
  release_merging: "ps-busy",
  release_check: "ps-check",
  release_verified: "ps-verified",
  accept_merging: "ps-busy",
  done: "ps-done"
};

export const CONFLICT_STATUS_CLASS = "ps-conflict";

export const PIPELINE_STAGES = [
  { key: "qa", label: "QA" },
  { key: "uat", label: "UAT" },
  { key: "release", label: "Release" },
  { key: "master", label: "master" }
] as const;

export function isConflictStatus(status: string): boolean {
  return status.endsWith("_conflict");
}

export function pipelineStatusClass(status: string): string {
  if (isConflictStatus(status)) return CONFLICT_STATUS_CLASS;
  return PIPELINE_STATUS_CLASS[status] ?? "ps-none";
}
