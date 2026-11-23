import { existsSync, promises as fs } from "node:fs";
import * as path from "node:path";
import { PrismaClient } from "@prisma/client";
import { projectRoot } from "../common/storage";

const APP_ENVS = ["qa", "pre", "prd"] as const;
type AppEnv = (typeof APP_ENVS)[number];

/**
 * DATABASE_URL 是 sqlite 的 file: 路径。
 * 相对路径与 Prisma 保持一致，按 schema 所在目录（prisma/）解析。
 */
function resolveSqliteFile(url: string | undefined): string | null {
  if (!url || !url.startsWith("file:")) return null;
  const raw = url.slice("file:".length);
  if (!raw || raw.startsWith(":")) return null;
  if (path.isAbsolute(raw)) return raw;
  return path.resolve(path.join(projectRoot(), "prisma"), raw);
}

function findInitDir(): string | null {
  const candidates = [
    path.join(__dirname, "prisma", "init"),
    path.join(projectRoot(), "prisma", "init")
  ];
  return candidates.find((dir) => existsSync(path.join(dir, "schema.db"))) ?? null;
}

/** 按分号拆分 SQL，跳过注释，并正确处理字符串中的分号与转义引号。 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inString = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (!inString && char === "-" && next === "-") {
      while (i < sql.length && sql[i] !== "\n") i += 1;
      current += "\n";
      continue;
    }

    if (char === "'") {
      if (inString && next === "'") {
        current += "''";
        i += 1;
        continue;
      }
      inString = !inString;
      current += char;
      continue;
    }

    if (char === ";" && !inString) {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

/**
 * 首次启动时按环境初始化数据库：复制结构模板，再执行该环境的初始化 SQL。
 * 已存在的数据库不会被重复初始化；初始化失败时不会留下半成品文件。
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  const dbFile = resolveSqliteFile(process.env.DATABASE_URL);
  if (!dbFile || existsSync(dbFile)) return;

  const rawEnv = (process.env.SHIPFLOW_ENV || "qa").trim().toLowerCase();
  if (!(APP_ENVS as readonly string[]).includes(rawEnv)) {
    throw new Error(`SHIPFLOW_ENV 不支持：${rawEnv}（可选 qa / pre / prd）`);
  }
  const env = rawEnv as AppEnv;

  const initDir = findInitDir();
  if (!initDir) {
    throw new Error("缺少数据库结构模板 prisma/init/schema.db，请先执行 pnpm db:schema");
  }

  const seedFile = path.join(initDir, `${env}.sql`);
  if (!existsSync(seedFile)) {
    throw new Error(`缺少 ${env} 环境的初始化 SQL：${seedFile}`);
  }

  await fs.mkdir(path.dirname(dbFile), { recursive: true });

  const tempFile = `${dbFile}.init`;
  await fs.rm(tempFile, { force: true });
  await fs.copyFile(path.join(initDir, "schema.db"), tempFile);

  const statements = splitSqlStatements(await fs.readFile(seedFile, "utf8"));
  const previousUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = `file:${tempFile}`;

  try {
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      for (const statement of statements) {
        await prisma.$executeRawUnsafe(statement);
      }
    } finally {
      await prisma.$disconnect();
    }

    await fs.rename(tempFile, dbFile);
    console.log(`[database] 已初始化 ${env} 环境数据库（${statements.length} 条语句）：${dbFile}`);
  } catch (error) {
    await fs.rm(tempFile, { force: true });
    throw error;
  } finally {
    process.env.DATABASE_URL = previousUrl;
  }
}
