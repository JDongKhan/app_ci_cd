export const TASK_STATUS_LABELS: Record<string, string> = {
  none: "未开始",
  dev: "开发中",
  ready: "已提测",
  testing: "测试中",
  release: "待发布",
  done: "已结束"
};

export function taskStatusLabel(status: string): string {
  return TASK_STATUS_LABELS[status] ?? status;
}

type TaskLike = {
  status: string;
  dueAt: Date;
};

export type OverdueType = "dev" | "test" | null;

export function taskOverdueType(task: TaskLike, now = new Date()): OverdueType {
  if (task.status === "done") return null;
  if (task.dueAt.getTime() >= now.getTime()) return null;
  if (task.status === "none" || task.status === "dev") return "dev";
  return "test";
}

export type RequirementStatus =
  | "pending_tasks"
  | "pending"
  | "in_progress"
  | "overdue"
  | "done";

const REQUIREMENT_STATUS_LABELS: Record<RequirementStatus, string> = {
  pending_tasks: "待拆任务",
  pending: "待开始",
  in_progress: "进行中",
  overdue: "有超时",
  done: "已完成"
};

export function summarizeRequirement(tasks: TaskLike[], now = new Date()) {
  if (tasks.length === 0) {
    return {
      status: "pending_tasks" as RequirementStatus,
      statusLabel: REQUIREMENT_STATUS_LABELS.pending_tasks
    };
  }

  if (tasks.every((task) => task.status === "done")) {
    return {
      status: "done" as RequirementStatus,
      statusLabel: REQUIREMENT_STATUS_LABELS.done
    };
  }

  if (tasks.some((task) => taskOverdueType(task, now))) {
    return {
      status: "overdue" as RequirementStatus,
      statusLabel: REQUIREMENT_STATUS_LABELS.overdue
    };
  }

  const activeStatuses = ["dev", "ready", "testing", "release"];
  if (tasks.some((task) => activeStatuses.includes(task.status))) {
    return {
      status: "in_progress" as RequirementStatus,
      statusLabel: REQUIREMENT_STATUS_LABELS.in_progress
    };
  }

  return {
    status: "pending" as RequirementStatus,
    statusLabel: REQUIREMENT_STATUS_LABELS.pending
  };
}
