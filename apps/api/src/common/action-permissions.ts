import { Role } from "./constants";

/**
 * 动作权限按角色判断；菜单仍按「角色 × 级别」矩阵。
 * 见设计文档 6.1：级别只决定菜单可见范围，具体可执行动作由角色决定。
 */
export const ACTION_ROLES: Record<string, readonly Role[]> = {
  req_create: ["pm"],
  task_create: ["dev"],
  req_member: ["qa"],
  pipe_create: ["dev"],
  merge_qa: ["dev"],
  build_run: ["dev", "qa"],
  merge_uat: ["qa"],
  test_run: ["qa"],
  merge_release: ["qa"],
  verify: ["qa"],
  merge_master: ["qa"],
  accept: ["qa"],
  artifact_download: ["dev", "qa", "pm"],
  task_delete: ["admin"],
  app_edit: ["admin"],
  component_edit: ["admin", "dev"]
};

export function isActionPermission(key: string): boolean {
  return key in ACTION_ROLES;
}

export function actionPermissionsFor(role: string): string[] {
  return Object.entries(ACTION_ROLES)
    .filter(([, roles]) => (roles as readonly string[]).includes(role))
    .map(([key]) => key);
}
