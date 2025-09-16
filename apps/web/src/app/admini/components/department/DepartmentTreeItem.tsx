'use client'

import { useEvent } from 'react-use-event-hook'

import { ChevronDownIcon, ChevronRightIcon, EditIcon, EllipsisVerticalIcon, FolderIcon, PlusIcon, TextSelectIcon, TrashIcon } from 'lucide-react'

import { Checkbox } from '~/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'
import { isCrowdTest } from '~/utils/platform'

import { useDepartmentTreeStore } from './stores/useDepartmentTreeStore'
import type { DepartmentTreeItemProps } from './types'

export function DepartmentTreeItem(props: DepartmentTreeItemProps) {
  const {
    node,
    selectable,
    orgId,
    treeData,
    renderNode,
    onViewDetail,
    onAddChild,
    onEdit,
    onDelete,
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

  const handleToggleExpanded = useEvent((ev: React.MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation()

    if (hasChildren) {
      toggleExpanded(node.id)
    }
  })

  const handleToggleSelected = useEvent(() => {
    if (selectable) {
      toggleSelected(node.id)
    }
  })

  const handleCheckboxChange = useEvent(() => {
    if (selectable === 'multiple') {
      toggleSelected(node.id)
    }
  })

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
          <FolderIcon className="size-4" />
        </div>

        {/* 部门名称 */}
        <span className="flex-1 truncate font-medium">
          {node.name}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              asChild
              showOnHover
              className="data-[state=open]:bg-muted rounded-sm"
            >
              <div>
                <EllipsisVerticalIcon className="!size-3.5" />
                <span className="sr-only">更多</span>
              </div>
            </SidebarMenuAction>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            side="right"
            onClick={(ev) => {
              ev.stopPropagation()
            }}
          >
            <DropdownMenuItem
              onClick={() => {
                onViewDetail?.(node.id)
              }}
            >
              <TextSelectIcon />
              <span>查看详情</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                onEdit?.(node.id)
              }}
            >
              <EditIcon />
              <span>编辑</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                onAddChild?.(node.id)
              }}
            >
              <PlusIcon />
              <span>{`添加子${isCrowdTest() ? '团队' : '部门'}`}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                onDelete?.(node.id)
              }}
            >
              <TrashIcon />
              <span>删除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <Collapsible open={isExpanded}>
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
              className="w-full justify-start"
              isActive={isSelected}
              onClick={selectable === 'single' ? handleToggleSelected : undefined}
            >
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div
                className="shrink-0 size-5 flex justify-center items-center rounded-sm hover:bg-background"
                onClick={handleToggleExpanded}
              >
                {
                  hasChildren
                    ? (
                        <>
                          {
                            isExpanded
                              ? <ChevronDownIcon className="!size-4" />
                              : <ChevronRightIcon className="!size-4" />
                          }
                        </>
                      )
                    : null
                }
              </div>

              {/* 节点内容 */}
              {renderNodeContent()}
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </div>
      </SidebarMenuItem>

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
                  onDelete={onDelete}
                />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}
