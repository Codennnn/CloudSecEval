/**
 * 部门架构树组件
 * 基于 Sidebar 组件实现的可嵌套部门树，支持展开/收起、选中、搜索等功能
 */

'use client'

import { useEffect, useMemo } from 'react'

import { AlertCircleIcon, LoaderIcon } from 'lucide-react'

import { Alert, AlertDescription } from '~/components/ui/alert'
import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from '~/components/ui/sidebar'

import { useDepartmentData } from './hooks/useDepartmentData'
import { useDepartmentTreeStore } from './stores/useDepartmentTreeStore'
import { DepartmentTreeItem } from './DepartmentTreeItem'
import { DepartmentTreeSearch } from './DepartmentTreeSearch'
import type { DepartmentTreeNode, DepartmentTreeProps } from './types'

export function DepartmentTree(props: DepartmentTreeProps) {
  const {
    orgId,
    selectable = false,
    defaultExpandedKeys = [],
    defaultSelectedKeys = [],
    showSearch = true,

    onSelect,
    onExpand,
    renderNode,
  } = props

  const { treeData, isLoading, error, isSuccess } = useDepartmentData({ orgId })

  const {
    expandedKeys,
    selectedKeys,
    searchKeyword,
    filteredTreeData,
    setExpandedKeys,
    setSelectedKeys,
    setFilteredTreeData,
    reset,
  } = useDepartmentTreeStore(orgId)

  /**
   * 缓存默认展开和选中的键数组，避免不必要的重新渲染
   */
  const memoizedDefaultExpandedKeys = useMemo(() => defaultExpandedKeys, [defaultExpandedKeys])
  const memoizedDefaultSelectedKeys = useMemo(() => defaultSelectedKeys, [defaultSelectedKeys])

  /**
   * 初始化默认状态
   */
  useEffect(() => {
    if (isSuccess && treeData.length > 0) {
      // 设置默认展开的节点
      if (memoizedDefaultExpandedKeys.length > 0) {
        setExpandedKeys(memoizedDefaultExpandedKeys)
      }

      // 设置默认选中的节点
      if (memoizedDefaultSelectedKeys.length > 0) {
        setSelectedKeys(memoizedDefaultSelectedKeys)
      }

      // 初始化过滤数据
      setFilteredTreeData(treeData)
    }
  }, [
    isSuccess,
    treeData,
    memoizedDefaultExpandedKeys,
    memoizedDefaultSelectedKeys,
    setExpandedKeys,
    setSelectedKeys,
    setFilteredTreeData,
  ])

  /**
   * 当原始数据变化时更新过滤数据
   */
  useEffect(() => {
    if (treeData.length > 0 && !searchKeyword) {
      setFilteredTreeData(treeData)
    }
  }, [treeData, searchKeyword, setFilteredTreeData])

  /**
   * 获取当前显示的树形数据
   */
  const displayTreeData = useMemo(() => {
    return searchKeyword ? filteredTreeData : treeData
  }, [searchKeyword, filteredTreeData, treeData])

  /**
   * 获取选中的节点数据
   */
  const selectedNodes = useMemo(() => {
    const nodes: DepartmentTreeNode[] = []

    const findSelectedNodes = (nodeList: DepartmentTreeNode[]) => {
      for (const node of nodeList) {
        if (selectedKeys.has(node.id)) {
          nodes.push(node)
        }

        if (node.children) {
          findSelectedNodes(node.children)
        }
      }
    }

    findSelectedNodes(treeData)

    return nodes
  }, [selectedKeys, treeData])

  /**
   * 处理选中状态变化回调
   */
  useEffect(() => {
    if (onSelect && selectedNodes.length >= 0) {
      onSelect(Array.from(selectedKeys), selectedNodes)
    }
  }, [selectedKeys, selectedNodes, onSelect])

  /**
   * 处理展开状态变化回调
   */
  useEffect(() => {
    if (onExpand) {
      onExpand(Array.from(expandedKeys))
    }
  }, [expandedKeys, onExpand])

  /**
   * 组件卸载时清理状态
   */
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  /**
   * 渲染加载状态
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoaderIcon className="size-4 animate-spin" />
          <span>加载部门数据中...</span>
        </div>
      </div>
    )
  }

  /**
   * 渲染错误状态
   */
  if (error) {
    return (
      <Alert className="m-4" variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertDescription>
          加载部门数据失败: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  /**
   * 渲染空数据状态
   */
  if (displayTreeData.length === 0 && !searchKeyword) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <div className="text-sm">暂无部门数据</div>
        </div>
      </div>
    )
  }

  /**
   * 渲染搜索无结果状态
   */
  if (displayTreeData.length === 0 && searchKeyword) {
    return (
      <div className="flex flex-col gap-4">
        {showSearch && (
          <div className="p-4 pb-0">
            <DepartmentTreeSearch
              orgId={orgId}
              treeData={treeData}
            />
          </div>
        )}
        <div className="flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <div className="text-sm">未找到匹配的部门</div>
            <div className="text-xs mt-1">尝试使用其他关键词搜索</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 搜索区域 */}
      {showSearch && (
        <SidebarHeader className="p-admin-content">
          <DepartmentTreeSearch
            orgId={orgId}
            treeData={treeData}
          />
        </SidebarHeader>
      )}

      {/* 树形内容区域 */}
      <SidebarContent className="px-admin-content py-0">
        <SidebarGroup>
          <SidebarMenu>
            {displayTreeData.map((node) => (
              <DepartmentTreeItem
                key={node.id}
                node={node}
                orgId={orgId}
                renderNode={renderNode}
                selectable={selectable}
                treeData={treeData}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </div>
  )
}
