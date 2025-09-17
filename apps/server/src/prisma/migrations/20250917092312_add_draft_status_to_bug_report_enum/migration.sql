-- CreateEnum
CREATE TYPE "public"."bug_severity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."bug_report_status" AS ENUM ('DRAFT', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "public"."bug_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "severity" "public"."bug_severity" NOT NULL,
    "attackMethod" TEXT,
    "description" TEXT,
    "discoveredUrls" TEXT[],
    "attachments" JSONB,
    "status" "public"."bug_report_status" NOT NULL DEFAULT 'PENDING',
    "userId" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "reviewerId" UUID,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bug_reports_orgId_idx" ON "public"."bug_reports"("orgId");

-- CreateIndex
CREATE INDEX "bug_reports_userId_idx" ON "public"."bug_reports"("userId");

-- CreateIndex
CREATE INDEX "bug_reports_status_idx" ON "public"."bug_reports"("status");

-- CreateIndex
CREATE INDEX "bug_reports_severity_idx" ON "public"."bug_reports"("severity");

-- CreateIndex
CREATE INDEX "bug_reports_createdAt_idx" ON "public"."bug_reports"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."bug_reports" ADD CONSTRAINT "bug_reports_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bug_reports" ADD CONSTRAINT "bug_reports_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bug_reports" ADD CONSTRAINT "bug_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
