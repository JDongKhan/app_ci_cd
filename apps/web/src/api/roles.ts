import { http } from "./http";
import type { RolePermissionItem, RolePermissionResponse } from "@/types";

export async function fetchRolePermissions(): Promise<RolePermissionResponse> {
  const { data } = await http.get<RolePermissionResponse>("/roles/perms");
  return data;
}

export async function saveRolePermissions(items: RolePermissionItem[]): Promise<RolePermissionResponse> {
  const { data } = await http.put<RolePermissionResponse>("/roles/perms", { items });
  return data;
}

export async function resetRolePermissions(): Promise<RolePermissionResponse> {
  const { data } = await http.post<RolePermissionResponse>("/roles/perms/reset");
  return data;
}
