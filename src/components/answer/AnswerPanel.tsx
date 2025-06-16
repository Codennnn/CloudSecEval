'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { type Interaction, OramaClient } from '@oramacloud/client'
import { MessageCircleIcon, Trash2Icon, XIcon } from 'lucide-react'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { AssistantMessage } from './AssistantMessage'
import { EmptyState } from './EmptyState'
import { LoadingMessage } from './LoadingMessage'
import { UserMessage } from './UserMessage'

const USER_CONTEXT = '用户正在浏览 NestJS 中文文档网站，希望获得关于 NestJS 框架的准确和详细的答案。请用中文回答问题，并保持对话的连续性和上下文理解。'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
  interactionId?: string
}

interface AnswerSession {
  ask: (params: Record<string, unknown>) => Promise<unknown>
  clearSession: () => void
  regenerateLast: (params?: Record<string, unknown>) => Promise<unknown>
}

interface AnswerPanelProps {
  isVisible?: boolean
  onClose?: () => void
}

export function AnswerPanel({ isVisible = true, onClose }: AnswerPanelProps) {
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [answerSession, setAnswerSession] = useState<AnswerSession | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const initializeAnswerSession = useEvent(() => {
    try {
      const orama = new OramaClient({
        endpoint: process.env.NEXT_PUBLIC_ORAMA_ENDPOINT!,
        api_key: process.env.NEXT_PUBLIC_ORAMA_API_KEY!,
      })

      const session = orama.createAnswerSession({
        userContext: USER_CONTEXT,
        inferenceType: 'documentation',
        initialMessages: conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        events: {
          onStateChange: (state) => {
            const interactions = Array.isArray(state) ? state as Interaction[] : []
            // console.log(interactions, 'interactions')

            setInteractions(interactions)

            const allMessages = interactions.reduce<Message[]>((messages, interaction) => {
              if (interaction.query) {
                messages.push({
                  role: 'user',
                  content: interaction.query,
                  timestamp: Date.now(),
                  interactionId: interaction.interactionId,
                })
              }

              if (interaction.response) {
                messages.push({
                  role: 'assistant',
                  content: interaction.response,
                  timestamp: Date.now(),
                  interactionId: interaction.interactionId,
                })
              }

              return messages
            }, [])

            setMessages(allMessages)

            // 更新对话历史
            if (allMessages.length > 0) {
              setConversationHistory(allMessages)
            }
          },

          onMessageLoading: (loading: boolean) => {
            setIsLoading(loading)
          },

          onAnswerAborted: (aborted: boolean) => {
            if (aborted) {
              setIsLoading(false)
              setIsRegenerating(false)
            }
          },
        },
      })

      setAnswerSession(session)
    }
    catch (error) {
      console.error('初始化答案会话失败：', error)
    }
  })

  // 初始化 Answer Session
  useEffect(() => {
    if (isVisible && !answerSession) {
      initializeAnswerSession()
    }
  }, [isVisible, answerSession, initializeAnswerSession])

  // 滚动到底部的辅助函数
  const scrollToBottom = useEvent(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  })

  // 检查是否接近底部
  const checkIfNearBottom = useEvent(() => {
    const container = scrollContainerRef.current

    if (!container) {
      return true
    }

    const { scrollTop, scrollHeight, clientHeight } = container
    const threshold = 100 // 距离底部100px内认为是接近底部

    return scrollHeight - scrollTop - clientHeight <= threshold
  })

  // 处理用户滚动
  const handleScroll = useEvent(() => {
    const nearBottom = checkIfNearBottom()
    setIsNearBottom(nearBottom)

    // 标记用户正在滚动
    setIsUserScrolling(true)

    // 清除之前的定时器
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current)
    }

    // 1秒后认为用户停止滚动
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false)
    }, 1000)
  })

  // 智能滚动：只在用户接近底部且没有主动滚动时才自动滚动
  const smartScrollToBottom = useEvent(() => {
    if (isNearBottom && !isUserScrolling) {
      scrollToBottom()
    }
  })

  // 自动滚动到底部
  useEffect(() => {
    smartScrollToBottom()
  }, [messages, smartScrollToBottom])

  // 当加载状态变化时也滚动到底部，确保用户能看到加载状态
  useEffect(() => {
    if (isLoading) {
      smartScrollToBottom()
    }
  }, [isLoading, smartScrollToBottom])

  // 自动聚焦输入框
  useEffect(() => {
    if (isVisible && !isLoading && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isVisible, isLoading])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current)
      }
    }
  }, [])

  const handleAskQuestion = useEvent(async () => {
    if (!currentQuestion.trim() || isLoading || !answerSession) {
      return
    }

    const question = currentQuestion.trim()
    setCurrentQuestion('')
    setIsLoading(true)

    // 用户发送问题后强制滚动到底部（重置用户滚动状态）
    setIsUserScrolling(false)
    setIsNearBottom(true)
    scrollToBottom()

    try {
      await answerSession.ask({
        term: question,
        related: {
          howMany: 3,
          format: 'question',
        },
      })
    }
    catch (error) {
      console.error('Failed to ask question:', error)
      setIsLoading(false)
    }
  })

  const handleKeyDown = useEvent((ev: React.KeyboardEvent) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault()
      void handleAskQuestion()
    }
  })

  const handleClearChat = useEvent(() => {
    if (answerSession) {
      answerSession.clearSession()
    }

    setMessages([])
    setInteractions([])
    setConversationHistory([])
    setIsRegenerating(false)

    // 清除后重新聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  })

  const handleRelatedQuestionClick = useEvent((query: string) => {
    setCurrentQuestion(query)

    // 设置问题后立即滚动，让用户看到问题被填入
    setIsUserScrolling(false)
    setIsNearBottom(true)
    scrollToBottom()

    setTimeout(() => {
      void handleAskQuestion()
    }, 100)
  })

  // 获取对话统计信息
  const conversationStats = {
    totalMessages: messages.length,
    userMessages: messages.filter((m) => m.role === 'user').length,
    assistantMessages: messages.filter((m) => m.role === 'assistant').length,
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircleIcon className="size-4" />
          <span className="text-sm font-medium">AI 助手</span>
          {conversationStats.totalMessages > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {conversationStats.userMessages} 问 {conversationStats.assistantMessages} 答
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-7"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    handleClearChat()
                  }}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="bottom">
                清除所有对话
              </TooltipContent>
            </Tooltip>
          )}

          <Button
            className="size-7"
            size="icon"
            title="关闭 AI 助手"
            variant="ghost"
            onClick={() => {
              onClose?.()
            }}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* 消息区域 */}
      <ScrollGradientContainer
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0
          ? (
              <EmptyState
                onQuestionClick={handleRelatedQuestionClick}
              />
            )
          : (
              <div className="p-panel space-y-panel">
                {messages.map((message, idx) => {
                  if (message.role === 'user') {
                    return (
                      <UserMessage
                        key={`${message.interactionId}-${idx}`}
                        content={message.content}
                      />
                    )
                  }

                  // 助手消息
                  const currentInteraction = interactions[Math.floor(idx / 2)]

                  return (
                    <AssistantMessage
                      key={`${message.interactionId}-${idx}`}
                      content={message.content}
                      interaction={currentInteraction}
                      onRelatedQuestionClick={handleRelatedQuestionClick}
                    />
                  )
                })}

                {isLoading && (
                  <LoadingMessage
                    isRegenerating={isRegenerating}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
      </ScrollGradientContainer>

      {/* 输入区域 */}
      <div className="p-panel">
        <Textarea
          ref={inputRef}
          className="text-xs resize-none bg-muted"
          disabled={isLoading}
          placeholder={
            messages.length === 0
              ? '输入问题开始对话，按 Enter 发送'
              : '继续提问...'
          }
          value={currentQuestion}
          onChange={(ev: React.ChangeEvent<HTMLTextAreaElement>) => {
            setCurrentQuestion(ev.target.value)
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}
