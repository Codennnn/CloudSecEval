-- CreateTable
CREATE TABLE "public"."roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orgId" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "system" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "system" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId","orgId")
);

-- CreateIndex
CREATE INDEX "roles_orgId_idx" ON "public"."roles"("orgId");

-- CreateIndex
CREATE INDEX "roles_slug_idx" ON "public"."roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "roles_orgId_slug_key" ON "public"."roles"("orgId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_slug_key" ON "public"."permissions"("slug");

-- CreateIndex
CREATE INDEX "permissions_resource_idx" ON "public"."permissions"("resource");

-- CreateIndex
CREATE INDEX "permissions_action_idx" ON "public"."permissions"("action");

-- CreateIndex
CREATE INDEX "user_roles_orgId_idx" ON "public"."user_roles"("orgId");

-- CreateIndex
CREATE INDEX "user_roles_expiresAt_idx" ON "public"."user_roles"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
