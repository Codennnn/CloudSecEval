'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'
import { OramaCloud, useSearch } from '@oramacloud/react-client'
import {
  BookOpenIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  SearchIcon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '~/components/ui/dialog'
import { cn } from '~/lib/utils'

interface SearchHistory {
  term: string
  timestamp: number
}

interface SearchResult {
  id: string
  document?: {
    url?: string
    title?: string
    heading?: string
    content?: string
    section?: string
  }
}

interface AdvancedSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 搜索历史管理
const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistory[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('doc-search-history')

    if (saved) {
      try {
        setHistory(JSON.parse(saved) as SearchHistory[])
      }
      catch {
        setHistory([])
      }
    }
  }, [])

  const addToHistory = useCallback((term: string) => {
    if (!term.trim()) {
      return
    }

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.term !== term)
      const newHistory = [
        { term, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 10) // 保留最近 10 条

      localStorage.setItem('doc-search-history', JSON.stringify(newHistory))

      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem('doc-search-history')
  }, [])

  return { history, addToHistory, clearHistory }
}

function SearchResultItem({
  result,
  isSelected,
  onClick,
}: {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
}) {
  const { document } = result
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [isSelected])

  return (
    <button
      ref={ref}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all duration-150',
        'hover:bg-accent hover:border-accent-foreground/20',
        isSelected && 'bg-accent border-accent-foreground/20 shadow-sm',
      )}
      onClick={onClick}
    >
      <BookOpenIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="font-medium text-sm leading-5 line-clamp-1">
          {document?.title ?? document?.heading ?? '无标题'}
        </div>
        {document?.content && (
          <div className="text-muted-foreground text-xs leading-4 line-clamp-2">
            {document.content}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs">
          {document?.section && (
            <span className="text-primary font-medium">
              {document.section}
            </span>
          )}
          <ChevronRightIcon className="size-3 text-muted-foreground" />
        </div>
      </div>
    </button>
  )
}

function SearchResults({
  searchTerm,
  selectedIndex,
  onResultsUpdate,
  onSelectResult,
  onResultsChange,
}: {
  searchTerm: string
  selectedIndex: number
  onResultsUpdate: (count: number) => void
  onSelectResult: (url: string) => void
  onResultsChange: (results: SearchResult[]) => void
}) {
  const { results } = useSearch({
    term: searchTerm,
    limit: 10,
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchTerm.trim()) {
      setLoading(true)
      const timer = setTimeout(() => {
        setLoading(false)
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [searchTerm])

  useEffect(() => {
    const hits = results?.hits ?? []
    onResultsUpdate(hits.length)
    onResultsChange(hits)
  }, [results, onResultsUpdate, onResultsChange])

  if (!searchTerm.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <SearchIcon className="mb-4 size-12 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg font-medium">开始搜索 NestJS 文档</p>
        <p className="text-muted-foreground/60 text-sm mt-1">输入关键词查找相关内容</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="bg-muted/60 h-4 w-4 rounded mt-1" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted/60 h-4 w-3/4 rounded" />
                <div className="bg-muted/40 h-3 w-full rounded" />
                <div className="bg-muted/40 h-3 w-2/3 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!results?.hits.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileTextIcon className="mb-4 size-12 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg font-medium">未找到相关内容</p>
        <p className="text-muted-foreground/60 text-sm mt-1">
          尝试使用不同的关键词或检查拼写
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {results.hits.map((hit: SearchResult, index: number) => (
        <SearchResultItem
          key={hit.id}
          isSelected={index === selectedIndex}
          result={hit}
          onClick={() => {
            if (hit.document?.url) {
              onSelectResult(hit.document.url)
            }
          }}
        />
      ))}
    </div>
  )
}

function SearchHistory({
  history,
  onSelectTerm,
  onClearHistory,
}: {
  history: SearchHistory[]
  onSelectTerm: (term: string) => void
  onClearHistory: () => void
}) {
  if (!history.length) {
    return null
  }

  return (
    <div className="border-t">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ClockIcon className="size-4" />
          最近搜索
        </div>
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={onClearHistory}
        >
          清除
        </button>
      </div>
      <div className="px-4 pb-2 space-y-1">
        {history.slice(0, 5).map((item, index) => (
          <button
            key={index}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent transition-colors"
            onClick={() => { onSelectTerm(item.term) }}
          >
            <SearchIcon className="size-3 text-muted-foreground" />
            <span className="flex-1 truncate">{item.term}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function SearchDialogContent({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [resultCount, setResultCount] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { history, addToHistory, clearHistory } = useSearchHistory()
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setSelectedIndex(0)

    if (term.trim()) {
      addToHistory(term)
    }
  }, [addToHistory])

  const handleSelectResult = useCallback((url: string) => {
    // 关闭搜索对话框
    onClose()

    // 处理不同类型的 URL
    if (!url) {
      return
    }

    try {
      const urlObj = new URL(url, window.location.origin)

      // 检查是否为外部链接
      if (urlObj.origin !== window.location.origin) {
        // 外部链接在新标签页打开
        window.open(url, '_blank', 'noopener,noreferrer')

        return
      }

      // 内部链接使用 Next.js 路由进行无刷新跳转
      const pathname = urlObj.pathname + urlObj.search + urlObj.hash
      router.push(pathname)
    }
    catch {
      // 如果 URL 解析失败，尝试作为相对路径处理
      if (url.startsWith('/')) {
        router.push(url)
      }
      else if (url.startsWith('#')) {
        // 页面内锚点跳转
        const element = document.getElementById(url.slice(1))

        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
      else {
        // 其他情况使用传统方式跳转
        window.location.href = url
      }
    }
  }, [onClose, router])

  const handleKeyDown = useCallback((ev: React.KeyboardEvent<HTMLInputElement>) => {
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

      if (selectedResult.document?.url) {
        handleSelectResult(selectedResult.document.url)
      }
    }
  }, [onClose, resultCount, searchResults, selectedIndex, handleSelectResult])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DialogHeader className="border-b">
        <div className="relative flex items-center gap-3 px-3 py-2 text-muted-foreground">
          <SearchIcon className="size-4 shrink-0" />

          <input
            ref={inputRef}
            className="flex-1 !outline-none text-sm !border-none shadow-none focus-visible:outline-none"
            placeholder="你想搜索什么？"
            type="text"
            value={searchTerm}
            onChange={(ev) => { handleSearch(ev.target.value) }}
            onKeyDown={handleKeyDown}
          />
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto">
        <SearchResults
          searchTerm={searchTerm}
          selectedIndex={selectedIndex}
          onResultsChange={setSearchResults}
          onResultsUpdate={setResultCount}
          onSelectResult={handleSelectResult}
        />

        {!searchTerm && (
          <SearchHistory
            history={history}
            onClearHistory={clearHistory}
            onSelectTerm={handleSearch}
          />
        )}
      </div>

      <div className="border-t px-6 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span>↑</span>
                <span>↓</span>
              </kbd>
              <span>导航</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span>↵</span>
              </kbd>
              <span>选择</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span>esc</span>
            </kbd>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SearchDialog({ open, onOpenChange }: AdvancedSearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <OramaCloud
          apiKey={process.env.NEXT_PUBLIC_ORAMA_API_KEY!}
          endpoint={process.env.NEXT_PUBLIC_ORAMA_ENDPOINT!}
        >
          <SearchDialogContent onClose={() => { onOpenChange(false) }} />
        </OramaCloud>
      </DialogContent>
    </Dialog>
  )
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="group flex w-full items-center gap-3 rounded-lg border border-input bg-background px-3 py-1 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
      onClick={onClick}
    >
      <div className="flex items-center shrink-0 justify-center">
        <SearchIcon className="size-3.5" />
      </div>

      <span className="flex-1 text-xs text-left">搜索文档...</span>

      <div className="flex items-center gap-1">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-sm">⌘</span>
          K
        </kbd>
      </div>
    </button>
  )
}
