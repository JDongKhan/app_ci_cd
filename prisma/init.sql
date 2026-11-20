-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" TEXT,
    "team" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "permission_key" TEXT NOT NULL,

    PRIMARY KEY ("role", "level", "permission_key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_account_key" ON "users"("account");
