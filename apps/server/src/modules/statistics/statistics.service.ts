import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { format } from 'date-fns'

import { Prisma } from '#prisma/client'
import { processTimeSeriesData } from '~/common/utils/date-processor.util'

import {
  AccessStatisticsQueryDto,
  LicenseStatisticsQueryDto,
  RevenueStatisticsQueryDto,
  UserStatisticsQueryDto,
} from './dto/statistics-query.dto'
import {
  AccessStatisticsDto,
  ConversionFunnelDto,
  DashboardOverviewDto,
  DistributionDataDto,
  FunnelStageDto,
  LicenseStatisticsDto,
  LicenseTrendDto,
  RealtimeMonitoringDto,
  RevenueStatisticsDto,
  RiskAnalysisDto,
  TimeSeriesDataPointDto,
  UserStatisticsDto,
} from './dto/statistics-response.dto'
import { StatisticsRepository } from './statistics.repository'

@Injectable()
export class StatisticsService {
  constructor(
    private readonly statsRepository: StatisticsRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取用户概览统计
   */
  async getUserOverview(query: UserStatisticsQueryDto) {
    const rawData = await this.statsRepository.getUserStatisticsRawData(query)

    // 计算新增用户数（这里简化为总用户数，实际应该基于时间范围）
    const newUsers = rawData.totalUsers

    // 处理用户增长趋势数据
    const growthTrend: TimeSeriesDataPointDto[] = this.processDateGroupedData(
      rawData.usersByDate,
      query.startDate,
      query.endDate,
    )

    // 处理用户状态分布 - 只返回业务数据
    const statusDistribution: DistributionDataDto[] = rawData.userStatusDistribution.map(
      (item) => ({
        key: item.isActive ? 'active' : 'inactive',
        value: item._count.id,
        metadata: {
          isActive: item.isActive,
        },
      }),
    )

    const userStats: UserStatisticsDto = {
      totalUsers: rawData.totalUsers,
      activeUsers: rawData.activeUsers,
      newUsers,
      growthTrend,
      statusDistribution,
    }

    return userStats
  }

  /**
   * 获取用户活跃度统计
   */
  async getUserActivity(query: UserStatisticsQueryDto) {
    // 这里可以添加更复杂的活跃度计算逻辑
    return this.getUserOverview(query)
  }

  /**
   * 获取用户地理分布
   */
  async getUserGeoDistribution(query: UserStatisticsQueryDto) {
    // 这里需要基于访问日志的IP地址进行地理位置分析
    // 暂时返回基础用户统计
    return this.getUserOverview(query)
  }

  /**
   * 获取授权码概览统计
   */
  async getLicenseOverview(query: LicenseStatisticsQueryDto) {
    const rawData = await this.statsRepository.getLicenseStatisticsRawData(query)

    // 处理授权码生成趋势
    const generationTrend: TimeSeriesDataPointDto[] = this.processDateGroupedData(
      rawData.licensesByDate,
      query.startDate,
      query.endDate,
    )

    // 处理状态分布 - 只返回业务数据
    const statusDistribution: DistributionDataDto[] = this.processLicenseStatusDistribution(
      rawData.licenseStatusDistribution,
    )

    const licenseStats: LicenseStatisticsDto = {
      totalLicenses: rawData.totalLicenses,
      usedLicenses: rawData.usedLicenses,
      lockedLicenses: rawData.lockedLicenses,
      expiredLicenses: rawData.expiredLicenses,
      statusDistribution,
      generationTrend,
    }

    return licenseStats
  }

  /**
   * 获取授权码使用分析
   */
  async getLicenseUsage(query: LicenseStatisticsQueryDto) {
    return this.getLicenseOverview(query)
  }

  /**
   * 获取授权码趋势分析
   * 提供指定日期范围内每日新增授权码数量的趋势数据
   */
  async getLicenseTrend(query: LicenseStatisticsQueryDto): Promise<LicenseTrendDto> {
    // 获取原始数据
    const rawData = await this.statsRepository.getLicenseStatisticsRawData(query)

    // 处理每日新增趋势数据
    const dailyTrend: TimeSeriesDataPointDto[] = this.processDateGroupedData(
      rawData.licensesByDate,
      query.startDate,
      query.endDate,
    )

    // 计算统计指标
    const totalNewLicenses = dailyTrend.reduce((sum, item) => sum + item.value, 0)
    const totalDays = dailyTrend.length || 1
    const averageDailyNew = Number((totalNewLicenses / totalDays).toFixed(2))
    const peakDailyNew = Math.max(...dailyTrend.map((item) => item.value), 0)

    // 计算统计周期信息
    const startDate = query.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 默认30天前
    const endDate = query.endDate ?? new Date()
    const periodInfo = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDays,
    }

    const licenseTrend: LicenseTrendDto = {
      dailyTrend,
      totalNewLicenses,
      averageDailyNew,
      peakDailyNew,
      periodInfo,
    }

    return licenseTrend
  }

  /**
   * 获取收入统计
   * 提供指定日期范围内每日收入数据的趋势分析
   */
  async getRevenue(query: RevenueStatisticsQueryDto) {
    const rawData = await this.statsRepository.getRevenueStatisticsRawData(query)

    // 处理收入趋势数据 - 使用统一的日期处理方法确保连续性
    const revenueTrend: TimeSeriesDataPointDto[] = this.processRevenueGroupedData(
      rawData.revenueByDate,
      query.startDate,
      query.endDate,
    )

    const totalRevenue = Number(rawData.revenueAggregate._sum.purchaseAmount) || 0

    const revenueStats: RevenueStatisticsDto = {
      totalRevenue,
      averageOrderValue: Number(rawData.revenueAggregate._avg.purchaseAmount) || 0,
      revenueTrend,
    }

    return revenueStats
  }

  /**
   * 获取访问量统计
   */
  async getAccessVolume(query: AccessStatisticsQueryDto) {
    const rawData = await this.statsRepository.getAccessStatisticsRawData(query)

    // 处理访问趋势
    const accessTrend: TimeSeriesDataPointDto[] = rawData.accessByDate.map((item) => ({
      timestamp: item.accessed_date,
      value: item.count,
    }))

    // 处理小时分布 - 只返回业务数据
    const hourlyDistribution: DistributionDataDto[] = this.processHourlyDistribution(
      rawData.accessByHour,
    )

    // 处理地理分布 - 只返回业务数据
    const geoDistribution: DistributionDataDto[] = rawData.geoDistribution.map((item) => ({
      key: item.region,
      value: item.count,
      metadata: {
        region: item.region,
        totalAccess: rawData.totalAccess,
      },
    }))

    const accessStats: AccessStatisticsDto = {
      totalAccess: rawData.totalAccess,
      uniqueVisitors: rawData.uniqueVisitors,
      riskyAccess: rawData.riskyAccess,
      accessTrend,
      hourlyDistribution,
      geoDistribution,
    }

    return accessStats
  }

  /**
   * 获取风险访问分析
   */
  async getRiskAnalysis(query: AccessStatisticsQueryDto) {
    const rawData = await this.statsRepository.getRiskAnalysisRawData(query)

    // 计算风险访问比例 - 保留业务计算
    const riskAccessRatio = rawData.totalAccess > 0
      ? rawData.riskyAccess / rawData.totalAccess * 100
      : 0

    // 处理风险类型分布 - 只返回业务数据
    const riskTypeDistribution: DistributionDataDto[] = rawData.riskTypeDistribution.map(
      (item) => ({
        key: item.isRisky ? 'risky' : 'normal',
        value: item._count.id,
        metadata: {
          isRisky: item.isRisky,
          totalAccess: rawData.totalAccess,
        },
      }),
    )

    const riskAnalysis: RiskAnalysisDto = {
      riskAccessRatio,
      riskTypeDistribution,
      ipAnomalyStats: {
        multiIpLicenses: rawData.multiIpLicenses,
        suspiciousIps: rawData.suspiciousIps,
      },
      riskControlEffectiveness: {
        detectionRate: riskAccessRatio, // 简化处理
        falsePositiveRate: 0, // 需要更复杂的计算
      },
    }

    return riskAnalysis
  }

  /**
   * 获取设备和网络分析
   */
  async getDeviceNetworkAnalysis(query: AccessStatisticsQueryDto) {
    return this.getAccessVolume(query)
  }

  /**
   * 获取转化漏斗分析
   */
  async getConversionFunnel(query: UserStatisticsQueryDto): Promise<ConversionFunnelDto> {
    const rawData = await this.statsRepository.getConversionFunnelData(query)

    const stages = [
      {
        stageKey: 'license_obtained',
        count: rawData.totalLicenses,
        order: 1,
      },
      {
        stageKey: 'license_used',
        count: rawData.usedLicenses,
        order: 2,
      },
      {
        stageKey: 'user_active',
        count: rawData.activeUsers,
        order: 3,
      },
    ] as FunnelStageDto[]

    const conversionFunnel: ConversionFunnelDto = {
      stages,
      conversionPath: {
        totalEntries: rawData.totalLicenses,
        finalConversions: rawData.activeUsers,
      },
    }

    return conversionFunnel
  }

  /**
   * 获取客户价值分析
   */
  async getCustomerValue(query: RevenueStatisticsQueryDto) {
    return this.getRevenue(query)
  }

  /**
   * 获取产品性能指标
   */
  async getPerformance() {
    return this.getRealtimeDashboard()
  }

  /**
   * 获取安全事件统计
   */
  async getSecurityEvents(query: AccessStatisticsQueryDto) {
    return this.getRiskAnalysis(query)
  }

  /**
   * 获取风控效果评估
   */
  async getRiskControl(query: AccessStatisticsQueryDto) {
    return this.getRiskAnalysis(query)
  }

  /**
   * 获取实时数据监控
   */
  async getRealtimeDashboard() {
    const rawData = await this.statsRepository.getRealtimeData()

    const realtimeData: RealtimeMonitoringDto = {
      currentOnlineUsers: 0, // 需要实现在线用户统计
      realtimeAccess: rawData.recentAccess,
      todayRevenue: Number(rawData.todayRevenue),
      systemStatus: {
        serviceStatus: rawData.systemHealth.status,
        databaseStatus: rawData.systemHealth.status === 'healthy' ? 'connected' : 'disconnected',
        lastUpdated: new Date().toISOString(),
      },
    }

    return realtimeData
  }

  /**
   * 获取异常告警数据
   */
  async getRealtimeAlerts() {
    return this.getRealtimeDashboard()
  }

  /**
   * 处理按日期分组的数据，将原始数据转换为时间序列数据点
   * 使用统一的日期处理工具类确保时区处理的准确性和一致性
   * 确保时间序列的完整性，即使某天数据为零也包含占位符
   * 自动处理默认时间范围：如果未提供日期参数，默认使用30天的时间范围
   * @param data 原始数据数组
   * @param startDate 开始日期（可选，用于填充完整时间序列）
   * @param endDate 结束日期（可选，用于填充完整时间序列）
   * @param timezone 目标时区，默认从配置中读取
   * @returns 时间序列数据点数组
   * @throws BusinessException 当 endDate 早于 startDate 时抛出异常
   */
  private processDateGroupedData(
    data: { createdAt: Date, _count: { id: number } }[],
    startDate?: Date,
    endDate?: Date,
    timezone = this.configService.get<string>('app.timezone', 'Asia/Shanghai'),
  ): TimeSeriesDataPointDto[] {
    return processTimeSeriesData(
      data,
      {
        startDate,
        endDate,
        timezone,
        defaultRangeDays: 30,
      },
      (item: { _count: { id: number } }) => item._count.id,
    )
  }

  /**
   * 处理收入数据的日期分组
   * 使用统一的日期处理工具类确保指定日期范围内的收入趋势数据连续性和完整性
   */
  private processRevenueGroupedData(
    data: {
      createdAt: Date
      _sum: { purchaseAmount: Prisma.Decimal | null }
      _count: { id: number }
    }[],
    startDate?: Date,
    endDate?: Date,
    timezone = this.configService.get<string>('app.timezone', 'Asia/Shanghai'),
  ): TimeSeriesDataPointDto[] {
    return processTimeSeriesData(
      data,
      {
        startDate,
        endDate,
        timezone,
        defaultRangeDays: 30,
      },
      (item: {
        createdAt: Date
        _sum: { purchaseAmount: Prisma.Decimal | null }
        _count: { id: number }
      }) => Number(item._sum.purchaseAmount?.toNumber()) || 0,
    )
  }

  /**
   * 处理授权码状态分布 - 只返回业务数据
   */
  private processLicenseStatusDistribution(
    data: { isUsed: boolean, locked: boolean, isExpired: boolean, _count: { id: number } }[],
  ): DistributionDataDto[] {
    const statusMap = new Map<string, { value: number, metadata: Record<string, unknown> }>()

    data.forEach((item) => {
      let statusKey = 'normal'

      if (item.locked) {
        statusKey = 'locked'
      }
      else if (item.isExpired) {
        statusKey = 'expired'
      }
      else if (item.isUsed) {
        statusKey = 'used'
      }
      else {
        statusKey = 'unused'
      }

      const current = statusMap.get(statusKey) ?? { value: 0, metadata: {} }
      statusMap.set(statusKey, {
        value: current.value + item._count.id,
        metadata: {
          isUsed: item.isUsed,
          locked: item.locked,
          isExpired: item.isExpired,
        },
      })
    })

    return Array.from(statusMap.entries()).map(([key, data]) => ({
      key,
      value: data.value,
      metadata: data.metadata,
    }))
  }

  /**
   * 处理小时分布数据 - 只返回业务数据
   */
  private processHourlyDistribution(
    data: { hour: number, count: number }[],
  ): DistributionDataDto[] {
    // 创建24小时的完整数据
    return Array.from({ length: 24 }, (_, hour) => {
      const hourData = data.find((item) => item.hour === hour)

      return {
        key: hour.toString(),
        value: hourData?.count ?? 0,
        metadata: {
          hour,
          timeRange: `${hour}:00-${hour + 1}:00`,
        },
      }
    })
  }

  /**
   * 获取仪表盘概览统计
   * 提供已有授权码用户总数和授权码总收入，以及增长率计算
   * 包含完整的时间序列数据，确保即使某天数据为零也包含占位符
   */
  async getDashboardOverview(): Promise<DashboardOverviewDto> {
    // 计算当前周期（最近30天）和上一周期（前30天）的时间范围
    const now = new Date()
    const currentPeriodEnd = now
    const currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30天前
    const previousPeriodEnd = currentPeriodStart
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - 30 * 24 * 60 * 60 * 1000) // 60天前

    // 获取原始数据（包含时间序列数据）
    const rawData = await this.statsRepository.getDashboardOverviewRawData(
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    )

    // 计算增长率
    const userGrowthRate = this.calculateGrowthRate(
      rawData.current.totalLicenseUsers,
      rawData.previous.totalLicenseUsers,
    )

    const revenueGrowthRate = this.calculateGrowthRate(
      rawData.current.totalRevenue,
      rawData.previous.totalRevenue,
    )

    // 处理时间序列数据，确保完整性
    const userTimeSeries = this.processDateGroupedData(
      rawData.current.userTimeSeriesData,
      currentPeriodStart,
      currentPeriodEnd,
    )

    const revenueTimeSeries = this.processDateGroupedData(
      rawData.current.revenueTimeSeriesData,
      currentPeriodStart,
      currentPeriodEnd,
    )

    // 构建响应数据
    const dashboardOverview: DashboardOverviewDto = {
      totalLicenseUsers: rawData.current.totalLicenseUsers,
      totalLicenseRevenue: rawData.current.totalRevenue,
      userGrowthRate: Number(userGrowthRate.toFixed(1)),
      revenueGrowthRate: Number(revenueGrowthRate.toFixed(1)),
      userTimeSeries,
      revenueTimeSeries,
      periodInfo: {
        currentPeriod: `${format(currentPeriodStart, 'yyyy-MM-dd')} 至 ${format(currentPeriodEnd, 'yyyy-MM-dd')}`,
        previousPeriod: `${format(previousPeriodStart, 'yyyy-MM-dd')} 至 ${format(previousPeriodEnd, 'yyyy-MM-dd')}`,
        lastUpdated: now.toISOString(),
      },
    }

    return dashboardOverview
  }

  /**
   * 计算增长率
   * @param current 当前值
   * @param previous 上期值
   * @returns 增长率（百分比）
   */
  private calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0
    }

    return (current - previous) / previous * 100
  }
}
