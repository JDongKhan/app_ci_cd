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

export function storageRoot(): string {
  return path.join(projectRoot(), "storage");
}

export function artifactsRoot(): string {
  return path.join(storageRoot(), "artifacts");
}

export function workspaceRoot(): string {
  return path.join(projectRoot(), "workspace");
}
