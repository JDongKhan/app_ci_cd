import axios from "axios";

export const http = axios.create({
  baseURL: __API_BASE_URL__,
  timeout: 20000
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("shipflow_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("shipflow_token");
      // hash 路由下用 hash 跳转，避免请求 /login 触发静态托管的 404
      if (window.location.hash !== "#/login") {
        window.location.hash = "#/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown, fallback = "操作失败，请稍后重试"): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join("；");
    if (typeof message === "string") return message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
