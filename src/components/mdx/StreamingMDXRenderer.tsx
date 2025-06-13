'use client'

import { useEffect, useState } from 'react'

import { DynamicMDXRenderer } from './DynamicMDXRenderer'

export interface StreamingMDXRendererProps {
  /** 流式内容 */
  streamingContent: string
  /** 防抖延迟（毫秒），默认 300ms */
  debounceDelay?: number
  /** 是否实时渲染（关闭防抖） */
  realtime?: boolean
  /** 其他传递给 DynamicMDXRenderer 的属性 */
  rendererProps?: Omit<
    React.ComponentProps<typeof DynamicMDXRenderer>,
    'content'
  >
}

/**
 * 防抖函数
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 流式 MDX 渲染组件
 *
 * 专门处理流式内容的 MDX 渲染，包含防抖优化和渲染策略
 */
export function StreamingMDXRenderer({
  streamingContent,
  debounceDelay = 300,
  realtime = false,
  rendererProps = {},
}: StreamingMDXRendererProps) {
  // 防抖处理的内容
  const debouncedContent = useDebounce(streamingContent, debounceDelay)

  // 确定要渲染的内容
  const contentToRender = realtime ? streamingContent : debouncedContent

  return (
    <DynamicMDXRenderer
      content={contentToRender}
      {...rendererProps}
    />
  )
}
