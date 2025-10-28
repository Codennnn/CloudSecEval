import type { Metadata } from 'next'

import { CloudSecEvalRoutes, generatePageTitle } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

export const metadata: Metadata = {
  title: generatePageTitle(CloudSecEvalRoutes.IntelligentQA),
}

/**
 * 智能问答咨询页面
 * 用户提出问题，系统提供智能问答服务
 */
export default function IntelligentQAPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">智能问答咨询</h1>
        <p className="text-muted-foreground">
          提出问题，系统提供智能问答服务
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

