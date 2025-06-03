'use client'

import { useEffect, useState } from 'react'

import { cn } from '~/lib/utils'

interface ReadingProgressProps {
  className?: string
}

export function ReadingProgress({ className }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article')

      if (!article) {
        return
      }

      const articleRect = article.getBoundingClientRect()
      const articleTop = articleRect.top + window.scrollY
      const articleHeight = articleRect.height
      const windowHeight = window.innerHeight
      const scrollTop = window.scrollY

      // 计算阅读进度
      const startReading = articleTop
      const finishReading = articleTop + articleHeight - windowHeight

      if (scrollTop <= startReading) {
        setProgress(0)
      }
      else if (scrollTop >= finishReading) {
        setProgress(100)
      }
      else {
        const progressPercentage
         = ((scrollTop - startReading) / (finishReading - startReading)) * 100
        setProgress(Math.min(100, Math.max(0, progressPercentage)))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初始化时执行一次

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-50 h-1 bg-muted', className)}>
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
