import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthUser } from "../common/auth-user.interface";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "authorization"
]);

const MAX_PAYLOAD_LENGTH = 2000;

export interface AuditRecordInput {
  actor: AuthUser | null;
  action: string;
  module: string;
  summary: string;
  method: string;
  path: string;
  statusCode: number;
  payload?: unknown;
}

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  action?: string;
  module?: string;
  keyword?: string;
}

function sanitize(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth > 4) return "[省略]";
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitize(item, depth + 1));
  }
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        result[key] = "***";
        continue;
      }
      result[key] = sanitize(item, depth + 1);
    }
    return result;
  }
  return value;
}

function serializePayload(payload: unknown): string | null {
  if (payload === undefined || payload === null) return null;
  if (typeof payload === "object" && Object.keys(payload as object).length === 0) {
    return null;
  }

  try {
    const text = JSON.stringify(sanitize(payload));
    if (!text) return null;
    return text.length > MAX_PAYLOAD_LENGTH
      ? `${text.slice(0, MAX_PAYLOAD_LENGTH)}…`
      : text;
  } catch {
    return null;
  }
}

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditRecordInput) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: input.actor?.id ?? null,
          actorName: input.actor?.name ?? "未登录调用",
          actorAccount: input.actor?.account ?? null,
          actorRole: input.actor?.role ?? null,
          action: input.action,
          module: input.module,
          summary: input.summary,
          method: input.method,
          path: input.path,
          statusCode: input.statusCode,
          payload: serializePayload(input.payload)
        }
      });
    } catch (error) {
      // 操作日志写入失败不应影响主流程
      console.error("[audit] 写入操作日志失败", error);
    }
  }

  async list(query: AuditLogQuery) {
    const page = Math.max(1, Math.trunc(query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Math.trunc(query.pageSize ?? 20)));
    const keyword = query.keyword?.trim();

    const where = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.module ? { module: query.module } : {}),
      ...(keyword
        ? {
            OR: [
              { summary: { contains: keyword } },
              { actorName: { contains: keyword } },
              { actorAccount: { contains: keyword } },
              { module: { contains: keyword } }
            ]
          }
        : {})
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return { items, total, page, pageSize };
  }

  async modules(): Promise<string[]> {
    const rows = await this.prisma.auditLog.findMany({
      select: { module: true },
      distinct: ["module"],
      orderBy: { module: "asc" }
    });
    return rows.map((row) => row.module);
  }
}
