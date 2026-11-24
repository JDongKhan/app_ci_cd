import type { EditableRole, Level, Role } from "@/types";

export interface PermissionItem {
  key: string;
  label: string;
  menu?: boolean;
  hash?: string;
  adminOnly?: boolean;
}

export interface PermissionGroup {
  key: string;
  label: string;
  description: string;
  permissions: PermissionItem[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "workbench",
    label: "工作台",
    description: "首页与看板",
    permissions: [
      { key: "home", label: "首页 · 我的任务", menu: true, hash: "/" },
      { key: "board", label: "任务看板", menu: true, hash: "/board" }
    ]
  },
  {
    key: "delivery",
    label: "需求与任务",
    description: "需求、任务的创建与维护",
    permissions: [
      { key: "reqs", label: "需求管理", menu: true, hash: "/reqs" },
      { key: "req_create", label: "新建需求" },
      { key: "task_create", label: "新建任务" },
      { key: "req_member", label: "维护需求测试人员" },
      { key: "task_delete", label: "删除任务" }
    ]
  },
  {
    key: "build",
    label: "应用与产物",
    description: "应用配置与打包产物",
    permissions: [
      { key: "apps", label: "应用配置", menu: true, hash: "/apps" },
      { key: "app_edit", label: "新建 / 编辑应用" },
      { key: "components", label: "组件管理", menu: true, hash: "/components" },
      { key: "component_edit", label: "新增 / 移除组件" },
      { key: "artifacts", label: "打包产物", menu: true, hash: "/artifacts" },
      { key: "artifact_download", label: "下载产物" }
    ]
  },
  {
    key: "pipeline",
    label: "CI 流水操作",
    description: "建流水、合并、打包、验证、归档",
    permissions: [
      { key: "pipe_create", label: "新建 CI 流水" },
      { key: "merge_qa", label: "合并 QA" },
      { key: "build_run", label: "打包" },
      { key: "merge_uat", label: "合并 UAT" },
      { key: "test_run", label: "开始测试" },
      { key: "merge_release", label: "合并 Release" },
      { key: "verify", label: "发布验证" },
      { key: "merge_master", label: "合回 master" },
      { key: "accept", label: "验收归档" }
    ]
  },
  {
    key: "system",
    label: "系统管理",
    description: "角色、人员与说明",
    permissions: [
      { key: "roles", label: "角色权限", menu: true, hash: "/roles", adminOnly: true },
      { key: "staff", label: "人员管理", menu: true, hash: "/staff", adminOnly: true },
      { key: "spec", label: "需求说明", menu: true, hash: "/spec" }
    ]
  }
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => group.permissions);

export const ROLE_META: Record<Role, { label: string; description: string }> = {
  dev: { label: "开发", description: "开始开发、提测、合并 QA、打包与自测" },
  qa: { label: "测试", description: "开始测试、进入待发布、合并 UAT / Release / master" },
  pm: { label: "产品", description: "提需求、维护需求、查看进度" },
  admin: { label: "管理员", description: "全部菜单与动作，维护应用、权限与人员" }
};

export const LEVEL_META: Record<Level, string> = {
  l1: "L1 初级",
  l2: "L2 中级",
  l3: "L3 高级"
};

export const ROLE_LEVELS: Record<EditableRole, Level[]> = {
  dev: ["l1", "l2", "l3"],
  qa: ["l1", "l2", "l3"],
  pm: ["l1", "l2", "l3"]
};

export const EDITABLE_ROLES = Object.keys(ROLE_LEVELS) as EditableRole[];

export const ROLE_OPTIONS = EDITABLE_ROLES.map((role) => ({
  value: role,
  label: ROLE_META[role].label
}));

export const LEVEL_OPTIONS = (Object.keys(LEVEL_META) as Level[]).map((level) => ({
  value: level,
  label: LEVEL_META[level]
}));

export interface MenuItem {
  key: string;
  label: string;
  route: string;
  description: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { key: "home", label: "首页 · 我的任务", route: "/", description: "我的任务与快捷入口" },
  { key: "board", label: "任务看板", route: "/board", description: "按任务状态查看交付进展" },
  { key: "reqs", label: "需求管理", route: "/reqs", description: "需求、负责人和任务拆分" },
  { key: "apps", label: "应用配置", route: "/apps", description: "仓库、分支、构建脚本与产物配置" },
  { key: "components", label: "组件管理", route: "/components", description: "应用依赖的组件与版本" },
  { key: "artifacts", label: "打包产物", route: "/artifacts", description: "已入库、打包中与失败的构建" },
  { key: "roles", label: "角色权限", route: "/roles", description: "角色与级别的菜单权限矩阵" },
  { key: "staff", label: "人员管理", route: "/staff", description: "账号、角色、级别与启停" },
  { key: "spec", label: "需求说明", route: "/spec", description: "一期范围、状态机与已确认规则" }
];

export function roleLevelKey(role: string, level: string): string {
  return `${role}/${level}`;
}
