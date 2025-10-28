'use client'

import { useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { BarChart3Icon, EyeIcon, FileTextIcon, FolderIcon, StarIcon, TagIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { cn } from '~/lib/utils'

import { calculateStatistics, formatDate } from '../lib/utils'
import { useKnowledgeBaseStore } from '../stores/useKnowledgeBaseStore'

/**
 * 统计卡片组件
 */
function StatCard({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: React.ElementType
  title: string
  value: number | string
  description?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 统计面板组件
 */
export function StatisticsPanel() {
  const documents = useKnowledgeBaseStore((state) => state.documents)
  const categories = useKnowledgeBaseStore((state) => state.categories)
  const tags = useKnowledgeBaseStore((state) => state.tags)
  const selectDocument = useKnowledgeBaseStore((state) => state.selectDocument)

  /**
   * 计算统计信息
   */
  const statistics = useMemo(() => {
    return calculateStatistics(documents, categories, tags)
  }, [documents, categories, tags])

  /**
   * 处理文档点击
   */
  const handleDocumentClick = useEvent((documentId: string) => {
    selectDocument(documentId)
  })

  return (
    <div className="space-y-6 p-6">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          description="知识库中的文档总数"
          icon={FileTextIcon}
          title="文档总数"
          value={statistics.totalDocuments}
        />
        <StatCard
          description="文档分类数量"
          icon={FolderIcon}
          title="分类数量"
          value={statistics.totalCategories}
        />
        <StatCard
          description="标签总数"
          icon={TagIcon}
          title="标签数量"
          value={statistics.totalTags}
        />
        <StatCard
          description="收藏的文档数量"
          icon={StarIcon}
          title="收藏文档"
          value={statistics.favoriteDocuments}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 最多查看的文档 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeIcon className="size-4" />
              最多查看
            </CardTitle>
            <CardDescription>查看次数最多的文档</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {statistics.mostViewedDocuments.length > 0
                  ? (
                      statistics.mostViewedDocuments.map((doc, index) => (
                        <div
                          key={doc.id}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors',
                            'hover:bg-accent',
                          )}
                          onClick={() => { handleDocumentClick(doc.id) }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm font-medium text-muted-foreground shrink-0">
                              {index + 1}.
                            </span>
                            <span className="text-sm truncate">{doc.name}</span>
                          </div>
                          <Badge variant="secondary">
                            {doc.viewCount}
                            {' '}
                            次
                          </Badge>
                        </div>
                      ))
                    )
                  : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        暂无数据
                      </div>
                    )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 最近查看的文档 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="size-4" />
              最近查看
            </CardTitle>
            <CardDescription>最近访问的文档</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {statistics.recentlyViewedDocuments.length > 0
                  ? (
                      statistics.recentlyViewedDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors',
                            'hover:bg-accent',
                          )}
                          onClick={() => { handleDocumentClick(doc.id) }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{doc.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(doc.lastViewedAt ?? doc.updatedAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        暂无数据
                      </div>
                    )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* 标签云 */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="size-4" />
              标签云
            </CardTitle>
            <CardDescription>所有文档标签及使用次数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags
                .sort((a, b) => b.count - a.count)
                .map((tag) => {
                  const fontSize = Math.max(12, Math.min(20, 12 + tag.count * 2))

                  return (
                    <Badge
                      key={tag.id}
                      className="cursor-default"
                      style={{ fontSize: `${fontSize}px` }}
                      variant="secondary"
                    >
                      {tag.name}
                      {' '}
                      (
                      {tag.count}
                      )
                    </Badge>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分类分布 */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderIcon className="size-4" />
              分类分布
            </CardTitle>
            <CardDescription>各分类下的文档数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((category) => {
                const count = statistics.documentsByCategory[category.id] ?? 0
                const percentage = statistics.totalDocuments > 0
                  ? Math.round((count / statistics.totalDocuments) * 100)
                  : 0

                return (
                  <div key={category.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{category.name}</span>
                      <span className="text-muted-foreground">
                        {count}
                        {' '}
                        个 (
                        {percentage}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
