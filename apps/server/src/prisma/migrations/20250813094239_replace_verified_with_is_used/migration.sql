/*
  Warnings:

  - You are about to drop the column `verified` on the `licenses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."licenses" DROP COLUMN "verified",
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false;
