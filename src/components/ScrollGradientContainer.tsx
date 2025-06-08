'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { cn } from '~/lib/utils'

interface ScrollGradientContainerProps {
  className?: string
  gradientHeight?: string
  gradientFromColor?: string
  topGradientClass?: string
  bottomGradientClass?: string
}

export function ScrollGradientContainer(
  props: React.PropsWithChildren<ScrollGradientContainerProps>,
) {
  const {
    children,
    className,
    gradientHeight = 'h-10',
    gradientFromColor = 'from-background',
    topGradientClass,
    bottomGradientClass,
  } = props

  const scrollRef = useRef<HTMLDivElement>(null)

  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
  })

  const handleScroll = useEvent(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const canScrollUp = scrollTop > 0
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 1

      setScrollState({ canScrollUp, canScrollDown })
    }
  })

  useEffect(() => {
    const scrollElement = scrollRef.current

    if (scrollElement) {
      // 初始检查
      handleScroll()

      scrollElement.addEventListener('scroll', handleScroll)

      // 监听容器本身的尺寸变化
      const resizeObserver = new ResizeObserver(handleScroll)
      resizeObserver.observe(scrollElement)

      // 监听内容变化（DOM 节点增删、属性变化等）
      const mutationObserver = new MutationObserver(handleScroll)
      mutationObserver.observe(scrollElement, {
        childList: true, // 监听子节点的增加和删除
        subtree: true, // 监听所有后代节点
        attributes: true, // 监听属性变化
        characterData: true, // 监听文本内容变化
      })

      return () => {
        scrollElement.removeEventListener('scroll', handleScroll)
        resizeObserver.disconnect()
        mutationObserver.disconnect()
      }
    }
  }, [handleScroll])

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* 顶部渐变遮罩 */}
      {scrollState.canScrollUp && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 z-10 pointer-events-none',
            'bg-gradient-to-b to-transparent',
            gradientHeight,
            gradientFromColor,
            topGradientClass,
          )}
        />
      )}

      {/* 底部渐变遮罩 */}
      {scrollState.canScrollDown && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 z-10 pointer-events-none',
            'bg-gradient-to-t to-transparent',
            gradientHeight,
            gradientFromColor,
            bottomGradientClass,
          )}
        />
      )}

      <div ref={scrollRef} className={cn('overflow-y-auto h-full', className)}>
        {children}
      </div>
    </div>
  )
}
