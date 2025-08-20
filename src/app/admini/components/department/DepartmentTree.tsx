'use client'

import { useEffect, useMemo, useState } from 'react'

import { PlusIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from '~/components/ui/sidebar'
import { Skeleton } from '~/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { useDepartmentData } from './hooks/useDepartmentData'
import { useDepartmentTreeStore } from './stores/useDepartmentTreeStore'
import { DepartmentDialog } from './DepartmentDialog'
import { DepartmentTreeItem } from './DepartmentTreeItem'
import { DepartmentTreeSearch } from './DepartmentTreeSearch'
import type { DepartmentTreeNode, DepartmentTreeProps } from './types'

/**
 * 部门架构树组件
 */
export function DepartmentTree(props: DepartmentTreeProps) {
  const {
    orgId,
    selectable = false,
    defaultExpandedKeys = [],
    defaultSelectedKeys = [],
    defaultSelectFirstNode = true,
    showSearch = true,

    onSelect,
    onExpand,
    renderNode,
  } = props

  const [isInitialized, setIsInitialized] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { treeData, isLoading, isSuccess, refetch } = useDepartmentData({ orgId })

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

  useEffect(() => {
    if (isSuccess) {
      // 当成功获取数据后，如果初始数据为空，则初始化默认状态
      if (!isInitialized) {
        if (defaultSelectFirstNode) {
          const firstNode = treeData.at(0)

          if (firstNode) {
            setSelectedKeys([firstNode.id])
          }
        }
        else if (memoizedDefaultSelectedKeys.length > 0) {
          setSelectedKeys(memoizedDefaultSelectedKeys)
        }

        if (memoizedDefaultExpandedKeys.length > 0) {
          setExpandedKeys(memoizedDefaultExpandedKeys)
        }
      }

      setIsInitialized(true)
    }
  }, [
    isSuccess,
    treeData,
    memoizedDefaultExpandedKeys,
    memoizedDefaultSelectedKeys,
    isInitialized,
    defaultSelectFirstNode,
    setExpandedKeys,
    setSelectedKeys,
    setFilteredTreeData,
  ])

  /**
   * 当原始数据变化时更新过滤数据
   */
  useEffect(() => {
    if (treeData.length > 0) {
      setFilteredTreeData(treeData)
    }
  }, [treeData, setFilteredTreeData])

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
    if (selectedNodes.length >= 0) {
      onSelect?.(Array.from(selectedKeys), selectedNodes)
    }
  }, [selectedKeys, selectedNodes, onSelect])

  /**
   * 处理展开状态变化回调
   */
  useEffect(() => {
    onExpand?.(Array.from(expandedKeys))
  }, [expandedKeys, onExpand])

  /**
   * 组件卸载时清理状态
   */
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const displayTreeData = useMemo(() => {
    if (searchKeyword) {
      return filteredTreeData
    }

    return treeData
  }, [filteredTreeData, searchKeyword, treeData])

  return (
    <div
      className="[--sidebar-accent:var(--secondary)] [--sidebar-accent-foreground:var(--secondary-foreground)]"
    >
      {/* 搜索区域 */}
      {showSearch && (
        <SidebarHeader className="p-admin-content">
          <div className="flex items-center gap-2">
            <DepartmentTreeSearch
              orgId={orgId}
              treeData={treeData}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => { setCreateDialogOpen(true) }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                添加新部门
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarHeader>
      )}

      <SidebarContent className="px-admin-content py-0">
        {
          isLoading
            ? (
                <div className="flex flex-col items-end gap-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              )
            : displayTreeData.length > 0
              ? (
                  <SidebarGroup className="p-0">
                    <SidebarMenu>
                      {/* 树形内容区域 */}
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
                )
              : searchKeyword
                ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center text-muted-foreground">
                        <div className="text-sm">未找到匹配的部门</div>
                        <div className="text-xs mt-1">尝试使用其他关键词搜索</div>
                      </div>
                    </div>
                  )
                : (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center text-muted-foreground">
                        <div className="text-sm">暂无部门数据</div>
                      </div>
                    </div>
                  )
        }
      </SidebarContent>

      {/* 创建部门对话框 */}
      <DepartmentDialog
        mode="create"
        open={createDialogOpen}
        orgId={orgId}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          void refetch()
        }}
      />
    </div>
  )
}
