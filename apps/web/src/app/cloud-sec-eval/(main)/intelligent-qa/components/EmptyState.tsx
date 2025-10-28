'use client'

import { MessageSquareIcon, SparklesIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'

import { suggestedQuestions } from '../lib/mock-qa-data'

interface EmptyStateProps {
  /** 点击推荐问题的回调 */
  onQuestionClick: (question: string) => void
}

/**
 * 空状态组件
 * 在没有对话历史时显示欢迎信息和推荐问题
 */
export function EmptyState(props: EmptyStateProps) {
  const { onQuestionClick } = props

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      {/* 欢迎图标 */}
      <div className="mb-6 relative">
        <div className="size-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <MessageSquareIcon className="size-10 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 size-6 rounded-full bg-yellow-400 flex items-center justify-center shadow-md animate-pulse">
          <SparklesIcon className="size-3.5 text-yellow-900" />
        </div>
      </div>

      {/* 欢迎文本 */}
      <h2 className="text-2xl font-bold mb-2 text-center">
        法律法规智能问答助手
      </h2>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        基于法律法规知识库，为您提供专业的合规咨询服务。
        您可以询问关于网络安全法、个人信息保护、等级保护等方面的问题。
      </p>

      {/* 推荐问题 */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">
            推荐问题
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {suggestedQuestions.map((question) => {
            return (
              <Button
                key={question.id}
                className="h-auto py-3 px-4 text-left justify-start whitespace-normal"
                variant="outline"
                onClick={() => {
                  onQuestionClick(question.text)
                }}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  {question.category && (
                    <span className="text-xs text-muted-foreground">
                      {question.category}
                    </span>
                  )}
                  <span className="text-sm font-normal">
                    {question.text}
                  </span>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* 使用提示 */}
      <div className="mt-8 text-xs text-muted-foreground text-center max-w-md">
        <p>
          💡 提示：这是一个演示原型，使用预设数据模拟 AI 回复。
          实际系统将接入真实的 AI 模型和法规知识库。
        </p>
      </div>
    </div>
  )
}

