import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import type { TableOfContentsHook, TocItem } from '~/types/toc'

export function useTableOfContents(): TableOfContentsHook {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const pathname = usePathname()

  // 提取页面中的标题元素
  useEffect(() => {
    const extractHeadings = () => {
      const headings = document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6')
      const items: TocItem[] = []

      headings.forEach((heading) => {
        const id = heading.id
        const text = heading.textContent ?? ''
        const level = parseInt(heading.tagName.charAt(1))

        if (id && text) {
          items.push({ id, text, level })
        }
      })

      setTocItems(items)
    }

    // 重置状态
    setTocItems([])
    setActiveId('')

    // 延迟执行以确保 MDX 内容已渲染
    const timer = setTimeout(extractHeadings, 100)

    // 监听 DOM 变化，以防内容动态加载
    const observer = new MutationObserver(extractHeadings)
    const articleElement = document.querySelector('article')

    if (articleElement) {
      observer.observe(articleElement, {
        childList: true,
        subtree: true,
      })
    }

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname]) // 添加 pathname 依赖，确保路由变化时重新执行

  // 监听滚动，高亮当前章节
  useEffect(() => {
    if (tocItems.length === 0) {
      return
    }

    const handleScroll = () => {
      const headings = document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6')
      const scrollTop = window.scrollY + 100 // 添加偏移量

      let currentId = ''

      // 从上到下遍历标题，找到当前可见的标题
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        const elementTop = rect.top + window.scrollY

        if (elementTop <= scrollTop) {
          currentId = heading.id
        }
      })

      setActiveId(currentId)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初始化时执行一次

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [tocItems])

  return {
    tocItems,
    activeId,
  }
}
