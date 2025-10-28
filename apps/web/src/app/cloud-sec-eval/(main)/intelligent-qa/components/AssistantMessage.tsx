'use client'

import { BotIcon } from 'lucide-react'

import { cn } from '~/lib/utils'

interface AssistantMessageProps {
  /** 消息内容 */
  content: string
  /** 是否正在输入（打字机效果） */
  isTyping?: boolean
}

/**
 * AI 助手消息组件
 * 显示 AI 的回复内容
 */
export function AssistantMessage(props: AssistantMessageProps) {
  const { content, isTyping = false } = props

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
        <BotIcon className="size-4 text-white" />
      </div>

      <div className="flex flex-col gap-2 max-w-[80%]">
        <div className="bg-muted rounded-lg px-4 py-2.5 shadow-sm">
          <div className="text-sm whitespace-pre-wrap break-words prose prose-sm max-w-none dark:prose-invert">
            {content}
            {isTyping && (
              <span className="inline-block w-1 h-4 ml-0.5 bg-current animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

