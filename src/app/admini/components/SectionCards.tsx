'use client'

import { useQuery } from '@tanstack/react-query'
import { CrownIcon, JapaneseYenIcon, ShieldAlertIcon } from 'lucide-react'

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

import { StatCard, type StatCardData, StatCardsContainer } from './StatCard'

import { statisticsControllerGetDashboardOverviewOptions } from '~api/@tanstack/react-query.gen'

function StatCardSkeleton() {
  return (
    <StatCardsContainer>
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card key={idx} className="overflow-hidden">
          <CardHeader>
            <CardDescription>
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
            </CardDescription>

            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              <Skeleton className="h-8 w-[140px] rounded-md" />
            </CardTitle>

            <CardAction>
              <Skeleton className="h-6 w-[80px] rounded-full" />
            </CardAction>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium w-full">
              <Skeleton className="h-4 w-[70%]" />
            </div>
            <div className="text-muted-foreground w-full">
              <Skeleton className="h-3 w-[55%]" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </StatCardsContainer>
  )
}

/**
 * 管理后台核心数据统计卡片组件
 * 展示付费用户数量、收入统计和安全事件统计三个核心指标
 */
export function SectionCards() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    ...statisticsControllerGetDashboardOverviewOptions(),
  })

  const dashboardData = data?.data

  if (isLoading || isError || !dashboardData) {
    return <StatCardSkeleton />
  }

  const formatRevenue = (revenue: number) => {
    return `¥${revenue.toLocaleString()}`
  }

  // 格式化增长率显示
  const formatGrowthRate = (rate: number) => {
    const sign = rate >= 0 ? '+' : ''

    return `${sign}${rate.toFixed(1)}%`
  }

  // 确定趋势类型
  const getTrendType = (rate: number): 'positive' | 'negative' | 'neutral' => {
    if (rate > 0) {
      return 'positive'
    }

    if (rate < 0) {
      return 'negative'
    }

    return 'neutral'
  }

  // 统计卡片数据配置
  const statsData: StatCardData[] = [
    {
      title: '付费用户数量',
      value: dashboardData.totalLicenseUsers,
      changePercent: formatGrowthRate(dashboardData.userGrowthRate),
      primaryText: dashboardData.userGrowthRate >= 0
        ? '用户数量持续增长'
        : '用户数量有所下降',
      secondaryText: dashboardData.userGrowthRate >= 0
        ? '付费转化效果良好'
        : '需要关注用户留存',
      icon: CrownIcon,
      trendType: getTrendType(dashboardData.userGrowthRate),
    },
    {
      title: '总收入统计',
      value: formatRevenue(dashboardData.totalLicenseRevenue),
      changePercent: formatGrowthRate(dashboardData.revenueGrowthRate),
      primaryText: dashboardData.revenueGrowthRate >= 0
        ? '收入增长趋势良好'
        : '收入出现下降趋势',
      secondaryText: dashboardData.revenueGrowthRate >= 0
        ? '业务发展稳健'
        : '需要优化收入策略',
      icon: JapaneseYenIcon,
      trendType: getTrendType(dashboardData.revenueGrowthRate),
    },
    {
      title: '安全事件统计',
      value: 0, // 暂时使用固定值，后续可从其他接口获取
      changePercent: '0%',
      primaryText: '系统安全状况良好',
      secondaryText: '未发现安全异常',
      icon: ShieldAlertIcon,
      trendType: 'positive',
    },
  ]

  return (
    <StatCardsContainer>
      {statsData.map((data, idx) => (
        <StatCard key={idx} data={data} />
      ))}
    </StatCardsContainer>
  )
}
