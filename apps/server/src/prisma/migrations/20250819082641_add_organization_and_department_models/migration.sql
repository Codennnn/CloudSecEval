/*
  Warnings:

  - Added the required column `orgId` to the `users` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "remark" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orgId" UUID NOT NULL,
    "parentId" UUID,
    "name" TEXT NOT NULL,
    "remark" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "public"."organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_code_key" ON "public"."organizations"("code");

-- CreateIndex
CREATE INDEX "departments_orgId_idx" ON "public"."departments"("orgId");

-- CreateIndex
CREATE INDEX "departments_parentId_idx" ON "public"."departments"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_orgId_parentId_name_key" ON "public"."departments"("orgId", "parentId", "name");

-- 创建默认组织并获取ID
DO $$
DECLARE
    default_org_id UUID;
BEGIN
    -- 插入默认组织
    INSERT INTO "public"."organizations" ("id", "name", "code", "remark", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), '默认组织', 'DEFAULT_ORG', '系统默认组织，用于迁移现有用户', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING "id" INTO default_org_id;
    
    -- 添加用户表的新列
    ALTER TABLE "public"."users" ADD COLUMN "departmentId" UUID;
    ALTER TABLE "public"."users" ADD COLUMN "orgId" UUID;
    
    -- 将所有现有用户分配到默认组织
    UPDATE "public"."users" SET "orgId" = default_org_id;
    
    -- 设置列为非空约束
    ALTER TABLE "public"."users" ALTER COLUMN "orgId" SET NOT NULL;
END $$;

-- CreateIndex
CREATE INDEX "users_orgId_idx" ON "public"."users"("orgId");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "public"."users"("departmentId");

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
