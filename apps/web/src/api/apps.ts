import { http } from "./http";
import type { AppPayload, AppRecord } from "@/types";

export async function listApps(): Promise<AppRecord[]> {
  const { data } = await http.get<AppRecord[]>("/apps");
  return data;
}

export async function createApp(payload: AppPayload): Promise<AppRecord> {
  const { data } = await http.post<AppRecord>("/apps", payload);
  return data;
}

export async function updateApp(id: string, payload: AppPayload): Promise<AppRecord> {
  const { data } = await http.put<AppRecord>(`/apps/${id}`, payload);
  return data;
}
