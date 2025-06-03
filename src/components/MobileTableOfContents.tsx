'use client'

import { useState } from 'react'

import { Icon } from '@iconify/react'

import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { useTableOfContents } from '~/hooks/useTableOfContents'
import { cn } from '~/lib/utils'

export function MobileTableOfContents() {
  const { tocItems, activeId } = useTableOfContents()
  const [isOpen, setIsOpen] = useState(false)

  const handleItemClick = (id: string) => {
    setIsOpen(false) // 点击后关闭弹层
  }

  if (tocItems.length === 0) {
    return null
  }

  return (
    <div className="xl:hidden fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            aria-label="打开目录"
            className="h-12 w-12 rounded-full shadow-lg"
            size="icon"
          >
            <Icon className="h-5 w-5" icon="lucide:list" />
          </Button>
        </SheetTrigger>

        <SheetContent className="w-80" side="right">
          <SheetHeader>
            <SheetTitle>目录</SheetTitle>
          </SheetHeader>

          <nav className="mt-6 space-y-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                className={cn(
                  'block w-full text-left text-sm transition-colors duration-200 hover:text-foreground',
                  'py-2 px-3 rounded-md hover:bg-muted/50 border-l-2 border-transparent',
                  {
                    'text-primary font-medium bg-muted border-l-primary': activeId === item.id,
                    'text-muted-foreground': activeId !== item.id,
                    'pl-3': item.level === 1,
                    'pl-5': item.level === 2,
                    'pl-7': item.level === 3,
                    'pl-9': item.level === 4,
                    'pl-11': item.level === 5,
                    'pl-13': item.level === 6,
                  },
                )}
                onClick={() => { handleItemClick(item.id) }}
              >
                <span className="line-clamp-2">{item.text}</span>
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
