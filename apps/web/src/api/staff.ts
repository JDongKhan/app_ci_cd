import { http } from "./http";
import type {
  CreateStaffPayload,
  UpdateStaffPayload,
  User
} from "@/types";

export interface StaffQuery {
  keyword?: string;
  role?: string;
  active?: string;
}

export async function listStaff(query: StaffQuery = {}): Promise<User[]> {
  const { data } = await http.get<User[]>("/staff", { params: query });
  return data;
}

export async function createStaff(payload: CreateStaffPayload): Promise<User> {
  const { data } = await http.post<User>("/staff", payload);
  return data;
}

export async function updateStaff(id: string, payload: UpdateStaffPayload): Promise<User> {
  const { data } = await http.put<User>(`/staff/${id}`, payload);
  return data;
}

export async function updateStaffStatus(id: string, active: boolean): Promise<User> {
  const { data } = await http.put<User>(`/staff/${id}/status`, { active });
  return data;
}

export async function resetStaffPassword(id: string, password: string): Promise<{ ok: boolean }> {
  const { data } = await http.put<{ ok: boolean }>(`/staff/${id}/password`, { password });
  return data;
}
