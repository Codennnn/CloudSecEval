'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { type Interaction, OramaClient } from '@oramacloud/client'
import { ArrowUpIcon } from 'lucide-react'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { useChatSessions } from '~/hooks/useChatSessions'
import type { ChatMessage } from '~/types/chat'

import { AssistantMessage } from './AssistantMessage'
import { EmptyState } from './EmptyState'
import { LoadingMessage } from './LoadingMessage'
import { UserMessage } from './UserMessage'

const USER_CONTEXT = '用户正在浏览 NestJS 中文文档网站，希望获得关于 NestJS 框架的准确和详细的答案。请用中文回答问题，并保持对话的连续性和上下文理解。'

interface AnswerSession {
  ask: (params: Record<string, unknown>) => Promise<unknown>
  clearSession: () => void
  regenerateLast: (params?: Record<string, unknown>) => Promise<unknown>
}

interface AnswerPanelProps {
  sessionId?: string | null
  onSessionChange?: (sessionId: string) => void
  onSaveStatusChange?: (status: 'saving' | 'saved' | 'error' | 'idle') => void
}

export function AnswerPanel(props: AnswerPanelProps) {
  const {
    sessionId,
    onSessionChange,
    onSaveStatusChange,
  } = props

  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [answerSession, setAnswerSession] = useState<AnswerSession | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([])
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const {
    createSession,
    appendMessage,
    getSession,
  } = useChatSessions()

  // 当前会话 ID（优先使用外部传入的）
  const [internalSessionId, setInternalSessionId] = useState<string | null>(null)
  const currentSessionId = sessionId ?? internalSessionId

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageCountRef = useRef(0)

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

            setInteractions(interactions)

            const allMessages = interactions.reduce<ChatMessage[]>((messages, interaction) => {
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

  /**
   * 确保会话存在的辅助函数
   * 只在需要时才创建会话（延迟创建）
   */
  const ensureSession = useEvent((): string => {
    if (currentSessionId) {
      return currentSessionId
    }

    // 创建新的聊天会话
    const newSession = createSession()

    if (sessionId === undefined) {
      setInternalSessionId(newSession.id)
    }

    onSessionChange?.(newSession.id)

    return newSession.id
  })

  // 当会话切换时恢复对话历史
  useEffect(() => {
    if (currentSessionId) {
      const session = getSession(currentSessionId)

      if (session && session.messages.length > 0) {
        // 恢复会话消息
        const restoredMessages: ChatMessage[] = session.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          interactionId: msg.interactionId,
        }))

        setMessages(restoredMessages)
        setConversationHistory(restoredMessages)
        lastMessageCountRef.current = restoredMessages.length

        // 重新初始化 Orama 会话以包含历史消息
        setAnswerSession(null)
      }
      else {
        // 新会话，清空消息
        setMessages([])
        setConversationHistory([])
        lastMessageCountRef.current = 0
        setAnswerSession(null)
      }
    }
  }, [currentSessionId, getSession])

  // 初始化 Answer Session
  useEffect(() => {
    if (!answerSession) {
      initializeAnswerSession()
    }
  }, [answerSession, initializeAnswerSession])

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

  // 保存新消息到当前会话

  useEffect(() => {
    if (currentSessionId && messages.length > lastMessageCountRef.current) {
      // 只保存新增的消息
      const newMessages = messages.slice(lastMessageCountRef.current)

      if (newMessages.length > 0) {
        onSaveStatusChange?.('saving')

        try {
          newMessages.forEach((msg) => {
            const chatMessage: ChatMessage = {
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp ?? Date.now(),
              interactionId: msg.interactionId,
            }

            appendMessage(currentSessionId, chatMessage)
          })

          lastMessageCountRef.current = messages.length
          onSaveStatusChange?.('saved')
        }
        catch (error) {
          console.error('保存消息失败：', error)
          onSaveStatusChange?.('error')
        }
      }
    }
  }, [currentSessionId, messages, appendMessage, onSaveStatusChange])

  // 当加载状态变化时也滚动到底部，确保用户能看到加载状态
  useEffect(() => {
    if (isLoading) {
      smartScrollToBottom()
    }
  }, [isLoading, smartScrollToBottom])

  // 自动聚焦输入框
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isLoading])

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

    // 确保会话存在（延迟创建：只在用户真正发送消息时才创建会话）
    ensureSession()

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
    catch (err) {
      console.error('问答失败：', err)
      setIsLoading(false)
    }
  })

  const handleKeyDown = useEvent((ev: React.KeyboardEvent) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault()
      void handleAskQuestion()
    }
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

  return (
    <div className="h-full flex flex-col">
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
      <div className="p-panel pt-0">
        {/* AI 问答渐变边框容器 */}
        <div className="relative p-0.5 rounded-xl bg-gradient-to-r from-theme/60 to-theme2/40">
          <div className="rounded-[12px] overflow-hidden bg-background">
            <Textarea
              ref={inputRef}
              className="!text-[13px] p-2 resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent disabled:opacity-80"
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

            <div className="flex items-center justify-end p-1.5 pt-0">
              <Button
                className="!text-xs !py-1 !px-1.5 h-auto !gap-1"
                size="sm"
                variant="outline"
                onClick={() => {
                  void handleAskQuestion()
                }}
              >
                <ArrowUpIcon className="size-3.5" />
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
