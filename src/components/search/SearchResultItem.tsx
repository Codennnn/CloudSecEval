import { useEffect, useRef } from 'react'

import { BookOpenIcon } from 'lucide-react'

import { cn } from '~/lib/utils'

import type { SearchResult } from './SearchResults'

interface SearchResultItemProps {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
}

export function SearchResultItem(props: SearchResultItemProps) {
  const { result, isSelected, onClick } = props
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
      </div>
    </button>
  )
}
