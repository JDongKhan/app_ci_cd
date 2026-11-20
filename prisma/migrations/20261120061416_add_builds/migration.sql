-- CreateTable
CREATE TABLE "builds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipeline_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
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

-- CreateIndex
CREATE INDEX "builds_pipeline_id_idx" ON "builds"("pipeline_id");
