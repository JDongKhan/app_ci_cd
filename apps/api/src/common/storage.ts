import { existsSync } from "node:fs";
import * as path from "node:path";

export function projectRoot(): string {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

// 部署环境（如云函数）的应用目录只读，需要通过环境变量把可写目录指向临时目录。
function envRoot(name: string): string | null {
  const value = process.env[name];
  return value && value.trim() ? path.resolve(value) : null;
}

export function storageRoot(): string {
  return envRoot("STORAGE_ROOT") ?? path.join(projectRoot(), "storage");
}

export function artifactsRoot(): string {
  return path.join(storageRoot(), "artifacts");
}

export function workspaceRoot(): string {
  return envRoot("WORKSPACE_ROOT") ?? path.join(projectRoot(), "workspace");
}
