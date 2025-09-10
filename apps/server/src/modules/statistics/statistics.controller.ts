import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AdminGuard } from '~/common/guards/admin.guard'
import { resp } from '~/common/utils/response.util'
import { STATISTICS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'

import {
  AccessStatisticsQueryDto,
  LicenseStatisticsQueryDto,
  RevenueStatisticsQueryDto,
  UserStatisticsQueryDto,
} from './dto/statistics-query.dto'
import {
  AccessStatisticsDto,
  AccessStatisticsResponseDto,
  ConversionFunnelDto,
  ConversionFunnelResponseDto,
  DashboardOverviewDto,
  DashboardOverviewResponseDto,
  LicenseStatisticsDto,
  LicenseStatisticsResponseDto,
  LicenseTrendDto,
  LicenseTrendResponseDto,
  RealtimeMonitoringDto,
  RealtimeMonitoringResponseDto,
  RevenueStatisticsDto,
  RevenueStatisticsResponseDto,
  RiskAnalysisDto,
  RiskAnalysisResponseDto,
  UserStatisticsDto,
  UserStatisticsResponseDto,
} from './dto/statistics-response.dto'
import { StatisticsService } from './statistics.service'

@ApiTags('统计信息')
@Controller('statistics')
@UseGuards(AdminGuard)
export class StatisticsController {
  constructor(private readonly statsService: StatisticsService) {}

  @Get('dashboard/overview')
  @ApiDocs(STATISTICS_API_CONFIG.getDashboardOverview)
  async getDashboardOverview(): Promise<DashboardOverviewResponseDto> {
    const result = await this.statsService.getDashboardOverview()

    return resp({
      data: result,
      dto: DashboardOverviewDto,
    })
  }

  @Get('users/overview')
  @ApiDocs(STATISTICS_API_CONFIG.getUserOverview)
  async getUserOverview(
    @Query() query: UserStatisticsQueryDto,
  ): Promise<UserStatisticsResponseDto> {
    const result = await this.statsService.getUserOverview(query)

    return resp({
      data: result,
      dto: UserStatisticsDto,
      msg: '用户概览统计获取成功',
    })
  }

  /**
   * 获取用户活跃度统计
   */
  @Get('users/activity')
  @ApiDocs(STATISTICS_API_CONFIG.getUserActivity)
  async getUserActivity(
    @Query() query: UserStatisticsQueryDto,
  ): Promise<UserStatisticsResponseDto> {
    const result = await this.statsService.getUserActivity(query)

    return resp({
      data: result,
      dto: UserStatisticsDto,
      msg: '用户活跃度统计获取成功',
    })
  }

  /**
   * 获取用户地理分布
   */
  @Get('users/geo-distribution')
  @ApiDocs(STATISTICS_API_CONFIG.getUserGeoDistribution)
  async getUserGeoDistribution(
    @Query() query: UserStatisticsQueryDto,
  ): Promise<UserStatisticsResponseDto> {
    const result = await this.statsService.getUserGeoDistribution(query)

    return resp({
      data: result,
      dto: UserStatisticsDto,
      msg: '用户地理分布获取成功',
    })
  }

  /**
   * 获取授权码概览统计
   */
  @Get('licenses/overview')
  @ApiDocs(STATISTICS_API_CONFIG.getLicenseOverview)
  async getLicenseOverview(
    @Query() query: LicenseStatisticsQueryDto,
  ): Promise<LicenseStatisticsResponseDto> {
    const result = await this.statsService.getLicenseOverview(query)

    return resp({
      data: result,
      dto: LicenseStatisticsDto,
      msg: '授权码概览统计获取成功',
    })
  }

  @Get('licenses/usage')
  @ApiDocs(STATISTICS_API_CONFIG.getLicenseUsage)
  async getLicenseUsage(
    @Query() query: LicenseStatisticsQueryDto,
  ): Promise<LicenseStatisticsResponseDto> {
    const result = await this.statsService.getLicenseUsage(query)

    return resp({
      data: result,
      dto: LicenseStatisticsDto,
      msg: '授权码使用分析获取成功',
    })
  }

  /**
   * 获取授权码趋势分析
   */
  @Get('licenses/trend')
  @ApiDocs(STATISTICS_API_CONFIG.getLicenseTrend)
  async getLicenseTrend(
    @Query() query: LicenseStatisticsQueryDto,
  ): Promise<LicenseTrendResponseDto> {
    const result = await this.statsService.getLicenseTrend(query)

    return resp({
      data: result,
      dto: LicenseTrendDto,
      msg: '授权码趋势分析获取成功',
    })
  }

  @Get('licenses/revenue')
  @ApiDocs(STATISTICS_API_CONFIG.getRevenue)
  async getRevenue(
    @Query() query: RevenueStatisticsQueryDto,
  ): Promise<RevenueStatisticsResponseDto> {
    const result = await this.statsService.getRevenue(query)

    return resp({
      data: result,
      dto: RevenueStatisticsDto,
      msg: '收入统计获取成功',
    })
  }

  /**
   * 获取访问量统计
   */
  @Get('access/volume')
  @ApiDocs(STATISTICS_API_CONFIG.getAccessVolume)
  async getAccessVolume(
    @Query() query: AccessStatisticsQueryDto,
  ): Promise<AccessStatisticsResponseDto> {
    const result = await this.statsService.getAccessVolume(query)

    return resp({
      data: result,
      dto: AccessStatisticsDto,
      msg: '访问量统计获取成功',
    })
  }

  /**
   * 获取风险访问分析
   */
  @Get('access/risk-analysis')
  @ApiDocs(STATISTICS_API_CONFIG.getRiskAnalysis)
  async getRiskAnalysis(
    @Query() query: AccessStatisticsQueryDto,
  ): Promise<RiskAnalysisResponseDto> {
    const result = await this.statsService.getRiskAnalysis(query)

    return resp({
      data: result,
      dto: RiskAnalysisDto,
      msg: '风险访问分析获取成功',
    })
  }

  /**
   * 获取设备和网络分析
   */
  @Get('access/device-network')
  @ApiDocs(STATISTICS_API_CONFIG.getDeviceNetworkAnalysis)
  async getDeviceNetworkAnalysis(
    @Query() query: AccessStatisticsQueryDto,
  ): Promise<AccessStatisticsResponseDto> {
    const result = await this.statsService.getDeviceNetworkAnalysis(query)

    return resp({
      data: result,
      dto: AccessStatisticsDto,
      msg: '设备和网络分析获取成功',
    })
  }

  /**
   * 获取转化漏斗分析
   */
  @Get('business/conversion-funnel')
  @ApiDocs(STATISTICS_API_CONFIG.getConversionFunnel)
  async getConversionFunnel(
    @Query() query: UserStatisticsQueryDto,
  ): Promise<ConversionFunnelResponseDto> {
    const result = await this.statsService.getConversionFunnel(query)

    return resp({
      data: result,
      dto: ConversionFunnelDto,
      msg: '转化漏斗分析获取成功',
    })
  }

  /**
   * 获取客户价值分析
   */
  @Get('business/customer-value')
  @ApiDocs(STATISTICS_API_CONFIG.getCustomerValue)
  async getCustomerValue(
    @Query() query: RevenueStatisticsQueryDto,
  ): Promise<RevenueStatisticsResponseDto> {
    const result = await this.statsService.getCustomerValue(query)

    return resp({
      data: result,
      dto: RevenueStatisticsDto,
      msg: '客户价值分析获取成功',
    })
  }

  /**
   * 获取产品性能指标
   */
  @Get('business/performance')
  @ApiDocs(STATISTICS_API_CONFIG.getPerformance)
  async getPerformance(): Promise<RealtimeMonitoringResponseDto> {
    const result = await this.statsService.getPerformance()

    return resp({
      data: result,
      dto: RealtimeMonitoringDto,
      msg: '产品性能指标获取成功',
    })
  }

  /**
   * 获取安全事件统计
   */
  @Get('security/events')
  @ApiDocs(STATISTICS_API_CONFIG.getSecurityEvents)
  async getSecurityEvents(
    @Query() query: AccessStatisticsQueryDto,
  ): Promise<RiskAnalysisResponseDto> {
    const result = await this.statsService.getSecurityEvents(query)

    return resp({
      data: result,
      dto: RiskAnalysisDto,
      msg: '安全事件统计获取成功',
    })
  }

  /**
   * 获取风控效果评估
   */
  @Get('security/risk-control')
  @ApiDocs(STATISTICS_API_CONFIG.getRiskControl)
  async getRiskControl(
    @Query() query: AccessStatisticsQueryDto,
  ): Promise<RiskAnalysisResponseDto> {
    const result = await this.statsService.getRiskControl(query)

    return resp({
      data: result,
      dto: RiskAnalysisDto,
      msg: '风控效果评估获取成功',
    })
  }

  /**
   * 获取实时数据监控
   */
  @Get('realtime/dashboard')
  @ApiDocs(STATISTICS_API_CONFIG.getRealtimeDashboard)
  async getRealtimeDashboard(): Promise<RealtimeMonitoringResponseDto> {
    const result = await this.statsService.getRealtimeDashboard()

    return resp({
      data: result,
      dto: RealtimeMonitoringDto,
      msg: '实时数据监控获取成功',
    })
  }

  /**
   * 获取异常告警数据
   */
  @Get('realtime/alerts')
  @ApiDocs(STATISTICS_API_CONFIG.getRealtimeAlerts)
  async getRealtimeAlerts(): Promise<RealtimeMonitoringResponseDto> {
    const result = await this.statsService.getRealtimeAlerts()

    return resp({
      data: result,
      dto: RealtimeMonitoringDto,
      msg: '异常告警数据获取成功',
    })
  }
}
