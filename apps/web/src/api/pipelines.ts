import { http } from "./http";
import type { Pipeline, PipelinePayload, TaskDetail } from "@/types";

export async function createPipeline(
  taskId: string,
  payload: PipelinePayload
): Promise<Pipeline> {
  const { data } = await http.post<Pipeline>(`/tasks/${taskId}/pipelines`, payload);
  return data;
}

export async function mergePipeline(
  id: string,
  stage: "qa" | "uat" | "release" | "master"
): Promise<Pipeline> {
  const { data } = await http.post<Pipeline>(`/pipelines/${id}/merge`, { stage });
  return data;
}

export async function resolvePipeline(id: string): Promise<Pipeline> {
  const { data } = await http.post<Pipeline>(`/pipelines/${id}/resolve`);
  return data;
}

export async function testReject(id: string, reason?: string): Promise<Pipeline> {
  const { data } = await http.post<Pipeline>(`/pipelines/${id}/test-reject`, { reason });
  return data;
}

export async function verifyPipeline(
  id: string,
  pass: boolean,
  reason?: string
): Promise<Pipeline> {
  const { data } = await http.post<Pipeline>(`/pipelines/${id}/verify`, { pass, reason });
  return data;
}

export async function advanceTaskStatus(
  taskId: string,
  status: string
): Promise<TaskDetail> {
  const { data } = await http.post<TaskDetail>(`/tasks/${taskId}/status`, { status });
  return data;
}
