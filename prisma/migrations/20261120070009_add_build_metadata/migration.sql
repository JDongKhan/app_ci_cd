-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_builds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipeline_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "build_number" INTEGER NOT NULL DEFAULT 0,
    "version_name" TEXT,
    "version_code" INTEGER,
    "merge_sha" TEXT,
    "status" TEXT NOT NULL DEFAULT 'running',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "started_at" DATETIME,
    "finished_at" DATETIME,
    "duration_ms" INTEGER,
    "exit_code" INTEGER,
    "fail_reason" TEXT,
    "log_path" TEXT,
    "log_size_bytes" INTEGER NOT NULL DEFAULT 0,
    "log_tail" TEXT,
    "log_truncated" BOOLEAN NOT NULL DEFAULT false,
    "log_deleted_at" DATETIME,
    "triggered_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "builds_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_builds" ("created_at", "duration_ms", "exit_code", "fail_reason", "finished_at", "id", "log_deleted_at", "log_path", "log_size_bytes", "log_tail", "log_truncated", "merge_sha", "pipeline_id", "progress", "stage", "started_at", "status", "triggered_by") SELECT "created_at", "duration_ms", "exit_code", "fail_reason", "finished_at", "id", "log_deleted_at", "log_path", "log_size_bytes", "log_tail", "log_truncated", "merge_sha", "pipeline_id", "progress", "stage", "started_at", "status", "triggered_by" FROM "builds";
DROP TABLE "builds";
ALTER TABLE "new_builds" RENAME TO "builds";
CREATE INDEX "builds_pipeline_id_idx" ON "builds"("pipeline_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
