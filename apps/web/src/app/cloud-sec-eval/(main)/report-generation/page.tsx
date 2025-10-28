import type { Metadata } from 'next'

import { CloudSecEvalRoutes, generatePageTitle } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

export const metadata: Metadata = {
  title: generatePageTitle(CloudSecEvalRoutes.ReportGeneration),
}

/**
 * 报告自动生成页面
 * 用户触发报告生成需求，系统自动生成合规报告
 */
export default function ReportGenerationPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">报告自动生成</h1>
        <p className="text-muted-foreground">
          触发报告生成需求，系统自动生成合规报告
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

