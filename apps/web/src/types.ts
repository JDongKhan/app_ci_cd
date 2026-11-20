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
