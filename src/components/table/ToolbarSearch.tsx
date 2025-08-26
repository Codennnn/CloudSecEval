'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { SearchIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

export interface ToolbarSearchProps {
  /** 当前的全局搜索值（受控） */
  value?: string
  /** 提交搜索回调（会在防抖延迟后触发） */
  onCommit?: (value: string) => void
  /** 防抖时间（毫秒） */
  debounceMs?: number
  /** 输入框属性 */
  inputProps?: Omit<React.ComponentProps<'input'>, 'value'>
}

/**
 * 工具栏全局搜索组件
 * - 仅图标按钮触发；打开后隐藏按钮，仅展示输入框
 * - 停止输入 N ms 后自动提交（防抖）
 * - Esc 清空搜索并关闭输入框
 * - 失焦时若输入为空则关闭输入框
 */
export function ToolbarSearch(props: ToolbarSearchProps) {
  const {
    value,
    onCommit,
    debounceMs = 450,
    inputProps,
  } = props

  const [isActive, setIsActive] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<number | null>(null)

  /**
   * 打开输入框并同步当前外部值
   */
  const handleOpen = useEvent(() => {
    setIsActive(true)
    setInputValue(typeof value === 'string' ? value : '')
  })

  /**
   * 安排一次防抖提交
   */
  const scheduleCommit = useEvent((next: string) => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    const timer = window.setTimeout(() => {
      onCommit?.(next)
    }, debounceMs)

    debounceTimerRef.current = timer
  })

  /**
   * 输入变化：更新本地状态并安排提交
   */
  const handleChange = useEvent((ev: React.ChangeEvent<HTMLInputElement>) => {
    const next = ev.target.value
    setInputValue(next)
    scheduleCommit(next)
  })

  const handleKeyDown = useEvent((ev: React.KeyboardEvent<HTMLInputElement>) => {
    // 键盘交互：Esc 清空并关闭
    if (ev.key === 'Escape') {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      setInputValue('')
      onCommit?.('')
      setIsActive(false)
    }
  })

  const handleBlur = useEvent(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    if (inputValue === '') {
      setIsActive(false)
    }
  })

  // 打开时自动聚焦并与受控值对齐
  useEffect(() => {
    if (isActive) {
      const current = typeof value === 'string' ? value : ''

      if (current !== inputValue) {
        setInputValue(current)
      }

      window.setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 0)
    }
  }, [isActive, value, inputValue])

  // 卸载清理
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [])

  return (
    <>
      {!isActive && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="打开搜索"
              size="sm"
              variant={value ? 'secondary' : 'ghost'}
              onClick={handleOpen}
            >
              <SearchIcon />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            搜索
          </TooltipContent>
        </Tooltip>
      )}

      {isActive && (
        <Input
          placeholder="搜索"
          {...inputProps}
          ref={inputRef}
          className={cn('h-8 w-[240px]', inputProps?.className)}
          value={inputValue}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      )}
    </>
  )
}
