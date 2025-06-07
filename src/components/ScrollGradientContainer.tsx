'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '~/lib/utils'

interface ScrollGradientContainerProps {
  children: React.ReactNode
  className?: string
  gradientHeight?: string
  gradientFromColor?: string
  topGradientClass?: string
  bottomGradientClass?: string
}

export function ScrollGradientContainer(props: ScrollGradientContainerProps) {
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

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) { return }

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const canScrollUp = scrollTop > 0
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 1

      setScrollState({ canScrollUp, canScrollDown })
    }

    const scrollElement = scrollRef.current

    if (scrollElement) {
      // 初始检查
      handleScroll()

      scrollElement.addEventListener('scroll', handleScroll)

      // 监听内容变化，比如菜单项展开/收起时重新检查
      const resizeObserver = new ResizeObserver(handleScroll)
      resizeObserver.observe(scrollElement)

      return () => {
        scrollElement.removeEventListener('scroll', handleScroll)
        resizeObserver.disconnect()
      }
    }
  }, [])

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

      <div ref={scrollRef} className={`overflow-y-auto h-full ${className}`}>
        {children}
      </div>
    </div>
  )
}
