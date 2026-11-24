import { http } from "./http";
import type { AuditLogPage } from "@/types";

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  action?: string;
  module?: string;
  keyword?: string;
}

export async function listLogs(query: AuditLogQuery = {}): Promise<AuditLogPage> {
  const { data } = await http.get<AuditLogPage>("/logs", { params: query });
  return data;
}

export async function listLogModules(): Promise<string[]> {
  const { data } = await http.get<string[]>("/logs/modules");
  return data;
}
