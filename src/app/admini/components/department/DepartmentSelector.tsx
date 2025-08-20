'use client'

import { useMemo } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

import { useDepartmentData } from './hooks/useDepartmentData'
import type { DepartmentTreeNode } from './types'

// ==================== 类型定义 ====================

export interface DepartmentOption {
  value: string
  label: string
  level: number
}

export interface DepartmentSelectorProps {
  /** 组织 ID */
  orgId: string
  /** 当前选中的部门 ID */
  value?: string
  /** 选择变化回调 */
  onValueChange?: (value: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 需要排除的部门 ID（通常是当前正在编辑的部门） */
  excludeDepartmentId?: string
  /** 是否显示"无上级部门"选项 */
  showRootOption?: boolean
  /** "无上级部门"选项的标识值 */
  rootValue?: string
  /** "无上级部门"选项的显示文本 */
  rootLabel?: string
  /** 自定义样式类名 */
  className?: string
}

// ==================== 工具函数 ====================

/**
 * 过滤可选父部门列表
 * 编辑模式下，需要排除当前部门及其所有子部门
 */
const filterAvailableParents = (
  treeData: DepartmentTreeNode[],
  excludeDepartmentId?: string,
): DepartmentTreeNode[] => {
  if (!excludeDepartmentId) {
    return treeData
  }

  // 获取当前部门及其所有子部门的 ID 集合
  const getDescendantIds = (nodes: DepartmentTreeNode[]): Set<string> => {
    const ids = new Set<string>()

    const traverse = (nodeList: DepartmentTreeNode[]) => {
      for (const node of nodeList) {
        ids.add(node.id)

        if (node.children) {
          traverse(node.children)
        }
      }
    }

    traverse(nodes)

    return ids
  }

  // 找到当前部门节点
  const findCurrentNode = (nodes: DepartmentTreeNode[]): DepartmentTreeNode | undefined => {
    for (const node of nodes) {
      if (node.id === excludeDepartmentId) {
        return node
      }

      if (node.children) {
        const found = findCurrentNode(node.children)

        if (found) {
          return found
        }
      }
    }

    return undefined
  }

  const currentNode = findCurrentNode(treeData)

  if (!currentNode) {
    return treeData
  }

  // 获取需要排除的 ID 集合（当前部门及其所有子部门）
  const excludeIds = getDescendantIds([currentNode])

  // 递归过滤函数
  const filterNodes = (nodes: DepartmentTreeNode[]): DepartmentTreeNode[] => {
    return nodes
      .filter((node) => !excludeIds.has(node.id))
      .map((node) => ({
        ...node,
        children: node.children ? filterNodes(node.children) : undefined,
      }))
  }

  return filterNodes(treeData)
}

/**
 * 将树形数据转换为平铺的选项列表
 * 用于 Select 组件显示
 */
const flattenTreeToOptions = (
  treeData: DepartmentTreeNode[],
): DepartmentOption[] => {
  const options: DepartmentOption[] = []

  const traverse = (nodes: DepartmentTreeNode[], level = 0) => {
    for (const node of nodes) {
      options.push({
        value: node.id,
        label: node.name,
        level,
      })

      if (node.children) {
        traverse(node.children, level + 1)
      }
    }
  }

  traverse(treeData)

  return options
}

// ==================== 主组件 ====================

/**
 * 部门选择器组件
 *
 * 支持层级显示、排除指定部门、自定义根选项等功能
 */
export function DepartmentSelector(props: DepartmentSelectorProps) {
  const {
    orgId,
    value,
    onValueChange,
    disabled = false,
    placeholder = '请选择部门',
    excludeDepartmentId,
    showRootOption = true,
    rootValue = 'ROOT',
    rootLabel = '无（作为顶级部门）',
    className,
  } = props

  // 获取部门数据
  const { treeData, isLoading } = useDepartmentData({ orgId })

  // 过滤可选的父部门列表
  const availableParents = useMemo(() => {
    return filterAvailableParents(treeData, excludeDepartmentId)
  }, [treeData, excludeDepartmentId])

  // 部门选项列表
  const departmentOptions = useMemo(() => {
    const options = flattenTreeToOptions(availableParents)

    // 根据 showRootOption 决定是否添加根选项
    if (showRootOption) {
      return [
        { value: rootValue, label: rootLabel, level: 0 },
        ...options,
      ]
    }

    return options
  }, [availableParents, showRootOption, rootValue, rootLabel])

  return (
    <Select
      disabled={disabled || isLoading}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {departmentOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span style={{ paddingLeft: `${option.level * 16}px` }}>
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ==================== 导出工具函数 ====================

/**
 * 判断选择的值是否为根部门
 */
export const isRootDepartment = (value: string, rootValue = 'ROOT'): boolean => {
  return value === rootValue
}

/**
 * 将部门选择器的值转换为 API 需要的格式
 */
export const convertDepartmentValue = (value: string, rootValue = 'ROOT'): string | undefined => {
  return isRootDepartment(value, rootValue) ? undefined : value
}

/**
 * 将 API 返回的部门 ID 转换为选择器需要的格式
 */
export const convertToDepartmentSelectorValue = (apiValue: string | null | undefined, rootValue = 'ROOT'): string => {
  return apiValue ?? rootValue
}
