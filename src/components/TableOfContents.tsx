'use client'

import { useTableOfContents } from '~/hooks/useTableOfContents'
import { cn } from '~/lib/utils'

interface TableOfContentsProps {
  className?: string
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const { tocItems, activeId } = useTableOfContents()

  if (tocItems.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2 text-sm', className)}>
      <h4 className="font-semibold mb-3 truncate">目录</h4>

      <nav className="space-y-2">
        {tocItems.map((item) => (
          <a
            key={item.id}
            className={cn(
              'block w-full text-left transition-colors duration-200 hover:text-foreground truncate',
              {
                'text-foreground': activeId === item.id,
                'text-muted-foreground': activeId !== item.id,
                'pl-2 text-[0.9em]': item.level === 2,
                'pl-4 text-[0.8em]': item.level === 3,
              },
            )}
            href={`#${item.id}`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
