-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "default_branch" TEXT NOT NULL DEFAULT 'main',
    "build_script" TEXT NOT NULL DEFAULT './build_app',
    "artifact_type" TEXT NOT NULL,
    "artifact_pattern" TEXT,
    "branches_json" TEXT NOT NULL,
    "machine" TEXT NOT NULL DEFAULT 'builder-01',
    "stack" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "apps_name_platform_key" ON "apps"("name", "platform");
