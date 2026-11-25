import { http } from "./http";
import type { BuildRecord, Person } from "@/types";

export interface ArtifactQuery {
  status?: string;
  appId?: string;
  triggeredBy?: string;
  start?: string;
  end?: string;
}

export async function listArtifacts(query: ArtifactQuery = {}): Promise<BuildRecord[]> {
  const { data } = await http.get<BuildRecord[]>("/artifacts", { params: query });
  return data;
}

export async function listArtifactTriggerers(): Promise<Pick<Person, "id" | "name">[]> {
  const { data } = await http.get<Pick<Person, "id" | "name">[]>("/artifacts/triggerers");
  return data;
}

export function artifactDownloadUrl(id: string): string {
  return `${__API_BASE_URL__}/artifacts/${id}/download`;
}
