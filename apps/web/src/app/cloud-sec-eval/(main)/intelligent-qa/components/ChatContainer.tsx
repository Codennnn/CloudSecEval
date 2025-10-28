'use client'

import { useEffect, useRef } from 'react'

import { ScrollArea } from '~/components/ui/scroll-area'

import type { Message } from '../types'

import { AssistantMessage } from './AssistantMessage'
import { EmptyState } from './EmptyState'
import { LoadingIndicator } from './LoadingIndicator'
import { UserMessage } from './UserMessage'

interface ChatContainerProps {
  /** 消息列表 */
  messages: Message[]
  /** 是否正在加载（AI 思考中） */
  isLoading?: boolean
  /** 当前正在输入的 AI 消息（用于打字机效果） */
  typingMessage?: string
  /** 点击推荐问题的回调 */
  onQuestionClick: (question: string) => void
}

/**
 * 聊天容器组件
 * 显示对话历史和空状态
 */
export function ChatContainer(props: ChatContainerProps) {
  const {
    messages,
    isLoading = false,
    typingMessage,
    onQuestionClick,
  } = props

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * 自动滚动到最新消息
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages, typingMessage, isLoading])

  // 空状态
  if (messages.length === 0 && !isLoading) {
    return <EmptyState onQuestionClick={onQuestionClick} />
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div
        ref={scrollAreaRef}
        className="px-4 py-6 space-y-6 max-w-4xl mx-auto"
      >
        {/* 渲染消息列表 */}
        {messages.map((message) => {
          if (message.role === 'user') {
            return (
              <UserMessage
                key={message.id}
                content={message.content}
              />
            )
          }

          return (
            <AssistantMessage
              key={message.id}
              content={message.content}
            />
          )
        })}

        {/* 显示正在输入的消息（打字机效果） */}
        {typingMessage && (
          <AssistantMessage
            content={typingMessage}
            isTyping
          />
        )}

        {/* 显示加载指示器 */}
        {isLoading && !typingMessage && (
          <LoadingIndicator />
        )}

        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}

