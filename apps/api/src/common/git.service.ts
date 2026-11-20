import { Injectable } from "@nestjs/common";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { promisify } from "node:util";
import { workspaceRoot } from "./storage";

const execFileAsync = promisify(execFile);

// 同一应用的克隆任务共享，避免合并与打包并发时重复克隆同一个 workspace。
const cloneLocks = new Map<string, Promise<void>>();

export type GitMergeOutcome =
  | { mode: "real"; conflict: false; sha: string; commits: number }
  | {
      mode: "real";
      conflict: true;
      files: string[];
      tempBranch: string;
    }
  | { mode: "error"; message: string };

@Injectable()
export class GitService {
  workspacePath(appId: string): string {
    return path.join(workspaceRoot(), appId);
  }

  async isReady(appId: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.workspacePath(appId), ".git"));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 首次操作时按需克隆仓库；同一应用的并发请求共用一次克隆。
   * 仓库只克隆到本地 workspace，不推送任何分支。
   */
  async ensureWorkspace(appId: string, repo: string, _defaultBranch: string): Promise<void> {
    if (await this.isReady(appId)) return;

    const pending = cloneLocks.get(appId);
    if (pending) return pending;

    const task = this.cloneWorkspace(appId, repo).finally(() =>
      cloneLocks.delete(appId)
    );

    cloneLocks.set(appId, task);
    return task;
  }

  async merge(
    appId: string,
    featureBranch: string,
    targetBranch: string,
    tempBranch: string,
    defaultBranch: string
  ): Promise<GitMergeOutcome> {
    if (!(await this.isReady(appId))) {
      return { mode: "error", message: "工作区未初始化，请先执行克隆" };
    }

    try {
      await this.git(appId, ["fetch", "--all", "--prune", "--quiet"]).catch(() => {});

      const featureRef = await this.resolveFeatureRef(appId, featureBranch);
      if (!featureRef) {
        return { mode: "error", message: `Feature 分支 ${featureBranch} 不存在` };
      }

      const targetRef = await this.checkoutTarget(appId, targetBranch, defaultBranch);
      if (!targetRef) {
        return { mode: "error", message: `目标分支 ${targetBranch} 不存在` };
      }

      const count = await this.git(appId, [
        "rev-list",
        "--count",
        `HEAD..${featureRef}`
      ]);
      const commits = Number(count.stdout.trim()) || 0;

      try {
        await this.git(appId, [
          "merge",
          "--no-ff",
          featureRef,
          "-m",
          `Merge branch '${featureBranch}' into ${targetBranch}`
        ]);
      } catch {
        const conflicts = await this.git(appId, [
          "diff",
          "--name-only",
          "--diff-filter=U"
        ]).catch(() => ({ stdout: "" }));
        const files = conflicts.stdout.split("\n").map((line) => line.trim()).filter(Boolean);

        await this.git(appId, ["merge", "--abort"]).catch(() => {});

        if (files.length === 0) {
          return { mode: "error", message: "Git 合并失败，未识别到冲突文件" };
        }

        await this.git(appId, ["branch", "-f", tempBranch, featureRef]);

        // 一期只做本地合并，临时分支与目标分支都不推送到远端；
        // 等正式发布流程确认后再统一推送。
        return { mode: "real", conflict: true, files, tempBranch };
      }

      const head = await this.git(appId, ["rev-parse", "HEAD"]);
      return {
        mode: "real",
        conflict: false,
        sha: head.stdout.trim(),
        commits
      };
    } catch (error) {
      return {
        mode: "error",
        message: error instanceof Error ? error.message : "Git 执行失败"
      };
    }
  }

  async mergeTemp(
    appId: string,
    tempBranch: string,
    targetBranch: string,
    defaultBranch: string
  ): Promise<GitMergeOutcome> {
    if (!(await this.isReady(appId))) {
      return { mode: "error", message: "工作区未初始化，请先执行克隆" };
    }

    try {
      const targetRef = await this.checkoutTarget(appId, targetBranch, defaultBranch);
      if (!targetRef) {
        return { mode: "error", message: `目标分支 ${targetBranch} 不存在` };
      }

      await this.git(appId, [
        "merge",
        "--no-ff",
        tempBranch,
        "-m",
        `Merge ${tempBranch} into ${targetBranch}`
      ]);

      const head = await this.git(appId, ["rev-parse", "HEAD"]);
      const count = await this.git(appId, [
        "rev-list",
        "--count",
        `HEAD..${tempBranch}`
      ]).catch(() => ({ stdout: "0" }));

      return {
        mode: "real",
        conflict: false,
        sha: head.stdout.trim(),
        commits: Number(count.stdout.trim()) || 0
      };
    } catch (error) {
      return {
        mode: "error",
        message: error instanceof Error ? error.message : "Git 合并失败"
      };
    }
  }

  private async cloneWorkspace(appId: string, repo: string) {
    if (!repo.trim()) {
      throw new Error("应用未配置 Git 仓库地址");
    }

    const target = this.workspacePath(appId);
    const root = workspaceRoot();

    await fs.mkdir(root, { recursive: true });
    // workspace 由平台管理；清理上次失败克隆留下的残留目录。
    await fs.rm(target, { recursive: true, force: true });

    try {
      await execFileAsync("git", ["clone", "--no-single-branch", repo, target], {
        maxBuffer: 8 * 1024 * 1024,
        timeout: 10 * 60 * 1000,
        env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
      });
    } catch (error) {
      await fs.rm(target, { recursive: true, force: true }).catch(() => {});

      const detail =
        error && typeof error === "object" && "stderr" in error
          ? String((error as { stderr?: unknown }).stderr || "")
          : "";

      throw new Error(
        `克隆仓库失败：${detail.trim() || (error instanceof Error ? error.message : "未知错误")}`
      );
    }

    if (!(await this.isReady(appId))) {
      throw new Error("克隆完成但未找到 .git 目录");
    }
  }

  private async resolveFeatureRef(appId: string, branch: string): Promise<string | null> {
    const candidates = [`origin/${branch}`, branch];

    for (const candidate of candidates) {
      if (await this.refExists(appId, candidate)) return candidate;
    }

    return null;
  }

  private async checkoutTarget(
    appId: string,
    branch: string,
    defaultBranch: string
  ): Promise<string | null> {
    // 目标分支优先使用本地分支：一期不推送，连续合并要累积在本地分支上。
    if (await this.refExists(appId, branch)) {
      await this.git(appId, ["checkout", "-f", branch]);
      return branch;
    }

    if (await this.refExists(appId, `origin/${branch}`)) {
      await this.git(appId, ["checkout", "-f", "-B", branch, `origin/${branch}`]);
      return branch;
    }

    const base = await this.firstExistingRef(appId, [
      `origin/${defaultBranch}`,
      defaultBranch,
      "origin/HEAD"
    ]);

    if (!base) return null;

    // 远端没有 qa / uat / release 时，从默认分支在本地创建同名分支，不推送。
    await this.git(appId, ["checkout", "-f", "-B", branch, base]);
    return branch;
  }

  private async firstExistingRef(appId: string, refs: string[]): Promise<string | null> {
    for (const ref of refs) {
      if (await this.refExists(appId, ref)) return ref;
    }
    return null;
  }

  private async refExists(appId: string, ref: string): Promise<boolean> {
    try {
      const result = await this.git(appId, [
        "rev-parse",
        "--verify",
        "--quiet",
        `${ref}^{commit}`
      ]);
      return Boolean(result.stdout.trim());
    } catch {
      return false;
    }
  }

  private git(appId: string, args: string[]) {
    return execFileAsync("git", ["-C", this.workspacePath(appId), ...args], {
      maxBuffer: 4 * 1024 * 1024
    });
  }
}
