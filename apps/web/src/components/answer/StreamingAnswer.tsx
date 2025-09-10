'use client'

import { useEffect, useState } from 'react'

import { LoaderIcon } from 'lucide-react'

interface StreamingAnswerProps {
  content: string
  isLoading: boolean
  isStreaming?: boolean
}

export function StreamingAnswer({ content, isLoading, isStreaming = false }: StreamingAnswerProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  // 重置内容时重置状态
  useEffect(() => {
    if (content !== displayedContent && !isStreaming) {
      setDisplayedContent(content)
      setCurrentIndex(content.length)
    }
  }, [content, displayedContent, isStreaming])

  // 流式显示效果
  useEffect(() => {
    if (isStreaming && currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1))
        setCurrentIndex((prev) => prev + 1)
      }, 30) // 30ms per character for smooth typing effect

      return () => {
        clearTimeout(timer)
      }
    }
    else if (!isStreaming) {
      setDisplayedContent(content)
      setCurrentIndex(content.length)
    }
  }, [content, currentIndex, isStreaming])

  if (isLoading && !displayedContent) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderIcon className="size-4 animate-spin" />
        正在思考...
      </div>
    )
  }

  return (
    <div className="text-sm whitespace-pre-wrap">
      {displayedContent}
      {isStreaming && currentIndex < content.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  )
}
