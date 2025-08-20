/**
 * 部门树搜索组件
 * 提供搜索功能，支持按部门名称和备注进行过滤
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { SearchIcon, XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

import { useDepartmentTreeStore } from './stores/useDepartmentTreeStore'
import type { DepartmentTreeNode } from './types'

/**
 * 部门树搜索组件属性接口
 */
interface DepartmentTreeSearchProps {
  /** 组织 ID */
  orgId: string
  /** 原始树形数据 */
  treeData: DepartmentTreeNode[]
  /** 搜索框占位符文本 */
  placeholder?: string
  /** 自定义样式类名 */
  className?: string
}

/**
 * 部门树搜索组件
 * @param props - 组件属性
 * @returns JSX 元素
 */
export function DepartmentTreeSearch(props: DepartmentTreeSearchProps) {
  const {
    orgId,
    treeData,
    placeholder = '搜索部门...',
    className,
  } = props

  // 本地搜索输入状态
  const [inputValue, setInputValue] = useState('')

  // 从 store 中获取搜索状态和操作方法
  const { searchKeyword, setSearchKeyword } = useDepartmentTreeStore(orgId)

  /**
   * 处理搜索输入变化
   */
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value)
  }, [])

  /**
   * 处理搜索提交
   */
  const handleSearch = useCallback(() => {
    setSearchKeyword(inputValue.trim(), treeData)
  }, [inputValue, setSearchKeyword, treeData])

  /**
   * 处理清空搜索
   */
  const handleClear = useCallback(() => {
    setInputValue('')
    setSearchKeyword('', treeData)
  }, [setSearchKeyword, treeData])

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
    }
    else if (event.key === 'Escape') {
      event.preventDefault()
      handleClear()
    }
  }, [handleSearch, handleClear])

  // 同步 store 中的搜索关键词到本地输入状态
  useEffect(() => {
    if (searchKeyword !== inputValue) {
      setInputValue(searchKeyword)
    }
  }, [searchKeyword]) // 注意：这里不包含 inputValue，避免循环依赖

  // 实时搜索：当输入值变化时自动触发搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchKeyword) {
        setSearchKeyword(inputValue.trim(), treeData)
      }
    }, 300) // 300ms 防抖

    return () => {
      clearTimeout(timer)
    }
  }, [inputValue, searchKeyword, setSearchKeyword, treeData])

  return (
    <div className={`relative flex items-center gap-2 ${className || ''}`}>
      {/* 搜索输入框 */}
      <div className="relative flex-1">
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
            className="absolute right-1 top-1/2 transform -translate-y-1/2 size-7"
            size="icon"
            variant="ghost"
            onClick={handleClear}
          >
            <XIcon className="size-3" />
            <span className="sr-only">清空搜索</span>
          </Button>
        )}
      </div>

      {/* 搜索结果提示 */}
      {searchKeyword && (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          搜索: "{searchKeyword}"
        </div>
      )}
    </div>
  )
}
