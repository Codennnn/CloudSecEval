'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { OramaClient } from '@oramacloud/client'
import { BookOpenIcon, LoaderIcon, MessageCircleIcon, RotateCcwIcon, SendIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

// 定义消息类型
interface Message {
  role: 'user' | 'assistant'
  content: string
}

// 定义文档类型
interface Document {
  title?: string
  path?: string
  content?: string
  section?: string
}

// 定义来源类型
interface Source {
  document: Document
}

// 定义交互类型
interface Interaction {
  interactionId: string
  query: string
  response: string
  relatedQueries?: string[] | null
  sources?: {
    hits: Source[]
  } | null
  loading: boolean
  aborted: boolean
}

// 定义答案会话类型
interface AnswerSession {
  ask: (params: Record<string, unknown>) => Promise<unknown>
  clearSession: () => void
  regenerateLast: (params?: Record<string, unknown>) => Promise<unknown>
}

interface AnswerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnswerDialog({ open, onOpenChange }: AnswerDialogProps) {
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [answerSession, setAnswerSession] = useState<AnswerSession | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const initializeAnswerSession = useCallback(() => {
    try {
      const orama = new OramaClient({
        endpoint: process.env.NEXT_PUBLIC_ORAMA_ENDPOINT!,
        api_key: process.env.NEXT_PUBLIC_ORAMA_API_KEY!,
      })

      const session = orama.createAnswerSession({
        userContext: '用户正在浏览 NestJS 中文文档网站，希望获得关于 NestJS 框架的准确和详细的答案。请用中文回答问题。',
        inferenceType: 'documentation',
        initialMessages: [],
        events: {
          onStateChange: (state: unknown) => {
            // Safely type check and cast the state
            const interactions = Array.isArray(state) ? state as Interaction[] : []
            setInteractions(interactions)

            // 从状态中提取消息
            const allMessages: Message[] = []
            interactions.forEach((interaction) => {
              if (interaction?.query) {
                allMessages.push({ role: 'user', content: interaction.query })
              }

              if (interaction?.response) {
                allMessages.push({ role: 'assistant', content: interaction.response })
              }
            })
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
      console.error('Failed to initialize answer session:', error)
    }
  }, [])

  // 初始化 Orama Client 和 Answer Session
  useEffect(() => {
    if (open && !answerSession) {
      initializeAnswerSession()
    }
  }, [open, answerSession, initializeAnswerSession])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 自动聚焦输入框
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [open])

  const handleAskQuestion = useCallback(async () => {
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
  }, [currentQuestion, isLoading, answerSession])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleAskQuestion()
    }
  }, [handleAskQuestion])

  const handleClearChat = useCallback(() => {
    if (answerSession) {
      answerSession.clearSession()
    }

    setMessages([])
    setInteractions([])
  }, [answerSession])

  const handleRegenerateLast = useCallback(async () => {
    if (!answerSession || isLoading) {
      return
    }

    try {
      setIsLoading(true)

      await answerSession.regenerateLast({ stream: true })
    }
    catch (error) {
      console.error('Failed to regenerate last answer:', error)
      setIsLoading(false)
    }
  }, [answerSession, isLoading])

  const handleSourceClick = useCallback((path: string) => {
    if (path && path !== '#') {
      onOpenChange(false)

      // 如果是相对路径，确保正确导航
      if (path.startsWith('/')) {
        window.location.href = path
      }
      else {
        window.open(path, '_blank', 'noopener,noreferrer')
      }
    }
  }, [onOpenChange])

  // 建议问题
  const suggestedQuestions = [
    '什么是 NestJS？',
    '如何创建一个控制器？',
    'NestJS 中的依赖注入是如何工作的？',
    '如何配置数据库连接？',
    '如何使用装饰器？',
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircleIcon className="size-5" />
              <span>NestJS AI 助手</span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <>
                  <Button
                    disabled={isLoading || messages.length === 0}
                    size="sm"
                    variant="ghost"
                    onClick={() => { void handleRegenerateLast() }}
                  >
                    <RotateCcwIcon className="size-4 mr-1" />
                    重新生成
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearChat}
                  >
                    清除对话
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            与 NestJS AI 助手对话，获取关于 NestJS 框架的详细答案和指导
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4">
            {messages.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircleIcon className="size-12 mb-4 text-muted-foreground" />
                    <div className="text-lg font-medium mb-2">开始与 NestJS AI 助手对话</div>
                    <div className="text-sm text-muted-foreground mb-6">
                      询问任何关于 NestJS 的问题，获得基于官方文档的准确答案
                    </div>

                    {/* 建议问题 */}
                    <div className="w-full max-w-md space-y-2">
                      <div className="text-sm font-medium text-muted-foreground mb-3">试试这些问题：</div>
                      {suggestedQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          className="w-full text-left text-sm p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                          onClick={() => {
                            setCurrentQuestion(question)
                            setTimeout(() => {
                              void handleAskQuestion()
                            }, 100)
                          }}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              : (
                  <div className="space-y-4">
                    {messages.map((message, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>

                          {/* 显示相关来源 */}
                          {message.role === 'assistant' && interactions.length > 0 && (
                            (() => {
                              const currentInteraction = interactions[Math.floor(idx / 2)]

                              if (Array.isArray(currentInteraction.sources?.hits)
                                && currentInteraction.sources.hits.length > 0) {
                                return (
                                  <div className="mt-3 pt-3 border-t border-border/50">
                                    <div className="text-xs font-medium mb-2 flex items-center gap-1">
                                      <BookOpenIcon className="size-3" />
                                      参考文档：
                                    </div>
                                    <div className="space-y-1">
                                      {currentInteraction.sources.hits.slice(0, 3).map(
                                        (hit: Source, sourceIdx: number) => (
                                          <button
                                            key={sourceIdx}
                                            className="block text-xs text-blue-600 hover:underline text-left"
                                            onClick={() => {
                                              handleSourceClick(hit.document.path ?? '#')
                                            }}
                                          >
                                            {hit.document.title}
                                          </button>
                                        ))}
                                    </div>
                                  </div>
                                )
                              }

                              return null
                            })()
                          )}

                          {/* 显示相关问题 */}
                          {message.role === 'assistant' && interactions.length > 0 && (
                            (() => {
                              const currentInteraction = interactions[Math.floor(idx / 2)]

                              if (Array.isArray(currentInteraction.relatedQueries)
                                && currentInteraction.relatedQueries.length > 0) {
                                return (
                                  <div className="mt-3 pt-3 border-t border-border/50">
                                    <div className="text-xs font-medium mb-2">相关问题：</div>
                                    <div className="space-y-1">
                                      {currentInteraction.relatedQueries.map(
                                        (query: string, queryIdx: number) => (
                                          <button
                                            key={queryIdx}
                                            className="block text-xs text-blue-600 hover:underline text-left"
                                            onClick={() => {
                                              setCurrentQuestion(query)
                                              setTimeout(() => {
                                                void handleAskQuestion()
                                              }, 100)
                                            }}
                                          >
                                            {query}
                                          </button>
                                        ))}
                                    </div>
                                  </div>
                                )
                              }

                              return null
                            })()
                          )}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                          <div className="flex items-center gap-2 text-sm">
                            <LoaderIcon className="size-4 animate-spin" />
                            正在思考...
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
          </div>

          {/* 输入区域 */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                disabled={isLoading}
                placeholder="请输入您的问题..."
                type="text"
                value={currentQuestion}
                onChange={(e) => {
                  setCurrentQuestion(e.target.value)
                }}
                onKeyDown={handleKeyDown}
              />
              <Button
                disabled={!currentQuestion.trim() || isLoading}
                size="icon"
                onClick={() => { handleAskQuestion().catch(console.error) }}
              >
                <SendIcon className="size-4" />
              </Button>
            </div>

            {/* 提示文字 */}
            <div className="text-xs text-muted-foreground mt-2 text-center">
              基于 NestJS 官方文档提供准确答案 • 按 Enter 发送
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
