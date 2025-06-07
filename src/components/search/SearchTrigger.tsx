'use client'

import { useEffect, useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { CommandIcon, SearchIcon } from 'lucide-react'

import { KeyboardKey } from '~/components/ui/kbd'
import { isMacOS } from '~/utils/platform'

interface SearchTriggerProps {
  onTriggerOpen?: () => void
}

export function SearchTrigger(props: SearchTriggerProps) {
  const { onTriggerOpen } = props

  const isMac = useMemo(() => isMacOS(), [])

  const handleTriggerOpen = useEvent(() => {
    onTriggerOpen?.()
  })

  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key === 'k') {
        ev.preventDefault()

        handleTriggerOpen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleTriggerOpen])

  return (
    <button
      className="group flex w-full items-center gap-3 rounded-lg border border-input bg-background px-3 py-1 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
      onClick={() => {
        handleTriggerOpen()
      }}
    >
      <div className="flex items-center shrink-0 justify-center">
        <SearchIcon className="size-3.5" />
      </div>

      <span className="flex-1 text-xs text-left">搜索文档...</span>

      <div className="flex items-center gap-1">
        <KeyboardKey>
          {isMac
            ? (
                <CommandIcon className="size-2.5" />
              )
            : (
                'Ctrl'
              )}
        </KeyboardKey>

        <KeyboardKey>
          K
        </KeyboardKey>
      </div>
    </button>
  )
}
