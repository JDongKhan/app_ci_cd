export type Role = "dev" | "qa" | "admin" | "pm";
export type EditableRole = Exclude<Role, "admin">;
export type Level = "l1" | "l2" | "l3";

export interface User {
  id: string;
  account: string;
  name: string;
  role: Role;
  level: Level | null;
  team: string | null;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  isAdmin: boolean;
  permissions: string[];
}

export interface LoginAccount {
  account: string;
  name: string;
  role: Role;
  level: Level | null;
  team: string | null;
}

export interface MeResponse {
  user: User;
  isAdmin: boolean;
  permissions: string[];
}

export interface RolePermissionItem {
  role: EditableRole;
  level: Level;
  permissions: string[];
}

export interface RolePermissionResponse {
  items: RolePermissionItem[];
}

export interface CreateStaffPayload {
  account: string;
  password: string;
  name: string;
  role: Role;
  level?: Level | null;
  team?: string | null;
}

export interface UpdateStaffPayload {
  name: string;
  role: Role;
  level?: Level | null;
  team?: string | null;
  active: boolean;
}

export type AppPlatform = "android" | "ios" | "server" | "web";
export type ArtifactType = "apk" | "ipa" | "jar" | "war";
export type BranchStage = "qa" | "uat" | "release" | "master";

export type AppBranches = Record<BranchStage, string>;

export interface AppRecord {
  id: string;
  name: string;
  platform: AppPlatform;
  code: string;
  repo: string;
  defaultBranch: string;
  buildScript: string;
  artifactType: ArtifactType;
  artifactPattern: string | null;
  branches: AppBranches;
  machine: string;
  stack: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppPayload {
  name: string;
  platform: AppPlatform;
  code: string;
  repo: string;
  defaultBranch?: string;
  buildScript?: string;
  artifactType: ArtifactType;
  artifactPattern?: string | null;
  branches?: Partial<AppBranches>;
  machine?: string;
  stack?: string | null;
}

export type RequirementPriority = "P0" | "P1" | "P2";

export interface Person {
  id: string;
  account: string;
  name: string;
  role: Role;
  level: Level | null;
}

export interface Requirement {
  id: string;
  code: string;
  title: string;
  description: string;
  devOwner: Person;
  qaOwner: Person;
  pmOwner: Person;
  qaMembers: Person[];
  priority: RequirementPriority;
  startAt: string;
  dueAt: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  status: string;
  statusLabel: string;
  tasks: TaskSummary[];
}

export type TaskStatus = "none" | "dev" | "ready" | "testing" | "release" | "done";
export type OverdueType = "dev" | "test" | null;

export interface TaskSummary {
  id: string;
  reqId: string;
  title: string;
  owner: Person;
  requirement?: { id: string; code: string; title: string };
  priority: RequirementPriority;
  status: TaskStatus;
  statusLabel: string;
  startAt: string;
  dueAt: string;
  overdueType: OverdueType;
  pipelineCount: number;
  progress: number;
}

export interface TaskCommit {
  sha: string;
  author: string;
  date: string;
  message: string;
}

export interface TaskDetail extends TaskSummary {
  description: string;
  requirement: { id: string; code: string; title: string };
  statusAt: string | null;
  statusBy: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  pipelines: Pipeline[];
}

export interface PipelineMerge {
  id: string;
  stage: string;
  fromBranch: string;
  toBranch: string;
  sha: string;
  commits: number;
  operatorId: string | null;
  mergedAt: string;
  invalidatedAt: string | null;
  invalidatedReason: string | null;
}

export interface PipelineConflict {
  id: string;
  stage: string;
  tempBranch: string;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  files: string[];
}

export interface PipelineEvent {
  id: string;
  type: string;
  fromStatus: string | null;
  toStatus: string | null;
  payload: Record<string, unknown> | null;
  actorId: string | null;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  taskId: string;
  appId: string;
  name: string;
  branch: string;
  status: string;
  statusLabel: string;
  progress: number;
  latestBuild: {
    id: string;
    stage: string;
    status: string;
    statusLabel: string;
    progress: number;
    buildNumber: number;
    versionName: string | null;
    versionCode: number | null;
    mergeSha: string | null;
    failReason: string | null;
    createdAt: string;
  } | null;
  app: {
    id: string;
    name: string;
    platform: AppPlatform;
    artifactType: ArtifactType;
    repo: string;
    branches: AppBranches;
  };
  rework: { from: string; reason: string | null; by: string | null; at: string | null } | null;
  merges: PipelineMerge[];
  conflicts: PipelineConflict[];
  events: PipelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelinePayload {
  appId: string;
  name?: string;
  branch: string;
}

export interface ArtifactInfo {
  id: string;
  displayName: string;
  originalName: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  downloadCount: number;
  createdAt: string;
}

export interface BuildRecord {
  id: string;
  pipelineId: string;
  stage: string;
  stageLabel: string;
  buildNumber: number;
  versionName: string | null;
  versionCode: number | null;
  mergeSha: string | null;
  status: string;
  statusLabel: string;
  progress: number;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  exitCode: number | null;
  failReason: string | null;
  logSizeBytes: number;
  triggeredBy: string | null;
  triggeredByName: string | null;
  createdAt: string;
  pipeline: {
    id: string;
    name: string;
    branch: string;
    app: {
      id: string;
      name: string;
      platform: AppPlatform;
      artifactType: ArtifactType;
      buildScript: string;
    };
  };
  artifacts: ArtifactInfo[];
}

export interface BuildLogChunk {
  content: string;
  nextOffset: number;
  size: number;
  status: string;
}

export interface TaskPayload {
  reqId?: string;
  title: string;
  description?: string | null;
  ownerId?: string;
  priority: RequirementPriority;
  startAt: string;
  dueAt: string;
}

export interface RequirementPayload {
  code?: string;
  title: string;
  description?: string | null;
  devOwnerId: string;
  qaOwnerId: string;
  pmOwnerId: string;
  priority: RequirementPriority;
  startAt: string;
  dueAt: string;
}

export interface RequirementOwnerOptions {
  dev: Person[];
  qa: Person[];
  pm: Person[];
}
