import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useRouter } from 'next/navigation'
import { ArrowDownIcon, ArrowUpIcon, CornerDownLeftIcon, SearchIcon, XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { KeyboardKey } from '~/components/ui/kbd'

import type { SearchResult } from './SearchResults'
import { SearchResults } from './SearchResults'

interface SearchDialogContentProps {
  onClose: () => void
}

export function SearchDialogContent({ onClose }: SearchDialogContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [resultCount, setResultCount] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isComposing, setIsComposing] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const handleInputChange = useEvent((ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value
    setSearchTerm(value)

    // 只有在非输入法组合状态下才触发搜索
    if (!isComposing) {
      setSelectedIndex(0)
    }
  })

  const handleCompositionStart = useEvent(() => {
    setIsComposing(true)
  })

  const handleCompositionEnd = useEvent(() => {
    setIsComposing(false)
    setSelectedIndex(0)
  })

  const handleSelectResult = useEvent((url: string) => {
    // 处理不同类型的 URL
    if (!url) {
      return
    }

    // 清理 URL，移除多余的斜杠
    const cleanUrl = url.replace(/\/+/g, '/')

    try {
      // 尝试解析为完整 URL
      const urlObj = new URL(cleanUrl, window.location.origin)

      // 检查是否为外部链接
      if (urlObj.origin !== window.location.origin) {
        // 外部链接在新标签页打开
        window.open(cleanUrl, '_blank', 'noopener,noreferrer')
        onClose()

        return
      }

      // 内部链接使用 Next.js 路由进行无刷新跳转
      const pathname = urlObj.pathname + urlObj.search + urlObj.hash
      router.push(pathname)
      onClose()
    }
    catch {
      // 如果 URL 解析失败，尝试作为相对路径处理
      if (cleanUrl.startsWith('/docs/')) {
        // 已经包含 /docs 前缀的路径
        router.push(cleanUrl)
        onClose()
      }
      else if (cleanUrl.startsWith('/')) {
        // 绝对路径但不包含 /docs 前缀
        router.push(cleanUrl)
        onClose()
      }
      else if (cleanUrl.startsWith('#')) {
        // 页面内锚点跳转
        const element = document.getElementById(cleanUrl.slice(1))

        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }

        onClose()
      }
      else {
        // 相对路径，添加 /docs 前缀
        const docsUrl = `/docs/${cleanUrl.replace(/^\/+/, '')}`
        router.push(docsUrl)
        onClose()
      }
    }
  })

  const handleKeyDown = useEvent((ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Escape') {
      onClose()
    }
    else if (ev.key === 'ArrowDown') {
      ev.preventDefault()
      setSelectedIndex((prev) => Math.min(resultCount - 1, prev + 1))
    }
    else if (ev.key === 'ArrowUp') {
      ev.preventDefault()
      setSelectedIndex((prev) => Math.max(0, prev - 1))
    }
    else if (ev.key === 'Enter' && resultCount > 0 && searchResults.length > 0) {
      ev.preventDefault()
      // 触发选中项的点击事件
      const selectedResult = searchResults[selectedIndex]

      if (selectedResult.document?.path) {
        handleSelectResult(selectedResult.document.path)
      }
    }
  })

  const handleClearSearch = useEvent(() => {
    setSearchTerm('')
    setSelectedIndex(0)
    setResultCount(0)
    setSearchResults([])

    inputRef.current?.focus()
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DialogHeader className="border-b border-border">
        <DialogTitle>
          <div className="relative flex items-center gap-3 px-3 h-12">
            <SearchIcon className="size-4 shrink-0" />

            <input
              ref={inputRef}
              className="flex-1 !outline-none font-normal text-sm !border-none shadow-none focus-visible:outline-none placeholder:text-muted-foreground"
              placeholder="你想搜索什么？"
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onCompositionEnd={handleCompositionEnd}
              onCompositionStart={handleCompositionStart}
              onKeyDown={handleKeyDown}
            />

            {!!searchTerm && (
              <Button
                className="size-7"
                size="icon"
                variant="ghost"
                onClick={() => {
                  handleClearSearch()
                }}
              >
                <XIcon className="size-4" />
              </Button>
            )}
          </div>
        </DialogTitle>

        <DialogDescription className="sr-only">
          搜索 NestJS 中文文档内容，使用上下箭头键导航结果，回车键选择，ESC 键关闭
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto">
        <SearchResults
          searchTerm={searchTerm}
          selectedIndex={selectedIndex}
          onResultsChange={setSearchResults}
          onResultsUpdate={setResultCount}
          onSelectResult={handleSelectResult}
          onSelectedIndexChange={setSelectedIndex}
        />
      </div>

      <div className="border-t border-border px-6 py-3 bg-muted/40">
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <KeyboardKey>
              <ArrowUpIcon className="size-3" />
              <ArrowDownIcon className="size-3" />
            </KeyboardKey>
            <span>导航</span>
          </div>

          <div className="flex items-center gap-1">
            <KeyboardKey>
              <CornerDownLeftIcon className="size-3" />
            </KeyboardKey>
            <span>选择</span>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <KeyboardKey>
              <span>Esc</span>
            </KeyboardKey>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </div>
  )
}
