import { http } from "./http";
import type { BuildRecord } from "@/types";

export async function listArtifacts(status?: string): Promise<BuildRecord[]> {
  const { data } = await http.get<BuildRecord[]>("/artifacts", {
    params: status ? { status } : undefined
  });
  return data;
}

export function artifactDownloadUrl(id: string): string {
  return `/api/artifacts/${id}/download`;
}
