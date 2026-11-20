import type { RequirementPriority, TaskStatus } from "@/types";

export const TASK_STATUS_META: Record<TaskStatus, { label: string; cls: string }> = {
  none: { label: "未开始", cls: "ts-none" },
  dev: { label: "开发中", cls: "ts-dev" },
  ready: { label: "已提测", cls: "ts-ready" },
  testing: { label: "测试中", cls: "ts-testing" },
  release: { label: "待发布", cls: "ts-release" },
  done: { label: "已结束", cls: "ts-done" }
};

export const REQUIREMENT_STATUS_CLASS: Record<string, string> = {
  pending_tasks: "st-soft",
  pending: "st-none",
  in_progress: "st-dev",
  overdue: "st-overdue",
  done: "st-done"
};

export const PRIORITY_META: Record<RequirementPriority, { label: string; cls: string }> = {
  P0: { label: "P0 · 最高", cls: "pri-p0" },
  P1: { label: "P1 · 高", cls: "pri-p1" },
  P2: { label: "P2 · 普通", cls: "pri-p2" }
};
