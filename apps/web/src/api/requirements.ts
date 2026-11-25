import { http } from "./http";
import type {
  Requirement,
  RequirementOwnerOptions,
  RequirementPayload
} from "@/types";

export interface RequirementQuery {
  keyword?: string;
  priority?: string;
  devOwnerId?: string;
  ownerId?: string;
  dueStart?: string;
  dueEnd?: string;
  status?: string;
}

export async function listRequirements(query: RequirementQuery = {}): Promise<Requirement[]> {
  const { data } = await http.get<Requirement[]>("/requirements", { params: query });
  return data;
}

export async function getRequirement(id: string): Promise<Requirement> {
  const { data } = await http.get<Requirement>(`/requirements/${id}`);
  return data;
}

export async function getOwnerOptions(): Promise<RequirementOwnerOptions> {
  const { data } = await http.get<RequirementOwnerOptions>("/requirements/owner-options");
  return data;
}

export async function createRequirement(payload: RequirementPayload): Promise<Requirement> {
  const { data } = await http.post<Requirement>("/requirements", payload);
  return data;
}

export async function updateRequirement(
  id: string,
  payload: RequirementPayload
): Promise<Requirement> {
  const { data } = await http.put<Requirement>(`/requirements/${id}`, payload);
  return data;
}

export async function updateQaMembers(id: string, userIds: string[]): Promise<Requirement> {
  const { data } = await http.put<Requirement>(`/requirements/${id}/qa-members`, { userIds });
  return data;
}

export async function listMyRequirements(): Promise<Requirement[]> {
  const { data } = await http.get<Requirement[]>("/my-requirements");
  return data;
}
