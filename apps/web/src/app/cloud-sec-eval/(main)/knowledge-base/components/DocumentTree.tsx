'use client'

import { useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { BookTextIcon, ChevronDownIcon, ChevronRightIcon, FolderIcon, FolderOpenIcon, StarIcon } from 'lucide-react'

import { ScrollArea } from '~/components/ui/scroll-area'
import { cn } from '~/lib/utils'

import { buildDocumentTree } from '../lib/utils'
import { useKnowledgeBaseStore } from '../stores/useKnowledgeBaseStore'
import type { DocumentTreeNode } from '../types'

/**
 * 文档树节点组件
 */
function TreeNode({ node, level = 0 }: { node: DocumentTreeNode, level?: number }) {
  const selectedDocumentId = useKnowledgeBaseStore((state) => state.selectedDocumentId)
  const selectDocument = useKnowledgeBaseStore((state) => state.selectDocument)
  const expandedFolderIds = useKnowledgeBaseStore((state) => state.expandedFolderIds)
  const toggleFolderExpanded = useKnowledgeBaseStore((state) => state.toggleFolderExpanded)

  const isFolder = node.type === 'folder'
  const isExpanded = expandedFolderIds.has(node.id)
  const isSelected = node.type === 'document' && selectedDocumentId === node.id
  const isFavorite = node.document?.isFavorite

  /**
   * 处理节点点击
   */
  const handleClick = useEvent(() => {
    if (isFolder) {
      toggleFolderExpanded(node.id)
    }
    else {
      selectDocument(node.id)
    }
  })

  /**
   * 处理展开/折叠图标点击
   */
  const handleToggleClick = useEvent((e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFolderExpanded(node.id)
  })

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors',
          'hover:bg-accent',
          isSelected && 'bg-accent',
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
      >
        {/* 展开/折叠图标 */}
        {isFolder && (
          <button
            className="shrink-0 hover:bg-accent-foreground/10 rounded p-0.5"
            type="button"
            onClick={handleToggleClick}
          >
            {isExpanded
              ? <ChevronDownIcon className="size-4" />
              : <ChevronRightIcon className="size-4" />}
          </button>
        )}

        {/* 文件夹/文档图标 */}
        <div className="shrink-0">
          {isFolder
            ? (
                isExpanded
                  ? <FolderOpenIcon className="size-4 text-blue-500" />
                  : <FolderIcon className="size-4 text-blue-500" />
              )
            : <BookTextIcon className="size-4 text-gray-500" />}
        </div>

        {/* 节点名称 */}
        <span
          className={cn(
            'flex-1 truncate text-sm',
            isSelected && 'font-medium',
          )}
        >
          {node.name}
        </span>

        {/* 收藏图标 */}
        {isFavorite && (
          <StarIcon className="size-4 text-yellow-500 fill-yellow-500 shrink-0" />
        )}
      </div>

      {/* 子节点 */}
      {isFolder && isExpanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} level={level + 1} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 文档树组件
 */
export function DocumentTree() {
  const documents = useKnowledgeBaseStore((state) => state.documents)
  const categories = useKnowledgeBaseStore((state) => state.categories)

  /**
   * 构建文档树
   */
  const treeData = useMemo(() => {
    return buildDocumentTree(documents, categories)
  }, [documents, categories])

  return (
    <div className="flex flex-col h-full">
      {/* 文档树 */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {treeData.length > 0
            ? (
                treeData.map((node) => (
                  <TreeNode key={node.id} node={node} />
                ))
              )
            : (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  暂无文档
                </div>
              )}
        </div>
      </ScrollArea>
    </div>
  )
}
