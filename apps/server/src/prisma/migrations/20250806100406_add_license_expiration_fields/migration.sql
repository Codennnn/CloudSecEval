-- AlterTable
ALTER TABLE "public"."licenses" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isExpired" BOOLEAN NOT NULL DEFAULT false;
