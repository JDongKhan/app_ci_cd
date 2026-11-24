import { http } from "./http";
import type { AppComponentRecord, ComponentVersionResponse } from "@/types";

export async function listAppComponents(
  appId: string
): Promise<AppComponentRecord[]> {
  const { data } = await http.get<AppComponentRecord[]>(`/apps/${appId}/components`);
  return data;
}

export async function addAppComponents(
  appId: string,
  componentAppIds: string[]
): Promise<AppComponentRecord[]> {
  const { data } = await http.post<AppComponentRecord[]>(
    `/apps/${appId}/components`,
    { componentAppIds }
  );
  return data;
}

export async function removeAppComponent(
  appId: string,
  componentAppId: string
): Promise<AppComponentRecord[]> {
  const { data } = await http.delete<AppComponentRecord[]>(
    `/apps/${appId}/components/${componentAppId}`
  );
  return data;
}

export async function fetchComponentVersions(
  appCode: string
): Promise<ComponentVersionResponse> {
  const { data } = await http.get<ComponentVersionResponse>("/components", {
    params: { appCode }
  });
  return data;
}
