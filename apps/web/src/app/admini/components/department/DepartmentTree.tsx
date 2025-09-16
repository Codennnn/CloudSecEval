'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { PlusIcon, UsersRoundIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { Skeleton } from '~/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import { isCrowdTest } from '~/utils/platform'

import { useDepartmentData } from './hooks/useDepartmentData'
import { useDepartmentTreeStore } from './stores/useDepartmentTreeStore'
import { DepartmentDialog } from './DepartmentDialog'
import { DepartmentTreeItem } from './DepartmentTreeItem'
import { DepartmentTreeSearch } from './DepartmentTreeSearch'
import type {
  DepartmentDialogMode,
  DepartmentFormInitialData,
  DepartmentTreeItemProps,
  DepartmentTreeNode,
  DepartmentTreeProps,
} from './types'

import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'
import { departmentsControllerRemoveDepartmentMutation } from '~api/@tanstack/react-query.gen'

function TreeLoadingSkeleton() {
  return (
    <div className="flex flex-col items-end gap-4">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  )
}

const noun = isCrowdTest() ? '团队' : '部门'

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

  const router = useRouter()

  const [isInitialized, setIsInitialized] = useState(false)

  // 手动清空选中时，抑制下一次“自动选中首个节点”的副作用
  const suppressNextAutoSelectRef = useRef(false)

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
   * 处理选中状态变化回调
   */
  useEffect(() => {
    onSelect?.(Array.from(selectedKeys))
  }, [selectedKeys, onSelect])

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

  const displayTreeData = useMemo<DepartmentTreeNode[]>(() => {
    if (searchKeyword) {
      return filteredTreeData
    }

    return treeData
  }, [filteredTreeData, searchKeyword, treeData])

  const deleteDepartment = useMutation({
    ...departmentsControllerRemoveDepartmentMutation(),
    onSuccess: () => {
      toast.success(`删除${noun}成功`)
      void refetch()
    },
  })

  // 删除后如果没有选中项或选中项已不存在，则自动选中第一个部门，提升体验
  useEffect(() => {
    if (isInitialized && defaultSelectFirstNode) {
      // 如果是手动清空触发，跳过一次自动选中
      if (suppressNextAutoSelectRef.current) {
        suppressNextAutoSelectRef.current = false
      }
      else {
        // 收集当前树中所有有效的 id
        const validIds = new Set<string>()

        const collectIds = (nodes: DepartmentTreeNode[]) => {
          for (const n of nodes) {
            validIds.add(n.id)

            if (n.children && n.children.length > 0) {
              collectIds(n.children)
            }
          }
        }

        collectIds(treeData)

        // 判断当前选中项在新树中是否仍然有效
        let hasValidSelection = false

        for (const id of selectedKeys) {
          if (validIds.has(id)) {
            hasValidSelection = true
            break
          }
        }

        if (!hasValidSelection && treeData.length > 0) {
          const firstNode = treeData.at(0)

          if (firstNode) {
            setSelectedKeys([firstNode.id])
          }
        }
      }
    }
  }, [isInitialized, defaultSelectFirstNode, selectedKeys, treeData, setSelectedKeys])

  const handleDeleteDepartment = useEvent<NonNullable<DepartmentTreeItemProps['onDelete']>>((nodeId) => {
    deleteDepartment.mutate({ path: { id: nodeId } })
  })

  const [dialogState, setDialogState] = useState<{
    mode: DepartmentDialogMode | null
    open: boolean
    formData?: DepartmentFormInitialData
  }>({
    mode: null,
    open: false,
    formData: undefined,
  })

  const openCreateDialog = useEvent((formData?: DepartmentFormInitialData) => {
    setDialogState({
      mode: 'create',
      open: true,
      formData,
    })
  })

  const openEditDialog = useEvent((formData: DepartmentFormInitialData) => {
    setDialogState({
      mode: 'edit',
      open: true,
      formData,
    })
  })

  const handleDialogOpenChange = useEvent((open: boolean) => {
    setDialogState((prev) => {
      return {
        ...prev,
        open,
      }
    })
  })

  const findNodeById = (
    nodes: DepartmentTreeNode[],
    id: string,
  ): DepartmentTreeNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) {
        return n
      }

      if (n.children && n.children.length > 0) {
        const found = findNodeById(n.children, id)

        if (found) {
          return found
        }
      }
    }

    return undefined
  }

  const handleViewDetail = useEvent<NonNullable<DepartmentTreeItemProps['onViewDetail']>>((nodeId) => {
    if (isCrowdTest()) {
      router.push(getRoutePath(AdminRoutes.CrowdTestTeamProfile, { teamId: nodeId }))
    }
  })

  const handleAddChild = useEvent<NonNullable<DepartmentTreeItemProps['onAddChild']>>((nodeId) => {
    openCreateDialog({ parentId: nodeId })
  })

  const handleEdit = useEvent<NonNullable<DepartmentTreeItemProps['onEdit']>>((nodeId) => {
    const node = findNodeById(treeData, nodeId)

    if (node) {
      openEditDialog({
        id: node.id,
        name: node.name,
        remark: node.remark,
        parentId: node.parent?.id,
        isActive: node.isActive,
      })
    }
  })

  return (
    <div
      className={cn(
        '[--sidebar-accent:var(--secondary)] [--sidebar-accent-foreground:var(--secondary-foreground)]',
        'flex flex-col',
      )}
    >
      {/* 搜索区域 */}
      {showSearch && (
        <SidebarHeader className="p-admin-content pb-admin-content-half">
          <div className="flex items-center gap-2">
            <DepartmentTreeSearch
              orgId={orgId}
              placeholder={`搜索${noun}...`}
              treeData={treeData}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    openCreateDialog()
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                {`添加新${noun}`}
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarHeader>
      )}

      <SidebarContent>
        <ScrollGradientContainer className="p-admin-content pt-admin-content-half">
          {
            isLoading
              ? <TreeLoadingSkeleton />
              : displayTreeData.length > 0
                ? (
                    <SidebarGroup className="p-0">
                      <SidebarMenu className="gap-list-item">

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            isActive={selectedKeys.size === 0}
                            onClick={() => {
                              suppressNextAutoSelectRef.current = true
                              setSelectedKeys([])
                            }}
                          >
                            <div className="shrink-0 ml-7">
                              <UsersRoundIcon className="size-4" />
                            </div>

                            {`所有${noun}成员`}
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <div className="py-1.5">
                          <Separator />
                        </div>

                        {/* 树形内容区域 */}
                        {displayTreeData.map((node) => (
                          <DepartmentTreeItem
                            key={node.id}
                            node={node}
                            orgId={orgId}
                            renderNode={renderNode}
                            selectable={selectable}
                            treeData={treeData}
                            onAddChild={handleAddChild}
                            onDelete={handleDeleteDepartment}
                            onEdit={handleEdit}
                            onViewDetail={handleViewDetail}
                          />
                        ))}
                      </SidebarMenu>
                    </SidebarGroup>
                  )
                : searchKeyword
                  ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center text-muted-foreground">
                          <div>{`未找到匹配的${noun}`}</div>
                          <div className="text-sm mt-1">尝试使用其他关键词搜索</div>
                        </div>
                      </div>
                    )
                  : (
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center text-muted-foreground">
                          <div className="text-sm">{`暂无${noun}数据`}</div>
                        </div>
                      </div>
                    )
          }
        </ScrollGradientContainer>
      </SidebarContent>

      {/* 统一的部门对话框，仅此一个实例 */}
      {dialogState.mode && (
        <DepartmentDialog
          formData={dialogState.formData}
          mode={dialogState.mode}
          open={dialogState.open}
          orgId={orgId}
          onOpenChange={handleDialogOpenChange}
          onSuccess={() => {
            handleDialogOpenChange(false)
            void refetch()
          }}
        />
      )}
    </div>
  )
}
