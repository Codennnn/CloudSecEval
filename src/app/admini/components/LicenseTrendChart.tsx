'use client'

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '~/components/ui/toggle-group'

import { statisticsControllerGetLicenseTrendOptions } from '~api/@tanstack/react-query.gen'

const chartConfig = {
  dailyNew: {
    label: '每日新增',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

const timeRangeOptions = [
  { value: '30d', label: '最近 30 天', days: 30 },
  { value: '60d', label: '最近 60 天', days: 60 },
  { value: '90d', label: '最近 90 天', days: 90 },
]

/**
 * 获取指定天数前的日期
 */
function getDateBefore(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)

  return date.toISOString().split('T')[0]
}

/**
 * 获取今天的日期
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export function LicenseTrendChart() {
  const [timeRange, setTimeRange] = useState('30d')

  // 获取当前选择的时间范围配置
  const currentRange = timeRangeOptions.find((option) => option.value === timeRange)
    ?? timeRangeOptions[0]

  // 计算查询参数
  const startDate = getDateBefore(currentRange.days)
  const endDate = getToday()

  // 使用 TanStack Query 获取授权码趋势数据
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...statisticsControllerGetLicenseTrendOptions({
      query: {
        startDate,
        endDate,
        period: 'day',
        limit: 100,
        offset: 0,
      },
    }),
  })

  // 处理图表数据
  const chartData = data?.data.dailyTrend.map((item) => ({
    date: item.timestamp,
    dailyNew: item.value,
  })) ?? []

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    })
  }

  // 格式化工具提示日期
  const formatTooltipDate = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Card className="@container/card">
      <CardHeader className="flex items-center gap-2 space-y-0">
        <div className="grid flex-1 gap-1">
          <CardTitle>每日新增授权码趋势</CardTitle>
          <CardDescription className="@xl/card:block hidden">
            展示指定时间范围内每日新增授权码的变化趋势
          </CardDescription>
        </div>

        <CardAction className="flex items-center gap-2">
          <ToggleGroup
            className="hidden @xl/card:flex"
            type="single"
            value={timeRange}
            variant="outline"
            onValueChange={(value) => {
              if (value) {
                setTimeRange(value)
              }
            }}
          >
            {timeRangeOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                aria-label={option.label}
                value={option.value}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              aria-label="选择时间范围"
              className="@xl/card:hidden"
            >
              <SelectValue placeholder={currentRange.label} />
            </SelectTrigger>

            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 @xl/card:px-6 @xl/card:pt-6">
        {isLoading || isError
          ? (
              <div className="space-y-4">
                <Skeleton className="h-[250px] w-full" />
                <div className="flex justify-between gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            )
          : chartData.length === 0
            ? (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                  暂无数据
                </div>
              )
            : (
                <ChartContainer
                  className="aspect-auto h-[250px] w-full"
                  config={chartConfig}
                >
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="fillDailyNew" x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-dailyNew)"
                          stopOpacity={1.0}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-dailyNew)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      axisLine={false}
                      dataKey="date"
                      minTickGap={32}
                      tickFormatter={formatDate}
                      tickLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      content={(
                        <ChartTooltipContent
                          indicator="dot"
                          labelFormatter={formatTooltipDate}
                        />
                      )}
                      cursor={false}
                    />
                    <Area
                      dataKey="dailyNew"
                      fill="url(#fillDailyNew)"
                      stroke="var(--color-dailyNew)"
                      type="natural"
                    />
                  </AreaChart>
                </ChartContainer>
              )}

        {/* 统计信息 */}
        {data?.data && (
          <div className="pt-4 grid grid-cols-2 gap-4 @xl/card:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {data.data.totalNewLicenses || 0}
              </div>
              <div className="text-sm text-muted-foreground">总新增数量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(data.data.averageDailyNew || 0)}
              </div>
              <div className="text-sm text-muted-foreground">日均新增</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {data.data.peakDailyNew || 0}
              </div>
              <div className="text-sm text-muted-foreground">最高单日新增</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {currentRange.days}
              </div>
              <div className="text-sm text-muted-foreground">统计天数</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
