-- CreateTable
CREATE TABLE "public"."bug_report_approval_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bugReportId" UUID NOT NULL,
    "approverId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "targetUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bug_report_approval_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bug_report_approval_logs_bugReportId_idx" ON "public"."bug_report_approval_logs"("bugReportId");

-- CreateIndex
CREATE INDEX "bug_report_approval_logs_approverId_idx" ON "public"."bug_report_approval_logs"("approverId");

-- CreateIndex
CREATE INDEX "bug_report_approval_logs_createdAt_idx" ON "public"."bug_report_approval_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."bug_report_approval_logs" ADD CONSTRAINT "bug_report_approval_logs_bugReportId_fkey" FOREIGN KEY ("bugReportId") REFERENCES "public"."bug_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bug_report_approval_logs" ADD CONSTRAINT "bug_report_approval_logs_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bug_report_approval_logs" ADD CONSTRAINT "bug_report_approval_logs_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
