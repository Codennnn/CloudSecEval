import type { Metadata } from 'next'

import { CloudSecEvalRoutes, generatePageTitle } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

export const metadata: Metadata = {
  title: generatePageTitle(CloudSecEvalRoutes.RiskIdentification),
}

/**
 * 风险智能识别页面
 * 用户查看风险列表，系统智能识别潜在威胁
 */
export default function RiskIdentificationPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">风险智能识别</h1>
        <p className="text-muted-foreground">
          查看风险列表，系统智能识别潜在威胁
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

