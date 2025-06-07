import { ClockIcon, SearchIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import type { SearchHistoryItem } from '~/hooks/useSearchHistory'

interface SearchHistoryProps {
  history: SearchHistoryItem[]
  onSelectTerm: (term: string) => void
  onClearHistory: () => void
}

export function SearchHistory({
  history,
  onSelectTerm,
  onClearHistory,
}: SearchHistoryProps) {
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

        <Button
          className="text-xs"
          size="sm"
          variant="ghost"
          onClick={onClearHistory}
        >
          清除
        </Button>
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
