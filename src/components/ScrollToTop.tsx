'use client'

import { useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { CircleChevronUp } from 'lucide-react'

import { Button } from '~/components/ui/button'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // 查找滚动容器
      const scrollContainer = document.getElementById('docs-scroll-container')

      if (scrollContainer && scrollContainer.scrollTop > 300) {
        setIsVisible(true)
      }
      else {
        setIsVisible(false)
      }
    }

    // 查找滚动容器并添加事件监听
    const scrollContainer = document.getElementById('docs-scroll-container')

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', toggleVisibility)

      return () => {
        scrollContainer.removeEventListener('scroll', toggleVisibility)
      }
    }
  }, [])

  const handleScrollToTop = useEvent(() => {
    const scrollContainer = document.getElementById('docs-scroll-container')

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  })

  if (!isVisible) {
    return null
  }

  return (
    <Button
      className="inline-flex items-center gap-2 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2 justify-start text-xs text-muted-foreground"
      size="sm"
      title="回到顶部"
      variant="ghost"
      onClick={() => {
        handleScrollToTop()
      }}
    >
      回到顶部
      <CircleChevronUp className="size-3.5" />
    </Button>
  )
}
