import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

import { cn } from '~/lib/utils'
import { getDocLinkHref } from '~/utils/link'

interface DocNavigationProps {
  prev: { title: string, url: string } | null
  next: { title: string, url: string } | null
  className?: string
}

export function DocNavigation({ prev, next, className }: DocNavigationProps) {
  if (!prev && !next) {
    return null
  }

  return (
    <nav className={cn('flex items-center gap-4 pt-8 mt-8 border-t border-border', className)}>
      <div className="basis-1/2 grow-0 min-w-0">
        {prev && (
          <Link
            className={cn(
              'group inline-flex items-center gap-2 p-2 rounded-lg text-sm max-w-full',
              'hover:bg-muted/50 transition-colors',
            )}
            href={getDocLinkHref(prev.url)}
          >
            <div className="flex items-center gap-2 w-full text-muted-foreground group-hover:text-foreground transition-colors">
              <ArrowLeftIcon className="size-4 shrink-0" />
              <div className="font-medium truncate leading-none">
                {prev.title}
              </div>
            </div>
          </Link>
        )}
      </div>

      <div className="basis-1/2 grow-0 min-w-0 flex justify-end">
        {next && (
          <Link
            className={cn(
              'group inline-flex items-center gap-2 p-2 rounded-lg text-sm max-w-full',
              'hover:bg-muted/50 transition-colors',
            )}
            href={getDocLinkHref(next.url)}
          >
            <div className="flex items-center gap-2 w-full text-muted-foreground group-hover:text-foreground transition-colors">
              <div className="font-medium truncate leading-none">
                {next.title}
              </div>
              <ArrowRightIcon className="size-4 shrink-0" />
            </div>
          </Link>
        )}
      </div>
    </nav>
  )
}
