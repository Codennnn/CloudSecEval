import { useEffect, useState } from 'react'

import { useSearch } from '@oramacloud/react-client'
import { FileTextIcon, SearchIcon } from 'lucide-react'

import { Skeleton } from '~/components/ui/skeleton'

import { SearchResultItem } from './SearchResultItem'

export interface SearchResult {
  id: string
  document?: {
    path?: string
    title?: string
    heading?: string
    content?: string
    section?: string
  }
}

interface SearchResultsProps {
  searchTerm: string
  selectedIndex: number
  onResultsUpdate: (count: number) => void
  onSelectResult: (url: string) => void
  onResultsChange: (results: SearchResult[]) => void
}

export function SearchResults(props: SearchResultsProps) {
  const { searchTerm, selectedIndex, onResultsUpdate, onSelectResult, onResultsChange } = props

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
      <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
        <SearchIcon className="mb-4 size-12" />
        <p className="text-lg font-medium">开始搜索 NestJS 文档</p>
        <p className="text-sm mt-1">输入关键词查找相关内容</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="size-8 shrink-0" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!results?.hits.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
        <FileTextIcon className="mb-4 size-12" />
        <p className="text-lg font-medium">未找到相关内容</p>
        <p className="text-sm mt-1">
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
            if (hit.document?.path) {
              onSelectResult(hit.document.path)
            }
          }}
        />
      ))}
    </div>
  )
}
