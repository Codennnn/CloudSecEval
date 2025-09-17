-- CreateEnum
CREATE TYPE "public"."FileStatus" AS ENUM ('UPLOADING', 'SCANNING', 'READY', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."FileVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'PROTECTED');

-- CreateTable
CREATE TABLE "public"."file_objects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL DEFAULT 'local',
    "bucket" TEXT,
    "storageKey" TEXT NOT NULL,
    "url" TEXT,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "originalName" TEXT,
    "sha256" TEXT NOT NULL,
    "md5" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "status" "public"."FileStatus" NOT NULL DEFAULT 'UPLOADING',
    "visibility" "public"."FileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "metadata" JSONB,
    "uploaderId" UUID,
    "scannedAt" TIMESTAMP(3),
    "checksumAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_objects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_objects_uploaderId_createdAt_idx" ON "public"."file_objects"("uploaderId", "createdAt");

-- CreateIndex
CREATE INDEX "file_objects_status_createdAt_idx" ON "public"."file_objects"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "file_objects_sha256_size_key" ON "public"."file_objects"("sha256", "size");

-- AddForeignKey
ALTER TABLE "public"."file_objects" ADD CONSTRAINT "file_objects_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
