-- CreateTable
CREATE TABLE "artifacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "build_id" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "relative_path" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "last_downloaded_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    CONSTRAINT "artifacts_build_id_fkey" FOREIGN KEY ("build_id") REFERENCES "builds" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "artifacts_status_created_at_idx" ON "artifacts"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "artifacts_build_id_relative_path_key" ON "artifacts"("build_id", "relative_path");
