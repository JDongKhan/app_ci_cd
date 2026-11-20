import { http } from "./http";
import type { BuildLogChunk, BuildRecord, Pipeline } from "@/types";

export async function triggerBuild(pipelineId: string): Promise<BuildRecord> {
  const { data } = await http.post<BuildRecord>(`/pipelines/${pipelineId}/build`);
  return data;
}

export async function listTaskBuilds(taskId: string): Promise<BuildRecord[]> {
  const { data } = await http.get<BuildRecord[]>(`/tasks/${taskId}/builds`);
  return data;
}

export async function fetchBuildLog(
  buildId: string,
  offset = 0
): Promise<BuildLogChunk> {
  const { data } = await http.get<BuildLogChunk>(`/builds/${buildId}/log`, {
    params: { offset }
  });
  return data;
}

export async function qaVerdict(
  pipelineId: string,
  pass: boolean,
  reason?: string
): Promise<Pipeline> {
  const { data } = await http.post<Pipeline>(`/pipelines/${pipelineId}/qa-verdict`, {
    pass,
    reason
  });
  return data;
}
