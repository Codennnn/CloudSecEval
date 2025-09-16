'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip } from '~/components/ui/chart'

interface TooltipPayload {
  dataKey: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

/**
 * 自定义科技风格工具提示
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-cyan-400/30 bg-gray-900/95 p-3 shadow-2xl backdrop-blur-sm">
        <div className="mb-2 border-b border-cyan-400/20 pb-2">
          <p className="text-xs font-mono text-cyan-300">{`日期: ${label}`}</p>
        </div>
        <div className="space-y-1">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-mono text-gray-200">
                提交数:
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-75 blur-sm -z-10" />
      </div>
    )
  }

  return null
}

interface ReportSubmitDatum {
  date: string
  count: number
}

interface ReportSubmitChartProps {
  data?: ReportSubmitDatum[]
}

// 默认示例数据（最近 7 天提交数）
const defaultData: ReportSubmitDatum[] = [
  { date: '09-09', count: 12 },
  { date: '09-10', count: 18 },
  { date: '09-11', count: 9 },
  { date: '09-12', count: 16 },
  { date: '09-13', count: 21 },
  { date: '09-14', count: 14 },
  { date: '09-15', count: 19 },
]

/**
 * 报告提交统计图
 * - 参考 TeamReportsChart 的实现方式
 * - 颜色适配仪表盘主题（青蓝系），同时遵循全局 ChartContainer 配置模式
 */
export function ReportSubmitChart(props: ReportSubmitChartProps) {
  const data = props.data ?? defaultData

  return (
    <ChartContainer
      className="aspect-auto h-44 w-full"
      config={{
        submissions: {
          label: '提交数',
          // 选用青蓝色以贴合首页仪表盘视觉基调
          color: '#06b6d4',
        },
      }}
    >
      <BarChart data={data}>
        <defs>
          <linearGradient id="fillSubmissions" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-submissions)" stopOpacity={0.95} />
            <stop offset="95%" stopColor="var(--color-submissions)" stopOpacity={0.15} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          axisLine={false}
          dataKey="date"
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} />

        <ChartTooltip
          content={<CustomTooltip />}
          cursor={{
            fill: 'rgba(6, 182, 212, 0.1)',
            stroke: '#00f5ff',
            strokeWidth: 2,
            radius: 6,
          }}
        />

        <Bar dataKey="count" fill="url(#fillSubmissions)" radius={6} stroke="var(--color-submissions)" />
      </BarChart>
    </ChartContainer>
  )
}
