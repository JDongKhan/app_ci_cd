-- CreateTable
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dev_owner_id" TEXT NOT NULL,
    "qa_owner_id" TEXT NOT NULL,
    "pm_owner_id" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'P1',
    "start_at" DATETIME NOT NULL,
    "due_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "requirements_dev_owner_id_fkey" FOREIGN KEY ("dev_owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "requirements_qa_owner_id_fkey" FOREIGN KEY ("qa_owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "requirements_pm_owner_id_fkey" FOREIGN KEY ("pm_owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "requirement_qa_members" (
    "requirement_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("requirement_id", "user_id"),
    CONSTRAINT "requirement_qa_members_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "requirement_qa_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "requirements_code_key" ON "requirements"("code");
