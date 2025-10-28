import type { Metadata } from 'next'

import { CloudSecEvalRoutes, generatePageTitle } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

export const metadata: Metadata = {
  title: generatePageTitle(CloudSecEvalRoutes.ComplianceAssessment),
}

/**
 * 合规自动评估页面
 * 用户发起合规评估流程，系统自动进行合规性判断
 */
export default function ComplianceAssessmentPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">合规自动评估</h1>
        <p className="text-muted-foreground">
          发起合规评估流程，系统自动进行合规性判断
        </p>
      </div>

      <div className="flex-1 rounded-lg border bg-card p-6">
        <p className="text-center text-muted-foreground">
          功能开发中...
        </p>
      </div>
    </div>
  )
}

