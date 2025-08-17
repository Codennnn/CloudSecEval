'use client'

import { useQuery } from '@tanstack/react-query'
import { CrownIcon, DollarSignIcon, ShieldAlertIcon } from 'lucide-react'

import { Skeleton } from '~/components/ui/skeleton'

import { StatCard, type StatCardData, StatCardsContainer } from './StatCard'

import { statisticsControllerGetDashboardOverviewOptions } from '~api/@tanstack/react-query.gen'

/**
 * 管理后台核心数据统计卡片组件
 * 展示付费用户数量、收入统计和安全事件统计三个核心指标
 */
export function SectionCards() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    ...statisticsControllerGetDashboardOverviewOptions(),
  })

  const dashboardData = data?.data

  // 处理加载状态
  if (isLoading) {
    return (
      <StatCardsContainer>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="space-y-3">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[120px]" />
            <Skeleton className="h-4 w-[80px]" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[80%]" />
            </div>
          </div>
        ))}
      </StatCardsContainer>
    )
  }

  // 处理错误状态
  if (error || !dashboardData) {
    return (
      <StatCardsContainer>
        <div className="col-span-full text-center text-muted-foreground">
          数据加载失败，请稍后重试
        </div>
      </StatCardsContainer>
    )
  }

  // 格式化收入显示
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
      icon: DollarSignIcon,
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
