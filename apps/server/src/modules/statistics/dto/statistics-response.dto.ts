import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { StandardResponseDto } from '~/common/dto/standard-response.dto'

/**
 * 时间序列数据点 DTO
 */
export class TimeSeriesDataPointDto {
  @ApiProperty({ description: '时间标签', example: '2024-01-01T00:00:00.000Z' })
  readonly timestamp!: string

  @ApiProperty({ description: '数值', example: 100 })
  readonly value!: number

  @ApiPropertyOptional({ description: '额外的数据属性' })
  readonly metadata?: Record<string, unknown>
}

/**
 * 分布数据 DTO - 纯业务数据，不包含展示相关字段
 */
export class DistributionDataDto {
  @ApiProperty({ description: '分类键值', example: 'active' })
  readonly key!: string

  @ApiProperty({ description: '数值', example: 1500 })
  readonly value!: number

  @ApiPropertyOptional({ description: '额外的业务属性' })
  readonly metadata?: Record<string, unknown>
}

/**
 * 对比数据 DTO - 纯业务数据对比
 */
export class ComparisonDataDto {
  @ApiProperty({ description: '当前期间值', example: 150 })
  readonly currentValue!: number

  @ApiProperty({ description: '对比期间值', example: 130 })
  readonly previousValue!: number

  @ApiPropertyOptional({ description: '对比期间信息' })
  periodInfo?: {
    currentPeriod: string
    previousPeriod: string
  }
}

/**
 * 用户统计响应 DTO
 */
export class UserStatisticsDto {
  @ApiProperty({ description: '总用户数' })
  readonly totalUsers!: number

  @ApiProperty({ description: '活跃用户数' })
  readonly activeUsers!: number

  @ApiProperty({ description: '新增用户数' })
  readonly newUsers!: number

  @ApiProperty({ description: '用户增长趋势', type: [TimeSeriesDataPointDto] })
  readonly growthTrend!: TimeSeriesDataPointDto[]

  @ApiProperty({ description: '用户状态分布', type: [DistributionDataDto] })
  readonly statusDistribution!: DistributionDataDto[]
}

/**
 * 授权码统计响应 DTO
 */
export class LicenseStatisticsDto {
  @ApiProperty({ description: '总授权码数', example: 5000 })
  readonly totalLicenses!: number

  @ApiProperty({ description: '已使用授权码数', example: 3200 })
  readonly usedLicenses!: number

  @ApiProperty({ description: '锁定授权码数', example: 50 })
  readonly lockedLicenses!: number

  @ApiProperty({ description: '过期授权码数', example: 300 })
  readonly expiredLicenses!: number

  @ApiProperty({ description: '状态分布', type: [DistributionDataDto] })
  readonly statusDistribution!: DistributionDataDto[]

  @ApiProperty({ description: '生成趋势', type: [TimeSeriesDataPointDto] })
  readonly generationTrend!: TimeSeriesDataPointDto[]
}

/**
 * 授权码趋势统计响应 DTO
 */
export class LicenseTrendDto {
  @ApiProperty({ description: '每日新增授权码趋势数据', type: [TimeSeriesDataPointDto] })
  readonly dailyTrend!: TimeSeriesDataPointDto[]

  @ApiProperty({ description: '统计周期内总新增数量', example: 1250 })
  readonly totalNewLicenses!: number

  @ApiProperty({ description: '日均新增数量', example: 41.67 })
  readonly averageDailyNew!: number

  @ApiProperty({ description: '最高单日新增数量', example: 85 })
  readonly peakDailyNew!: number

  @ApiProperty({ description: '统计周期信息' })
  periodInfo!: {
    startDate: string
    endDate: string
    totalDays: number
  }
}

/**
 * 收入统计响应 DTO
 */
export class RevenueStatisticsDto {
  @ApiProperty({ description: '总收入', example: 150000.50 })
  readonly totalRevenue!: number

  @ApiProperty({ description: '平均客单价', example: 35.75 })
  readonly averageOrderValue!: number

  @ApiProperty({ description: '收入趋势', type: [TimeSeriesDataPointDto] })
  readonly revenueTrend!: TimeSeriesDataPointDto[]
}

/**
 * 访问统计响应 DTO
 */
export class AccessStatisticsDto {
  @ApiProperty({ description: '总访问量', example: 50000 })
  readonly totalAccess!: number

  @ApiProperty({ description: '独立访问者数', example: 3200 })
  readonly uniqueVisitors!: number

  @ApiProperty({ description: '风险访问数', example: 120 })
  readonly riskyAccess!: number

  @ApiProperty({ description: '访问趋势', type: [TimeSeriesDataPointDto] })
  readonly accessTrend!: TimeSeriesDataPointDto[]

  @ApiProperty({ description: '小时分布（24小时）', type: [DistributionDataDto] })
  readonly hourlyDistribution!: DistributionDataDto[]

  @ApiProperty({ description: '地理分布', type: [DistributionDataDto] })
  readonly geoDistribution!: DistributionDataDto[]
}

/**
 * 实时监控响应 DTO
 */
export class RealtimeMonitoringDto {
  @ApiProperty({ description: '当前在线用户数', example: 25 })
  readonly currentOnlineUsers!: number

  @ApiProperty({ description: '实时访问量（最近5分钟）', example: 45 })
  readonly realtimeAccess!: number

  @ApiProperty({ description: '实时收入（今日）', example: 1250.00 })
  readonly todayRevenue!: number

  @ApiProperty({ description: '系统状态' })
  systemStatus!: {
    serviceStatus: 'healthy' | 'warning' | 'error'
    databaseStatus: 'connected' | 'disconnected'
    lastUpdated: string
  }
}

/**
 * 风控分析响应 DTO
 */
export class RiskAnalysisDto {
  @ApiProperty({ description: '风险访问比例', example: 2.4 })
  readonly riskAccessRatio!: number

  @ApiProperty({ description: '风险类型分布', type: [DistributionDataDto] })
  readonly riskTypeDistribution!: DistributionDataDto[]

  @ApiProperty({ description: 'IP异常统计' })
  ipAnomalyStats!: {
    multiIpLicenses: number
    suspiciousIps: number
  }

  @ApiProperty({ description: '风控效果评估' })
  riskControlEffectiveness!: {
    detectionRate: number
    falsePositiveRate: number
  }
}

/**
 * 转化漏斗阶段数据 DTO
 */
export class FunnelStageDto {
  @ApiProperty({ description: '阶段标识符', example: 'license_obtained' })
  readonly stageKey!: string

  @ApiProperty({ description: '阶段数量', example: 1000 })
  readonly count!: number

  @ApiProperty({ description: '阶段顺序', example: 1 })
  readonly order!: number
}

/**
 * 转化漏斗分析响应 DTO
 */
export class ConversionFunnelDto {
  @ApiProperty({ description: '漏斗各阶段数据', type: [FunnelStageDto] })
  readonly stages!: FunnelStageDto[]

  @ApiProperty({ description: '转化路径信息' })
  conversionPath!: {
    totalEntries: number
    finalConversions: number
  }
}

/**
 * 用户统计响应 DTO
 */
export class UserStatisticsResponseDto extends StandardResponseDto<UserStatisticsDto> {
  @ApiProperty({
    description: '用户统计数据',
    type: UserStatisticsDto,
  })
  declare data: UserStatisticsDto
}

/**
 * 授权码统计响应 DTO
 */
export class LicenseStatisticsResponseDto extends StandardResponseDto<LicenseStatisticsDto> {
  @ApiProperty({
    description: '授权码统计数据',
    type: LicenseStatisticsDto,
  })
  declare data: LicenseStatisticsDto
}

/**
 * 收入统计响应 DTO
 */
export class RevenueStatisticsResponseDto extends StandardResponseDto<RevenueStatisticsDto> {
  @ApiProperty({
    description: '收入统计数据',
    type: RevenueStatisticsDto,
  })
  declare data: RevenueStatisticsDto
}

/**
 * 访问统计响应 DTO
 */
export class AccessStatisticsResponseDto extends StandardResponseDto<AccessStatisticsDto> {
  @ApiProperty({
    description: '访问统计数据',
    type: AccessStatisticsDto,
  })
  declare data: AccessStatisticsDto
}

/**
 * 实时监控响应 DTO
 */
export class RealtimeMonitoringResponseDto extends StandardResponseDto<RealtimeMonitoringDto> {
  @ApiProperty({
    description: '实时监控数据',
    type: RealtimeMonitoringDto,
  })
  declare data: RealtimeMonitoringDto
}

/**
 * 风控分析响应 DTO
 */
export class RiskAnalysisResponseDto extends StandardResponseDto<RiskAnalysisDto> {
  @ApiProperty({
    description: '风控分析数据',
    type: RiskAnalysisDto,
  })
  declare data: RiskAnalysisDto
}

/**
 * 转化漏斗分析响应 DTO
 */
export class ConversionFunnelResponseDto extends StandardResponseDto<ConversionFunnelDto> {
  @ApiProperty({
    description: '转化漏斗分析数据',
    type: ConversionFunnelDto,
  })
  declare data: ConversionFunnelDto
}

/**
 * 授权码趋势统计响应包装 DTO
 */
export class LicenseTrendResponseDto extends StandardResponseDto<LicenseTrendDto> {
  @ApiProperty({
    description: '授权码趋势统计数据',
    type: LicenseTrendDto,
  })
  declare data: LicenseTrendDto
}

/**
 * 仪表盘概览统计响应 DTO
 */
export class DashboardOverviewDto {
  @ApiProperty({ description: '已有授权码用户总数', example: 892 })
  totalLicenseUsers!: number

  @ApiProperty({ description: '授权码总收入（元）', example: 28560.00 })
  totalLicenseRevenue!: number

  @ApiProperty({ description: '用户数增长率（%）', example: 12.8 })
  userGrowthRate!: number

  @ApiProperty({ description: '收入增长率（%）', example: 18.5 })
  revenueGrowthRate!: number

  @ApiProperty({ description: '用户数时间序列数据', type: [TimeSeriesDataPointDto] })
  userTimeSeries!: TimeSeriesDataPointDto[]

  @ApiProperty({ description: '收入时间序列数据', type: [TimeSeriesDataPointDto] })
  revenueTimeSeries!: TimeSeriesDataPointDto[]

  @ApiProperty({ description: '统计周期信息' })
  periodInfo!: {
    currentPeriod: string
    previousPeriod: string
    lastUpdated: string
  }
}

/**
 * 仪表盘概览统计响应包装 DTO
 */
export class DashboardOverviewResponseDto extends StandardResponseDto<DashboardOverviewDto> {
  @ApiProperty({
    description: '仪表盘概览统计数据',
    type: DashboardOverviewDto,
  })
  declare data: DashboardOverviewDto
}
