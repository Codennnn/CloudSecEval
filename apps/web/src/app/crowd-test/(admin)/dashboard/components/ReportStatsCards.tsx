'use client'

import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react'

import { Card } from '~/components/ui/card'

import { getReportStatusTitle, type ReportStatusStats } from '../lib/mockData'

/**
 * 根据 tone 返回对应的图标背景与数值文本颜色
 */
function getToneClasses(tone: 'orange' | 'green' | 'red' | 'gray') {
  let iconBg = 'bg-gray-50 text-gray-600'
  let valueText = 'text-gray-600'

  switch (tone) {
    case 'orange': {
      iconBg = 'bg-orange-50 text-orange-600'
      valueText = 'text-orange-600'
      break
    }

    case 'green': {
      iconBg = 'bg-green-50 text-green-600'
      valueText = 'text-green-600'
      break
    }

    case 'red': {
      iconBg = 'bg-red-50 text-red-600'
      valueText = 'text-red-600'
      break
    }

    case 'gray': {
      iconBg = 'bg-gray-50 text-gray-600'
      valueText = 'text-gray-600'
      break
    }

    default: {
      iconBg = 'bg-gray-50 text-gray-600'
      valueText = 'text-gray-600'
      break
    }
  }

  return { iconBg, valueText }
}

/**
 * 单个统计卡片：包含图标、标题、辅助标语与数值
 */
function StatCard({
  title,
  hint,
  value,
  icon,
  tone,
}: {
  title: string
  hint: string
  value: number
  icon: React.ReactNode
  tone: 'orange' | 'green' | 'red' | 'gray'
}) {
  const toneClasses = getToneClasses(tone)

  return (
    <Card className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`flex size-9 items-center justify-center rounded-full ring-1 ring-border ${toneClasses.iconBg}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${toneClasses.valueText}`}>{value}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
    </Card>
  )
}

/**
 * 报告统计卡片组：
 * - 接收纯数据 `ReportStatusStats`
 * - 在组件内部决定展示（标题、说明、图标、颜色）
 */
export function ReportStatsCards({ stats }: { stats: ReportStatusStats }) {
  const cardsConfig: {
    key: keyof ReportStatusStats
    hint: string
    tone: 'orange' | 'green' | 'red' | 'gray'
    icon: React.ReactNode
  }[] = [
    {
      key: 'pending',
      hint: '等待处理的报告',
      tone: 'orange',
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: 'approved',
      hint: '审核通过的报告',
      tone: 'green',
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      key: 'rejected',
      hint: '未通过的报告',
      tone: 'red',
      icon: <XCircle className="h-4 w-4" />,
    },
    {
      key: 'archived',
      hint: '已完成归档',
      tone: 'gray',
      icon: <FileText className="h-4 w-4" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cardsConfig.map((c) => (
        <StatCard
          key={c.key}
          hint={c.hint}
          icon={c.icon}
          title={getReportStatusTitle(c.key)}
          tone={c.tone}
          value={stats[c.key]}
        />
      ))}
    </div>
  )
}
