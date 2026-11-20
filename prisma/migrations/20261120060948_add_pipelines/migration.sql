-- CreateTable
CREATE TABLE "pipelines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'none',
    "rework_from" TEXT,
    "rework_reason" TEXT,
    "rework_by" TEXT,
    "rework_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pipelines_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pipelines_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipeline_merges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipeline_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "from_branch" TEXT NOT NULL,
    "to_branch" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "commits" INTEGER NOT NULL DEFAULT 0,
    "operator_id" TEXT,
    "merged_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invalidated_at" DATETIME,
    "invalidated_reason" TEXT,
    CONSTRAINT "pipeline_merges_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipeline_conflicts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipeline_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "temp_branch" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" DATETIME,
    "resolved_by" TEXT,
    CONSTRAINT "pipeline_conflicts_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipeline_conflict_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conflict_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    CONSTRAINT "pipeline_conflict_files_conflict_id_fkey" FOREIGN KEY ("conflict_id") REFERENCES "pipeline_conflicts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipeline_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipeline_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT,
    "payload_json" TEXT,
    "actor_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pipeline_events_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "pipelines_task_id_idx" ON "pipelines"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "pipelines_task_id_app_id_branch_key" ON "pipelines"("task_id", "app_id", "branch");

-- CreateIndex
CREATE INDEX "pipeline_merges_pipeline_id_idx" ON "pipeline_merges"("pipeline_id");

-- CreateIndex
CREATE INDEX "pipeline_conflicts_pipeline_id_idx" ON "pipeline_conflicts"("pipeline_id");

-- CreateIndex
CREATE INDEX "pipeline_events_pipeline_id_idx" ON "pipeline_events"("pipeline_id");
