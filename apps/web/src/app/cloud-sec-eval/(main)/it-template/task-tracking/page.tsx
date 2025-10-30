'use client'

import { CloudSecEvalRoutes } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

/**
 * 任务跟踪台页面
 * 用于跟踪和监控任务进度
 */
export default function TaskTrackingPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 页面标题 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">任务跟踪台</h1>
        <p className="text-muted-foreground">
          跟踪和监控任务执行进度
        </p>
      </div>

      {/* 页面内容区域 */}
      <div className="flex-1 rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center">
        <p className="text-muted-foreground">页面内容区域</p>
      </div>
    </div>
  )
}

