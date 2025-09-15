import { type LucideIcon } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { cn } from '~/lib/utils'

export interface StatCardData {
  /** 卡片标题/描述 */
  title: string
  /** 主要数值 */
  value: string | number
  /** 变化百分比 */
  changePercent: string
  /** 主要描述文本 */
  primaryText: string
  /** 次要描述文本 */
  secondaryText: string
  /** 主要图标 */
  icon: LucideIcon
  /** 变化趋势类型（用于样式） */
  trendType?: 'positive' | 'negative' | 'neutral'
}

interface StatCardProps {
  /** 卡片数据 */
  data: StatCardData
  /** 自定义类名 */
  className?: string
}

export function BugStatsCard(props: React.PropsWithChildren<StatCardProps>) {
  const { data, className, children } = props

  const {
    title,
    value,
    primaryText,
    secondaryText,
    icon: Icon,
  } = data

  return (
    <div className={cn('@container/card p-[3px] shadow-md shadow-secondary rounded-xl', className)}>
      <Card className="shadow-none rounded-xl border-none bg-gradient-to-b from-theme/8 to-transparent">
        <CardHeader>
          <CardDescription>
            <div className="flex items-center gap-1">
              {title}
              <Icon className="size-4" />
            </div>
          </CardDescription>

          <CardTitle className="text-2xl font-bold text-theme tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {primaryText}
          </div>

          <div className="text-muted-foreground">
            {secondaryText}
          </div>
        </CardFooter>

        {children}
      </Card>
    </div>
  )
}
