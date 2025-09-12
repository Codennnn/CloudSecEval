import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { cn } from '~/lib/utils'

/**
 * 统计卡片数据接口
 */
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

/**
 * 统计卡片组件属性
 */
export interface StatCardProps {
  /** 卡片数据 */
  data: StatCardData
  /** 自定义类名 */
  className?: string
}

/**
 * 可复用的统计卡片组件
 * 支持灵活配置卡片内容、布局和样式
 */
export function StatCard(props: React.PropsWithChildren<StatCardProps>) {
  const { data, className, children } = props

  const {
    title,
    value,
    changePercent,
    primaryText,
    secondaryText,
    icon: Icon,
    trendType = 'neutral',
  } = data

  return (
    <Card className={cn('@container/card', className)}>
      <CardHeader>
        <CardDescription>
          <div className="flex items-center gap-1">
            {title}
            <Icon className="size-4" />
          </div>
        </CardDescription>

        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>

        <CardAction>
          <Badge variant="outline">
            {
              trendType === 'positive'
                ? <TrendingUp />
                : trendType === 'negative'
                  ? <TrendingDown />
                  : null
            }
            {changePercent}
          </Badge>
        </CardAction>
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
  )
}

/**
 * 统计卡片容器组件
 * 提供响应式网格布局
 */
export interface StatCardsContainerProps {
  /** 子组件 */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 网格列数配置 */
  gridConfig?: {
    /** 默认列数 */
    default?: number
    /** 中等屏幕列数 */
    md?: number
    /** 大屏幕列数 */
    lg?: number
    /** 超大屏幕列数 */
    xl?: number
  }
}

/**
 * 统计卡片容器组件
 * 提供统一的布局和样式
 */
export function StatCardsContainer({
  children,
  className,
  gridConfig = { default: 1, md: 2, lg: 3 },
}: StatCardsContainerProps) {
  const { default: defaultCols = 1, md = 2, lg = 3, xl } = gridConfig

  // 预定义网格类名以确保 Tailwind CSS 正确识别
  const getGridClasses = () => {
    const baseClasses = 'grid gap-4 px-admin-content'
    const cardStyles = '*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs'

    // 根据配置生成响应式网格类名
    let gridClasses = baseClasses

    // 默认列数
    if (defaultCols === 1) {
      gridClasses += ' grid-cols-1'
    }
    else if (defaultCols === 2) {
      gridClasses += ' grid-cols-2'
    }
    else if (defaultCols === 3) {
      gridClasses += ' grid-cols-3'
    }
    else if (defaultCols === 4) {
      gridClasses += ' grid-cols-4'
    }

    // 中等屏幕列数
    if (md === 1) {
      gridClasses += ' @xl/admin-content:grid-cols-1'
    }
    else if (md === 2) {
      gridClasses += ' @xl/admin-content:grid-cols-2'
    }
    else if (md === 3) {
      gridClasses += ' @xl/admin-content:grid-cols-3'
    }
    else if (md === 4) {
      gridClasses += ' @xl/admin-content:grid-cols-4'
    }

    // 大屏幕列数
    if (lg === 1) {
      gridClasses += ' @5xl/admin-content:grid-cols-1'
    }
    else if (lg === 2) {
      gridClasses += ' @5xl/admin-content:grid-cols-2'
    }
    else if (lg === 3) {
      gridClasses += ' @5xl/admin-content:grid-cols-3'
    }
    else if (lg === 4) {
      gridClasses += ' @5xl/admin-content:grid-cols-4'
    }

    // 超大屏幕列数
    if (xl === 1) {
      gridClasses += ' @7xl/admin-content:grid-cols-1'
    }
    else if (xl === 2) {
      gridClasses += ' @7xl/admin-content:grid-cols-2'
    }
    else if (xl === 3) {
      gridClasses += ' @7xl/admin-content:grid-cols-3'
    }
    else if (xl === 4) {
      gridClasses += ' @7xl/admin-content:grid-cols-4'
    }

    return cn(gridClasses, cardStyles, className)
  }

  return (
    <div className={getGridClasses()}>
      {children}
    </div>
  )
}
