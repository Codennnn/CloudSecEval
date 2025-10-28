'use client'

import { BotIcon } from 'lucide-react'

/**
 * AI 思考中的加载指示器
 * 显示动画效果表示 AI 正在处理
 */
export function LoadingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
        <BotIcon className="size-4 text-white" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-muted rounded-lg px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
            <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
            <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground px-1">
          AI 正在思考中...
        </p>
      </div>
    </div>
  )
}
