'use client'

import { useEffect, useRef, useState } from 'react'

import { SendIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'

interface ChatInputProps {
  /** 发送消息的回调 */
  onSend: (message: string) => void
  /** 是否禁用输入（例如 AI 正在回复时） */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
}

/**
 * 聊天输入组件
 * 提供文本输入和发送功能
 */
export function ChatInput(props: ChatInputProps) {
  const {
    onSend,
    disabled = false,
    placeholder = '请输入您的问题...',
  } = props

  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * 处理发送消息
   */
  const handleSend = () => {
    const trimmedInput = input.trim()

    if (!trimmedInput || disabled) {
      return
    }

    onSend(trimmedInput)
    setInput('')

    // 重置文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /**
   * 自动调整文本框高度
   */
  useEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = 'auto'

    // 设置新高度，最大 200px
    const newHeight = Math.min(textarea.scrollHeight, 200)
    textarea.style.height = `${newHeight}px`
  }, [input])

  const canSend = input.trim().length > 0 && !disabled

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* 输入框 */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            className="min-h-[44px] max-h-[200px] resize-none pr-12"
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
            }}
            onKeyDown={handleKeyDown}
          />

          {/* 字符计数 */}
          {input.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {input.length}
            </div>
          )}
        </div>

        {/* 发送按钮 */}
        <Button
          className="h-[44px] px-4"
          disabled={!canSend}
          size="default"
          onClick={handleSend}
        >
          <SendIcon className="size-4" />
          <span className="ml-2">发送</span>
        </Button>
      </div>

      {/* 提示文本 */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        按 Enter 发送，Shift + Enter 换行
      </div>
    </div>
  )
}

