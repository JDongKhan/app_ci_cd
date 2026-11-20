-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "req_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'P1',
    "start_at" DATETIME NOT NULL,
    "due_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'none',
    "status_at" DATETIME,
    "status_by" TEXT,
    "finished_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "tasks_req_id_fkey" FOREIGN KEY ("req_id") REFERENCES "requirements" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "tasks_req_id_idx" ON "tasks"("req_id");

-- CreateIndex
CREATE INDEX "tasks_owner_id_idx" ON "tasks"("owner_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
