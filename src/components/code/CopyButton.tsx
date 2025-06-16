'use client'

import { useState } from 'react'

import { CheckIcon, CopyIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton(props: CopyButtonProps) {
  const { text, className } = props

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1000)
    }
    catch (err) {
      console.error('复制失败:', err)
    }
  }

  const shouldOpen = copied ? true : undefined

  return (
    <Tooltip open={shouldOpen}>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            'size-6 rounded-md hover:bg-background dark:hover:bg-background/20',
            'group-hover/code-block:opacity-100 opacity-0 transition-opacity duration-200',
            shouldOpen && 'opacity-100',
            className,
          )}
          size="icon"
          variant="ghost"
          onClick={() => {
            void handleCopy()
          }}
        >
          {copied
            ? (
                <CheckIcon className="size-[1em] text-green-500" strokeWidth={3} />
              )
            : (
                <CopyIcon className="size-[1em]" />
              )}
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        {copied ? '已复制' : '复制代码'}
      </TooltipContent>
    </Tooltip>
  )
}
