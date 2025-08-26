'use client'

import { useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { SearchIcon, XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import type { OrganizationId } from '~/lib/api/types'
import { cn } from '~/lib/utils'

import { useDepartmentTreeStore } from './stores/useDepartmentTreeStore'
import type { DepartmentTreeNode } from './types'

interface DepartmentTreeSearchProps {
  /** 组织 ID */
  orgId: OrganizationId
  /** 原始树形数据 */
  treeData: DepartmentTreeNode[]
  /** 搜索框占位符文本 */
  placeholder?: string
  /** 自定义样式类名 */
  className?: string
}

/**
 * 部门树搜索组件
 */
export function DepartmentTreeSearch(props: DepartmentTreeSearchProps) {
  const {
    orgId,
    placeholder = '搜索部门...',
    className,
  } = props

  // 本地搜索输入状态
  const [inputValue, setInputValue] = useState('')

  const { searchKeyword, setSearchKeyword } = useDepartmentTreeStore(orgId)

  /**
   * 处理搜索输入变化
   */
  const handleInputChange = useEvent(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const value = ev.target.value
      setInputValue(value)
    },
  )

  /**
   * 处理搜索提交
   */
  const handleSearch = useEvent(() => {
    setSearchKeyword(inputValue.trim())
  })

  /**
   * 处理清空搜索
   */
  const handleClear = useEvent(() => {
    setInputValue('')
    setSearchKeyword('')
  })

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useEvent(
    (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        handleSearch()
      }
      else if (ev.key === 'Escape') {
        ev.preventDefault()
        handleClear()
      }
    },
  )

  // 同步 store 中的搜索关键词到本地输入状态
  useEffect(() => {
    if (searchKeyword) {
      setInputValue(searchKeyword)
    }
  }, [searchKeyword])

  // 实时搜索：当输入值变化时自动触发搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchKeyword) {
        setSearchKeyword(inputValue.trim())
      }
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [inputValue, searchKeyword, setSearchKeyword])

  return (
    <div className={cn('relative flex-1', className)}>
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />

      <Input
        className="pl-9 pr-9"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />

      {/* 清空按钮 */}
      {inputValue && (
        <Button
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
          size="iconSm"
          variant="ghost"
          onClick={handleClear}
        >
          <XIcon className="!size-3.5" />
          <span className="sr-only">清空搜索</span>
        </Button>
      )}
    </div>
  )
}
