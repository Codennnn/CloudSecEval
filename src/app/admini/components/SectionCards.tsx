import { CrownIcon, DollarSignIcon, ShieldAlertIcon } from 'lucide-react'

import { StatCard, type StatCardData, StatCardsContainer } from './StatCard'

/**
 * 管理后台核心数据统计卡片组件
 * 展示付费用户数量、收入统计和安全事件统计三个核心指标
 */
export function SectionCards() {
  // 统计卡片数据配置
  const statsData: StatCardData[] = [
    {
      title: '付费用户数量',
      value: 892,
      changePercent: '12.8%',
      primaryText: '本月新增付费用户稳步增长',
      secondaryText: '付费转化率达到预期目标',
      icon: CrownIcon,
      trendType: 'positive',
    },
    {
      title: '总收入统计',
      value: '¥28,560',
      changePercent: '18.5%',
      primaryText: '收入增长趋势良好',
      secondaryText: '较上月同期增长显著',
      icon: DollarSignIcon,
      trendType: 'positive',
    },
    {
      title: '安全事件统计',
      value: 3,
      changePercent: '25%',
      primaryText: '安全事件数量持续下降',
      secondaryText: '系统安全状况良好',
      icon: ShieldAlertIcon,
      trendType: 'positive', // 安全事件减少是正面趋势
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
