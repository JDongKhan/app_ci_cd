import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthUser } from "../common/auth-user.interface";
import { LogsService } from "./logs.service";

type AuditedMethod = "POST" | "PUT" | "PATCH" | "DELETE";

interface AuditRule {
  method: AuditedMethod;
  pattern: RegExp;
  action: "create" | "update" | "delete";
  module: string;
  label: string;
}

const AUDIT_RULES: AuditRule[] = [
  { method: "POST", pattern: /^\/apps$/, action: "create", module: "应用配置", label: "新增应用" },
  { method: "PUT", pattern: /^\/apps\/[^/]+$/, action: "update", module: "应用配置", label: "更新应用" },
  { method: "POST", pattern: /^\/apps\/[^/]+\/components$/, action: "create", module: "组件管理", label: "添加组件" },
  { method: "DELETE", pattern: /^\/apps\/[^/]+\/components\/[^/]+$/, action: "delete", module: "组件管理", label: "移除组件" },
  { method: "POST", pattern: /^\/components\/version$/, action: "update", module: "组件管理", label: "更新组件版本" },
  { method: "POST", pattern: /^\/requirements$/, action: "create", module: "需求管理", label: "新增需求" },
  { method: "PUT", pattern: /^\/requirements\/[^/]+$/, action: "update", module: "需求管理", label: "更新需求" },
  { method: "PUT", pattern: /^\/requirements\/[^/]+\/qa-members$/, action: "update", module: "需求管理", label: "维护需求测试人员" },
  { method: "POST", pattern: /^\/tasks$/, action: "create", module: "任务管理", label: "新增任务" },
  { method: "PUT", pattern: /^\/tasks\/[^/]+$/, action: "update", module: "任务管理", label: "更新任务" },
  { method: "DELETE", pattern: /^\/tasks\/[^/]+$/, action: "delete", module: "任务管理", label: "删除任务" },
  { method: "POST", pattern: /^\/tasks\/[^/]+\/status$/, action: "update", module: "任务管理", label: "推进任务状态" },
  { method: "POST", pattern: /^\/tasks\/[^/]+\/pipelines$/, action: "create", module: "CI 流水", label: "新建 CI 流水" },
  { method: "POST", pattern: /^\/pipelines\/[^/]+\/merge$/, action: "update", module: "CI 流水", label: "合并分支" },
  { method: "POST", pattern: /^\/pipelines\/[^/]+\/resolve$/, action: "update", module: "CI 流水", label: "解决冲突" },
  { method: "POST", pattern: /^\/pipelines\/[^/]+\/qa-verdict$/, action: "update", module: "CI 流水", label: "提交自测结论" },
  { method: "POST", pattern: /^\/pipelines\/[^/]+\/test-reject$/, action: "update", module: "CI 流水", label: "测试拒绝" },
  { method: "POST", pattern: /^\/pipelines\/[^/]+\/verify$/, action: "update", module: "CI 流水", label: "发布验证" },
  { method: "POST", pattern: /^\/pipelines\/[^/]+\/build$/, action: "create", module: "构建打包", label: "触发打包" },
  { method: "POST", pattern: /^\/staff$/, action: "create", module: "人员管理", label: "新增人员" },
  { method: "PUT", pattern: /^\/staff\/[^/]+\/status$/, action: "update", module: "人员管理", label: "更新人员状态" },
  { method: "PUT", pattern: /^\/staff\/[^/]+\/password$/, action: "update", module: "人员管理", label: "重置密码" },
  { method: "PUT", pattern: /^\/staff\/[^/]+$/, action: "update", module: "人员管理", label: "更新人员" },
  { method: "PUT", pattern: /^\/roles\/perms$/, action: "update", module: "角色权限", label: "更新角色权限" },
  { method: "POST", pattern: /^\/roles\/perms\/reset$/, action: "update", module: "角色权限", label: "重置角色权限" }
];

const SUBJECT_KEYS = [
  "componentName",
  "appName",
  "versionName",
  "name",
  "title",
  "account",
  "version",
  "code"
];

const NESTED_KEYS = ["pipeline", "app", "component", "task", "requirement", "user"];

function pickSubject(source: unknown, depth = 0): string | null {
  if (!source || typeof source !== "object" || depth > 2) return null;
  const record = source as Record<string, unknown>;

  for (const key of SUBJECT_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  for (const key of NESTED_KEYS) {
    const nested = pickSubject(record[key], depth + 1);
    if (nested) return nested;
  }

  return null;
}

function buildSummary(label: string, result: unknown, body: unknown): string {
  const subject = pickSubject(result) ?? pickSubject(body);
  return subject ? `${label}「${subject}」` : label;
}

function normalizedPath(request: {
  originalUrl?: string;
  url?: string;
}): string {
  const raw = request.originalUrl || request.url || "/";
  return raw.split("?")[0].replace(/^\/api(?=\/|$)/, "") || "/";
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<{ method: string; body?: unknown; user?: AuthUser; originalUrl?: string; url?: string }>();
    const method = request.method.toUpperCase();

    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      return next.handle();
    }

    const path = normalizedPath(request);
    const rule = AUDIT_RULES.find(
      (item) => item.method === method && item.pattern.test(path)
    );

    if (!rule) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((result) => {
        const response = context.switchToHttp().getResponse<{ statusCode?: number }>();
        void this.logsService.record({
          actor: request.user ?? null,
          action: rule.action,
          module: rule.module,
          summary: buildSummary(rule.label, result, request.body),
          method,
          path,
          statusCode: response.statusCode ?? 200,
          payload: request.body
        });
      })
    );
  }
}
