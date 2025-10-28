'use client'

import { UserIcon } from 'lucide-react'

interface UserMessageProps {
  /** 消息内容 */
  content: string
}

/**
 * 用户消息组件
 * 显示用户发送的问题
 */
export function UserMessage(props: UserMessageProps) {
  const { content } = props

  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="flex flex-col items-end gap-2 max-w-[80%]">
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 shadow-sm">
          <p className="text-sm whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
        <UserIcon className="size-4 text-primary" />
      </div>
    </div>
  )
}
