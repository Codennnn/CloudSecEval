import type { Metadata } from 'next'

import { CloudSecEvalRoutes, generatePageTitle } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

export const metadata: Metadata = {
  title: generatePageTitle(CloudSecEvalRoutes.RegulationAnalysis),
}

/**
 * 法规智能解析页面
 * 用户输入法规条文，系统进行智能解析，并以知识图谱形式展示
 */
export default function RegulationAnalysisPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">法规智能解析</h1>
        <p className="text-muted-foreground">
          输入法规条文，系统进行智能解析，并以知识图谱形式展示
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

