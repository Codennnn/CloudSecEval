/**
 * 部门树节点组件
 * 可递归渲染的部门树节点，支持展开/收起和选中状态
 */

'use client'

import { useCallback } from 'react'

import { ChevronRightIcon, FolderIcon, UsersIcon } from 'lucide-react'

import { Checkbox } from '~/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'

import { useDepartmentTreeStore } from './stores/useDepartmentTreeStore'
import type { DepartmentTreeItemProps, DepartmentTreeNode } from './types'

/**
 * 部门树节点组件属性接口
 */
interface DepartmentTreeItemComponentProps extends DepartmentTreeItemProps {
  /** 组织 ID */
  orgId: string
  /** 原始树形数据（用于多选时的父子联动） */
  treeData: DepartmentTreeNode[]
}

/**
 * 部门树节点组件
 */
export function DepartmentTreeItem(props: DepartmentTreeItemComponentProps) {
  const {
    node,
    selectable,
    orgId,
    treeData,
    renderNode,
  } = props

  const {
    expandedKeys,
    selectedKeys,
    toggleExpanded,
    toggleSelected,
  } = useDepartmentTreeStore(orgId)

  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedKeys.has(node.id)
  const isSelected = selectedKeys.has(node.id)

  /**
   * 处理展开/收起切换
   */
  const handleToggleExpanded = useCallback(() => {
    if (hasChildren) {
      toggleExpanded(node.id)
    }
  }, [hasChildren, node.id, toggleExpanded])

  /**
   * 处理选中状态切换
   */
  const handleToggleSelected = useCallback(() => {
    if (selectable) {
      toggleSelected(node.id)
    }
  }, [selectable, node.id, toggleSelected])

  /**
   * 处理复选框变化
   */
  const handleCheckboxChange = useCallback(() => {
    if (selectable === 'multiple') {
      toggleSelected(node.id)
    }
  }, [selectable, node.id, toggleSelected])

  /**
   * 渲染节点内容
   */
  const renderNodeContent = () => {
    if (renderNode) {
      return renderNode(node)
    }

    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* 部门图标 */}
        <div className="shrink-0">
          {hasChildren
            ? (
                <FolderIcon className="size-4 text-blue-500" />
              )
            : (
                <UsersIcon className="size-4 text-gray-500" />
              )}
        </div>

        {/* 部门名称 */}
        <span className="flex-1 truncate font-medium">
          {node.name}
        </span>

        {/* 统计信息 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          {typeof node.userCount === 'number' && (
            <span className="flex items-center gap-1">
              <UsersIcon className="size-3" />
              {node.userCount}
            </span>
          )}
          {typeof node.childrenCount === 'number' && node.childrenCount > 0 && (
            <span className="flex items-center gap-1">
              <FolderIcon className="size-3" />
              {node.childrenCount}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={handleToggleExpanded}>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 w-full">
          {/* 多选模式下的复选框 */}
          {selectable === 'multiple' && (
            <Checkbox
              checked={isSelected}
              className="shrink-0"
              onCheckedChange={handleCheckboxChange}
            />
          )}

          {/* 节点按钮 */}
          <CollapsibleTrigger asChild className="flex-1">
            <SidebarMenuButton
              className={cn(
                'w-full justify-start',
                selectable === 'single' && isSelected && 'bg-sidebar-accent text-sidebar-accent-foreground',
                selectable === 'single' && 'cursor-pointer',
                !hasChildren && 'cursor-default',
              )}
              onClick={selectable === 'single' ? handleToggleSelected : undefined}
            >
              {/* 展开/收起图标 */}
              <div className="shrink-0 w-4 flex justify-center">
                {
                  hasChildren
                    ? (
                        <>
                          <ChevronRightIcon
                            className={cn(
                              'size-4 transition-transform duration-200',
                              isExpanded && 'rotate-90',
                            )}
                          />
                        </>
                      )
                    : <div className="w-4" /> // 占位符，保持对齐
                }
              </div>

              {/* 节点内容 */}
              {renderNodeContent()}
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </div>

        {/* 子节点 */}
        {hasChildren && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {node.children!.map((childNode) => (
                <SidebarMenuSubItem key={childNode.id}>
                  <DepartmentTreeItem
                    node={childNode}
                    orgId={orgId}
                    renderNode={renderNode}
                    selectable={selectable}
                    treeData={treeData}
                  />
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  )
}
