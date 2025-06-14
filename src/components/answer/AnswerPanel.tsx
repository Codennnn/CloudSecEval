'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { type Interaction, OramaClient } from '@oramacloud/client'
import { MessageCircleIcon, RotateCcwIcon, SendIcon, XIcon } from 'lucide-react'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

import { AssistantMessage } from './AssistantMessage'
import { EmptyState } from './EmptyState'
import { LoadingMessage } from './LoadingMessage'
import { UserMessage } from './UserMessage'

const USER_CONTEXT = '用户正在浏览 NestJS 中文文档网站，希望获得关于 NestJS 框架的准确和详细的答案。请用中文回答问题。'

interface Message {
  role: 'user' | 'assistant'
  content: string
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

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const initializeAnswerSession = useEvent(() => {
    try {
      const orama = new OramaClient({
        endpoint: process.env.NEXT_PUBLIC_ORAMA_ENDPOINT!,
        api_key: process.env.NEXT_PUBLIC_ORAMA_API_KEY!,
      })

      const session = orama.createAnswerSession({
        userContext: USER_CONTEXT,
        inferenceType: 'documentation',
        initialMessages: [],
        events: {
          onStateChange: (state) => {
            const interactions = Array.isArray(state) ? state as Interaction[] : []
            console.log(interactions, 'interactions')

            setInteractions(interactions)

            const allMessages = interactions.reduce<Message[]>((messages, interaction) => {
              if (interaction.query) {
                messages.push({ role: 'user', content: interaction.query })
              }

              if (interaction.response) {
                messages.push({ role: 'assistant', content: interaction.response })
              }

              return messages
            }, [])

            setMessages(allMessages)
          },

          onMessageLoading: (loading: boolean) => {
            setIsLoading(loading)
          },

          onAnswerAborted: (aborted: boolean) => {
            if (aborted) {
              setIsLoading(false)
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

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAskQuestion = useEvent(async () => {
    if (!currentQuestion.trim() || isLoading || !answerSession) {
      return
    }

    const question = currentQuestion.trim()
    setCurrentQuestion('')
    setIsLoading(true)

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
  })

  const handleRegenerateLast = useEvent(async () => {
    if (answerSession) {
      try {
        setIsLoading(true)

        handleClearChat()

        await answerSession.regenerateLast({ stream: true })
      }
      catch (err) {
        console.error('Failed to regenerate last answer:', err)
      }
      finally {
        setIsLoading(false)
      }
    }
  })

  const handleRelatedQuestionClick = useEvent((query: string) => {
    setCurrentQuestion(query)

    setTimeout(() => {
      void handleAskQuestion()
    }, 100)
  })

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
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <>
              <Button
                className="h-7 px-2 text-xs"
                disabled={isLoading || messages.length === 0}
                size="sm"
                variant="ghost"
                onClick={() => { void handleRegenerateLast() }}
              >
                <RotateCcwIcon className="size-3 mr-1" />
                重新生成
              </Button>

              <Button
                className="h-7 px-2 text-xs"
                size="sm"
                variant="ghost"
                onClick={() => {
                  handleClearChat()
                }}
              >
                清除
              </Button>
            </>
          )}

          <Button
            className="size-7"
            size="icon"
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
      <ScrollGradientContainer>
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
                        key={idx}
                        content={message.content}
                      />
                    )
                  }

                  // 助手消息
                  const currentInteraction = interactions[Math.floor(idx / 2)]

                  return (
                    <AssistantMessage
                      key={idx}
                      content={message.content}
                      interaction={currentInteraction}
                      onRelatedQuestionClick={handleRelatedQuestionClick}
                    />
                  )
                })}

                {isLoading && <LoadingMessage />}

                <div ref={messagesEndRef} />
              </div>
            )}
      </ScrollGradientContainer>

      {/* 输入区域 */}
      <div className="border-t border-border p-panel">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            className="flex-1 text-xs h-8"
            disabled={isLoading}
            placeholder="输入问题..."
            type="text"
            value={currentQuestion}
            onChange={(ev) => {
              setCurrentQuestion(ev.target.value)
            }}
            onKeyDown={handleKeyDown}
          />
          <Button
            className="h-8 w-8 p-0"
            disabled={!currentQuestion.trim() || isLoading}
            size="sm"
            onClick={() => { handleAskQuestion().catch(console.error) }}
          >
            <SendIcon className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
