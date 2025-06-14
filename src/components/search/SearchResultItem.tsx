import { useEffect, useMemo, useRef } from 'react'

import { BookOpenIcon, FileTextIcon, MapPinIcon } from 'lucide-react'

import { formatDocumentPath } from '~/lib/search-utils'
import { cn } from '~/lib/utils'
import type { SearchResult } from '~/types/doc'

interface SearchResultItemProps {
  result: SearchResult
  isSelected: boolean
  searchTerm: string

  highlightText: (text: string, searchTerm: string) => string
  onClick: () => void
  onMouseEnter: () => void
}

export function SearchResultItem(props: SearchResultItemProps) {
  const { result, isSelected, searchTerm, highlightText, onClick, onMouseEnter } = props

  const { document } = result

  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [isSelected])

  // 获取高亮显示的标题
  const getHighlightedTitle = () => {
    const title = document?.title ?? document?.heading ?? '无标题'

    return highlightText(title, searchTerm)
  }

  // 获取高亮显示的内容
  const getHighlightedContent = () => {
    if (!document?.content) {
      return ''
    }

    return highlightText(document.content, searchTerm)
  }

  // 获取文档路径显示
  const documentPath = useMemo(() => {
    if (document?.path) {
      return formatDocumentPath(document.path)
    }
  }, [document?.path])

  return (
    <button
      ref={ref}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all duration-150 hover:bg-accent/50',
        isSelected && 'bg-accent border-accent-foreground/20 shadow-sm ring-1 ring-accent-foreground/10',
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="mt-0.5 shrink-0 text-muted-foreground">
        {document?.section
          ? (
              <FileTextIcon className="size-4" />
            )
          : (
              <BookOpenIcon className="size-4" />
            )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div
          dangerouslySetInnerHTML={{ __html: getHighlightedTitle() }}
          className="font-medium text-sm leading-5 truncate"
        />

        {/* 内容预览 */}
        {!!document?.content && (
          <div
            dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
            className="text-muted-foreground text-xs leading-4 line-clamp-2"
          />
        )}

        {/* 文档路径 */}
        {!!documentPath && (
          <div className="text-xs text-muted-foreground/80 line-clamp-1 flex items-center gap-1">
            <MapPinIcon className="size-[1em]" />
            {documentPath}
          </div>
        )}
      </div>
    </button>
  )
}
