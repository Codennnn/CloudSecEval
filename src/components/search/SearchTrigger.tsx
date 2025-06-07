import { CommandIcon, SearchIcon } from 'lucide-react'

import { KeyboardKey } from '../ui/kbd'

interface SearchTriggerProps {
  onClick: () => void
}

export function SearchTrigger(props: SearchTriggerProps) {
  const { onClick } = props

  return (
    <button
      className="group flex w-full items-center gap-3 rounded-lg border border-input bg-background px-3 py-1 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
      onClick={() => {
        onClick()
      }}
    >
      <div className="flex items-center shrink-0 justify-center">
        <SearchIcon className="size-3.5" />
      </div>

      <span className="flex-1 text-xs text-left">搜索文档...</span>

      <div className="flex items-center gap-1">
        <KeyboardKey>
          <CommandIcon className="size-2.5" />
        </KeyboardKey>

        <KeyboardKey>
          K
        </KeyboardKey>
      </div>
    </button>
  )
}
