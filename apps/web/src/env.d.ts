/// <reference types="vite/client" />

// 由 vite.config.ts 的 define 注入：开发环境为 /api，生产构建为部署后的 API 地址
declare const __API_BASE_URL__: string;

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
