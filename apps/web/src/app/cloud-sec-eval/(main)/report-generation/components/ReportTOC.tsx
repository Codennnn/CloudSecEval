'use client'

import { FileTextIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { ScrollArea } from '~/components/ui/scroll-area'

interface TOCItem {
  id: string
  title: string
  level: number
}

interface ReportTOCProps {
  /** 目录项列表 */
  items: TOCItem[]
  /** 当前激活的章节 ID */
  activeId?: string
  /** 点击目录项的回调 */
  onItemClick?: (id: string) => void
}

/**
 * 报告目录导航组件
 * 显示报告的章节结构
 */
export function ReportTOC(props: ReportTOCProps) {
  const { items, activeId, onItemClick } = props

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileTextIcon className="size-4" />
          目录
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-1 p-4">
            {items.map((item) => {
              const isActive = activeId === item.id

              return (
                <button
                  key={item.id}
                  className={[
                    'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                    item.level === 1 && 'font-medium',
                    item.level === 2 && 'pl-6 text-muted-foreground',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted',
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    onItemClick?.(item.id)
                  }}
                >
                  {item.title}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

