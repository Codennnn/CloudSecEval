'use client'

import { useState } from 'react'

import type { Metadata } from 'next'

import { ChatContainer } from './components/ChatContainer'
import { ChatInput } from './components/ChatInput'
import { simulateAIResponse } from './lib/qa-simulator'
import type { Message } from './types'

import { CloudSecEvalRoutes, generatePageTitle } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

/**
 * 智能问答咨询页面
 * 用户提出问题，系统提供智能问答服务
 */
export default function IntelligentQAPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [typingMessage, setTypingMessage] = useState('')

  /**
   * 处理发送消息
   */
  const handleSendMessage = async (content: string) => {
    // 1. 添加用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setMessages((prev) => {
      return [...prev, userMessage]
    })

    // 2. 开始加载 AI 回复
    setIsLoading(true)
    setTypingMessage('')

    try {
      // 3. 模拟 AI 回复（带打字机效果）
      const fullAnswer = await simulateAIResponse(content, (partialAnswer) => {
        setTypingMessage(partialAnswer)
      })

      // 4. 添加完整的 AI 消息
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fullAnswer,
        timestamp: Date.now(),
      }

      setMessages((prev) => {
        return [...prev, assistantMessage]
      })
    }
    catch (error) {
      console.error('AI 回复失败:', error)

      // 添加错误消息
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，处理您的问题时出现了错误。请稍后重试。',
        timestamp: Date.now(),
      }

      setMessages((prev) => {
        return [...prev, errorMessage]
      })
    }
    finally {
      setIsLoading(false)
      setTypingMessage('')
    }
  }

  /**
   * 处理点击推荐问题
   */
  const handleQuestionClick = (question: string) => {
    handleSendMessage(question)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 聊天容器 */}
      <ChatContainer
        isLoading={isLoading}
        messages={messages}
        typingMessage={typingMessage}
        onQuestionClick={handleQuestionClick}
      />

      {/* 输入框 */}
      <ChatInput
        disabled={isLoading}
        placeholder="请输入您关于法律法规的问题..."
        onSend={handleSendMessage}
      />
    </div>
  )
}
