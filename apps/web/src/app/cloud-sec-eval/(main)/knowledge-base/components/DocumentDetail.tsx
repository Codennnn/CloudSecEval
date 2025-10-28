'use client'

import { useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { ClockIcon, EyeIcon, FileTextIcon, StarIcon, TagIcon } from 'lucide-react'
import { toast } from 'sonner'

import { MDXRenderer } from '~/components/mdx/MDXRenderer'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { cn } from '~/lib/utils'

import { formatDate } from '../lib/utils'
import { useKnowledgeBaseStore } from '../stores/useKnowledgeBaseStore'

/**
 * 文档大纲项接口
 */
interface OutlineItem {
  id: string
  text: string
  level: number
}

/**
 * 提取文档大纲
 */
function extractOutline(content: string): OutlineItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const outline: OutlineItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')

    outline.push({ id, text, level })
  }

  return outline
}

/**
 * 文档大纲组件
 */
function DocumentOutline({ content }: { content: string }) {
  const outline = useMemo(() => extractOutline(content), [content])
  const [activeId, setActiveId] = useState<string>('')

  /**
   * 滚动到指定标题
   */
  const handleScrollTo = useEvent((id: string) => {
    const element = document.getElementById(id)

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  })

  if (outline.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground px-3">目录大纲</div>
      <div className="space-y-1">
        {outline.map((item) => (
          <button
            key={item.id}
            className={cn(
              'w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-accent',
              activeId === item.id && 'bg-accent text-accent-foreground',
            )}
            style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
            type="button"
            onClick={() => { handleScrollTo(item.id) }}
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * 文档详情组件
 */
export function DocumentDetail() {
  const selectedDocumentId = useKnowledgeBaseStore((state) => state.selectedDocumentId)
  const getDocument = useKnowledgeBaseStore((state) => state.getDocument)
  const toggleFavorite = useKnowledgeBaseStore((state) => state.toggleFavorite)

  const document = selectedDocumentId ? getDocument(selectedDocumentId) : null

  /**
   * 处理收藏切换
   */
  const handleToggleFavorite = useEvent(() => {
    if (!document) {
      return
    }

    toggleFavorite(document.id)
    toast.success(document.isFavorite ? '已取消收藏' : '已添加到收藏')
  })

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <FileTextIcon className="size-16 text-muted-foreground mx-auto" />
          <div className="text-muted-foreground">请选择一个文档查看详情</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 文档头部 */}
        <div className="border-b p-6 space-y-4">
          {/* 标题和操作按钮 */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-bold">{document.name}</h1>
              {document.summary && (
                <p className="text-muted-foreground text-sm">{document.summary}</p>
              )}
            </div>
            <Button
              size="sm"
              variant={document.isFavorite ? 'default' : 'outline'}
              onClick={handleToggleFavorite}
            >
              <StarIcon className={cn('size-4', document.isFavorite && 'fill-current')} />
              {document.isFavorite ? '已收藏' : '收藏'}
            </Button>
          </div>

          {/* 元数据 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <EyeIcon className="size-4" />
              <span>{document.viewCount} 次查看</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="size-4" />
              <span>更新于 {formatDate(document.updatedAt)}</span>
            </div>
          </div>

          {/* 标签 */}
          {document.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <TagIcon className="size-4 text-muted-foreground shrink-0" />
              {document.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 文档内容 */}
        <ScrollArea className="flex-1">
          <div className="p-6 prose prose-slate dark:prose-invert max-w-none">
            <MDXRenderer content={document.content} />
          </div>
        </ScrollArea>
      </div>

      {/* 右侧大纲 */}
      <div className="w-64 border-l hidden xl:block">
        <ScrollArea className="h-full">
          <div className="p-4">
            <DocumentOutline content={document.content} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
