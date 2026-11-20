import { http } from "./http";
import type { LoginAccount, LoginResponse, MeResponse } from "@/types";

export async function fetchLoginAccounts(): Promise<LoginAccount[]> {
  const { data } = await http.get<LoginAccount[]>("/auth/accounts");
  return data;
}

export async function login(account: string, password: string): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/auth/login", { account, password });
  return data;
}

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await http.get<MeResponse>("/auth/me");
  return data;
}
