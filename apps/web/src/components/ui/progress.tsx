'use client'

import type * as React from 'react'

import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '~/lib/utils'

/**
 * Progress 组件属性接口
 */
interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  /** 进度条指示器的自定义类名 */
  indicatorClassName?: string
}

/**
 * Progress 进度条组件
 * 支持自定义指示器样式
 */
function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      data-slot="progress"
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'bg-primary h-full w-full flex-1 transition-all',
          indicatorClassName,
        )}
        data-slot="progress-indicator"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
