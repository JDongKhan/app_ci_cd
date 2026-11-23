import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// 本地开发走 vite 代理（/api -> http://localhost:3000），生产构建使用已部署的 API 地址
const DEV_API_BASE_URL = "/api";
const PROD_API_BASE_URL = "https://37lbaz49mo6rmuv2jmv.traesite.cn/api";

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  define: {
    __API_BASE_URL__: JSON.stringify(command === "build" ? PROD_API_BASE_URL : DEV_API_BASE_URL)
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
}));
