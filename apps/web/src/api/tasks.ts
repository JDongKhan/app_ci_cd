import { http } from "./http";
import type { TaskCommit, TaskDetail, TaskPayload, TaskSummary } from "@/types";

export async function getTask(id: string): Promise<TaskDetail> {
  const { data } = await http.get<TaskDetail>(`/tasks/${id}`);
  return data;
}

export async function createTask(payload: TaskPayload): Promise<TaskDetail> {
  const { data } = await http.post<TaskDetail>("/tasks", payload);
  return data;
}

export async function updateTask(id: string, payload: TaskPayload): Promise<TaskDetail> {
  const { data } = await http.put<TaskDetail>(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: string): Promise<{ ok: boolean }> {
  const { data } = await http.delete<{ ok: boolean }>(`/tasks/${id}`);
  return data;
}

export async function listMyTasks(): Promise<TaskSummary[]> {
  const { data } = await http.get<TaskSummary[]>("/my-tasks");
  return data;
}

export async function listBoard(): Promise<TaskSummary[]> {
  const { data } = await http.get<TaskSummary[]>("/board");
  return data;
}

export async function listTaskCommits(id: string, limit = 20): Promise<TaskCommit[]> {
  const { data } = await http.get<TaskCommit[]>(`/tasks/${id}/commits`, {
    params: { limit }
  });
  return data;
}
