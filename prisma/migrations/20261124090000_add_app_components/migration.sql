-- AlterTable
ALTER TABLE "apps" ADD COLUMN "is_component" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "app_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "app_id" TEXT NOT NULL,
    "component_app_id" TEXT NOT NULL,
    "version" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_components_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "app_components_component_app_id_fkey" FOREIGN KEY ("component_app_id") REFERENCES "apps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "app_components_app_id_component_app_id_key" ON "app_components"("app_id", "component_app_id");

-- CreateIndex
CREATE INDEX "app_components_component_app_id_idx" ON "app_components"("component_app_id");
