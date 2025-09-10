import { Injectable } from '@nestjs/common'

import { Prisma } from '#prisma/client'
import { PrismaService } from '~/prisma/prisma.service'

import {
  AccessStatisticsQueryDto,
  LicenseStatisticsQueryDto,
  RevenueStatisticsQueryDto,
  UserStatisticsQueryDto,
} from './dto/statistics-query.dto'

@Injectable()
export class StatisticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户统计的原始数据
   */
  async getUserStatisticsRawData(query: UserStatisticsQueryDto) {
    const { startDate, endDate, userStatus } = query

    // 构建基础查询条件
    const baseWhere: Prisma.UserWhereInput = {}

    // 添加日期过滤
    if (startDate || endDate) {
      baseWhere.createdAt = {}

      if (startDate) {
        baseWhere.createdAt.gte = new Date(startDate)
      }

      if (endDate) {
        baseWhere.createdAt.lte = new Date(endDate)
      }
    }

    // 添加用户状态过滤
    if (userStatus && userStatus !== 'all') {
      baseWhere.isActive = userStatus === 'active'
    }

    // 并行执行多个查询
    const [totalUsers, activeUsers, usersByDate, userStatusDistribution] = await Promise.all([
      // 总用户数
      this.prisma.user.count({ where: baseWhere }),

      // 活跃用户数
      this.prisma.user.count({
        where: { ...baseWhere, isActive: true },
      }),

      // 按日期分组的用户数量（用于趋势分析）
      this.prisma.user.groupBy({
        by: ['createdAt'],
        where: baseWhere,
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),

      // 用户状态分布
      this.prisma.user.groupBy({
        by: ['isActive'],
        where: baseWhere,
        _count: { id: true },
      }),
    ])

    return {
      totalUsers,
      activeUsers,
      usersByDate,
      userStatusDistribution,
    }
  }

  /**
   * 获取授权码统计的原始数据
   */
  async getLicenseStatisticsRawData(query: LicenseStatisticsQueryDto) {
    const { startDate, endDate, licenseStatus, minAmount, maxAmount } = query

    // 构建基础查询条件
    const baseWhere: Prisma.LicenseWhereInput = {}

    // 添加日期过滤
    if (startDate || endDate) {
      baseWhere.createdAt = {}

      if (startDate) {
        baseWhere.createdAt.gte = new Date(startDate)
      }

      if (endDate) {
        baseWhere.createdAt.lte = new Date(endDate)
      }
    }

    // 添加状态过滤
    if (licenseStatus && licenseStatus !== 'all') {
      switch (licenseStatus) {
        case 'used':
          baseWhere.isUsed = true
          break

        case 'unused':
          baseWhere.isUsed = false
          break

        case 'locked':
          baseWhere.locked = true
          break

        case 'expired':
          baseWhere.isExpired = true
          break
      }
    }

    // 添加金额过滤
    if (minAmount !== undefined || maxAmount !== undefined) {
      baseWhere.purchaseAmount = {}

      if (minAmount !== undefined) {
        baseWhere.purchaseAmount.gte = minAmount
      }

      if (maxAmount !== undefined) {
        baseWhere.purchaseAmount.lte = maxAmount
      }
    }

    // 并行执行多个查询
    const [
      totalLicenses,
      usedLicenses,
      lockedLicenses,
      expiredLicenses,
      licensesByDate,
      licenseStatusDistribution,
      revenueData,
    ] = await Promise.all([
      // 总授权码数
      this.prisma.license.count({ where: baseWhere }),

      // 已使用授权码数
      this.prisma.license.count({
        where: { ...baseWhere, isUsed: true },
      }),

      // 锁定授权码数
      this.prisma.license.count({
        where: { ...baseWhere, locked: true },
      }),

      // 过期授权码数
      this.prisma.license.count({
        where: { ...baseWhere, isExpired: true },
      }),

      // 按日期分组的授权码数量
      this.prisma.license.groupBy({
        by: ['createdAt'],
        where: baseWhere,
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),

      // 状态分布统计
      this.prisma.license.groupBy({
        by: ['isUsed', 'locked', 'isExpired'],
        where: baseWhere,
        _count: { id: true },
      }),

      // 收入相关数据
      this.prisma.license.aggregate({
        where: { ...baseWhere, purchaseAmount: { not: null } },
        _sum: { purchaseAmount: true },
        _avg: { purchaseAmount: true },
        _count: { id: true },
      }),
    ])

    return {
      totalLicenses,
      usedLicenses,
      lockedLicenses,
      expiredLicenses,
      licensesByDate,
      licenseStatusDistribution,
      revenueData,
    }
  }

  /**
   * 获取收入统计的原始数据
   */
  async getRevenueStatisticsRawData(query: RevenueStatisticsQueryDto) {
    const { startDate, endDate } = query

    // 构建基础查询条件
    const baseWhere: Prisma.LicenseWhereInput = {
      purchaseAmount: { not: null },
    }

    // 添加日期过滤
    if (startDate || endDate) {
      baseWhere.createdAt = {}

      if (startDate) {
        baseWhere.createdAt.gte = new Date(startDate)
      }

      if (endDate) {
        baseWhere.createdAt.lte = new Date(endDate)
      }
    }

    // 并行执行多个查询
    const [revenueAggregate, revenueByDate] = await Promise.all([
      // 收入聚合数据
      this.prisma.license.aggregate({
        where: baseWhere,
        _sum: { purchaseAmount: true },
        _avg: { purchaseAmount: true },
        _count: { id: true },
      }),

      // 按日期分组的收入数据
      this.prisma.license.groupBy({
        by: ['createdAt'],
        where: baseWhere,
        _sum: { purchaseAmount: true },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    return {
      revenueAggregate,
      revenueByDate,
    }
  }

  /**
   * 获取访问统计的原始数据
   */
  async getAccessStatisticsRawData(query: AccessStatisticsQueryDto) {
    const { startDate, endDate, onlyRisky, ipAddress, email } = query

    // 构建基础查询条件
    const baseWhere: Prisma.AccessLogWhereInput = {}

    // 添加日期过滤
    if (startDate || endDate) {
      baseWhere.accessedAt = {}

      if (startDate) {
        baseWhere.accessedAt.gte = new Date(startDate)
      }

      if (endDate) {
        baseWhere.accessedAt.lte = new Date(endDate)
      }
    }

    // 添加风险过滤
    if (onlyRisky) {
      baseWhere.isRisky = true
    }

    // 添加IP过滤
    if (ipAddress) {
      baseWhere.ip = ipAddress
    }

    // 添加邮箱过滤
    if (email) {
      baseWhere.email = email
    }

    // 并行执行多个查询
    const [
      totalAccess,
      uniqueVisitors,
      riskyAccess,
      accessByDate,
      accessByHour,
      ipDistribution,
      geoDistribution,
    ] = await Promise.all([
      // 总访问量
      this.prisma.accessLog.count({ where: baseWhere }),

      // 独立访问者数（按IP去重）
      this.prisma.accessLog
        .groupBy({
          by: ['ip'],
          where: baseWhere,
        })
        .then((result) => result.length),

      // 风险访问数
      this.prisma.accessLog.count({
        where: { ...baseWhere, isRisky: true },
      }),

      // 按日期分组的访问量
      this.prisma.$queryRaw<{ accessed_date: string, count: number }[]>`
        SELECT 
          DATE(accessed_at) as accessed_date,
          COUNT(*)::int as count
        FROM access_logs 
        WHERE 1=1
          ${startDate ? Prisma.sql`AND accessed_at >= ${new Date(startDate)}` : Prisma.empty}
          ${endDate ? Prisma.sql`AND accessed_at <= ${new Date(endDate)}` : Prisma.empty}
          ${onlyRisky ? Prisma.sql`AND is_risky = true` : Prisma.empty}
          ${ipAddress ? Prisma.sql`AND ip = ${ipAddress}` : Prisma.empty}
          ${email ? Prisma.sql`AND email = ${email}` : Prisma.empty}
        GROUP BY DATE(accessed_at)
        ORDER BY accessed_date ASC
      `,

      // 按小时分组的访问量
      this.prisma.$queryRaw<{ hour: number, count: number }[]>`
        SELECT 
          EXTRACT(hour FROM accessed_at)::int as hour,
          COUNT(*)::int as count
        FROM access_logs 
        WHERE 1=1
          ${startDate ? Prisma.sql`AND accessed_at >= ${new Date(startDate)}` : Prisma.empty}
          ${endDate ? Prisma.sql`AND accessed_at <= ${new Date(endDate)}` : Prisma.empty}
          ${onlyRisky ? Prisma.sql`AND is_risky = true` : Prisma.empty}
          ${ipAddress ? Prisma.sql`AND ip = ${ipAddress}` : Prisma.empty}
          ${email ? Prisma.sql`AND email = ${email}` : Prisma.empty}
        GROUP BY hour
        ORDER BY hour
      `,

      // IP分布统计
      this.prisma.accessLog.groupBy({
        by: ['ip'],
        where: baseWhere,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20, // 只取前20个IP
      }),

      // 地理分布（这里先用简单的IP分组，实际应该使用IP地理位置服务）
      this.prisma.$queryRaw<{ region: string, count: number }[]>`
        SELECT 
          CASE 
            WHEN ip LIKE '192.168.%' OR ip LIKE '10.%' OR ip LIKE '172.%' THEN '内网'
            WHEN ip LIKE '127.%' THEN '本地'
            ELSE '外网'
          END as region,
          COUNT(*)::int as count
        FROM access_logs 
        WHERE 1=1
          ${startDate ? Prisma.sql`AND accessed_at >= ${new Date(startDate)}` : Prisma.empty}
          ${endDate ? Prisma.sql`AND accessed_at <= ${new Date(endDate)}` : Prisma.empty}
        GROUP BY region
      `,
    ])

    return {
      totalAccess,
      uniqueVisitors,
      riskyAccess,
      accessByDate,
      accessByHour,
      ipDistribution,
      geoDistribution,
    }
  }

  /**
   * 获取风险分析的原始数据
   */
  async getRiskAnalysisRawData(query: AccessStatisticsQueryDto) {
    const { startDate, endDate } = query

    // 构建基础查询条件
    const baseWhere: Prisma.AccessLogWhereInput = {}

    if (startDate || endDate) {
      baseWhere.accessedAt = {}

      if (startDate) {
        baseWhere.accessedAt.gte = new Date(startDate)
      }

      if (endDate) {
        baseWhere.accessedAt.lte = new Date(endDate)
      }
    }

    // 并行执行多个查询
    const [
      totalAccess,
      riskyAccess,
      multiIpLicenses,
      suspiciousIps,
      riskTypeDistribution,
      lockReasons,
    ] = await Promise.all([
      // 总访问量
      this.prisma.accessLog.count({ where: baseWhere }),

      // 风险访问量
      this.prisma.accessLog.count({
        where: { ...baseWhere, isRisky: true },
      }),

      // 多IP访问的授权码数量
      this.prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(DISTINCT license_id)::int as count
        FROM access_logs 
        WHERE license_id IN (
          SELECT license_id 
          FROM access_logs 
          WHERE 1=1
            ${startDate ? Prisma.sql`AND accessed_at >= ${new Date(startDate)}` : Prisma.empty}
            ${endDate ? Prisma.sql`AND accessed_at <= ${new Date(endDate)}` : Prisma.empty}
          GROUP BY license_id 
          HAVING COUNT(DISTINCT ip) > 1
        )
      `,

      // 可疑IP数量（出现在多个授权码中的IP）
      this.prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(DISTINCT ip)::int as count
        FROM access_logs 
        WHERE ip IN (
          SELECT ip 
          FROM access_logs 
          WHERE 1=1
            ${startDate ? Prisma.sql`AND accessed_at >= ${new Date(startDate)}` : Prisma.empty}
            ${endDate ? Prisma.sql`AND accessed_at <= ${new Date(endDate)}` : Prisma.empty}
          GROUP BY ip 
          HAVING COUNT(DISTINCT license_id) > 3
        )
      `,

      // 风险类型分布（基于是否风险访问的简单分类）
      this.prisma.accessLog.groupBy({
        by: ['isRisky'],
        where: baseWhere,
        _count: { id: true },
      }),

      // 锁定原因分析（基于警告次数）
      this.prisma.license.groupBy({
        by: ['locked', 'warningCount'],
        where: {
          locked: true,
          ...startDate ?? endDate
            ? {
                updatedAt: {
                  ...startDate && { gte: new Date(startDate) },
                  ...endDate && { lte: new Date(endDate) },
                },
              }
            : {},
        },
        _count: { id: true },
      }),
    ])

    return {
      totalAccess,
      riskyAccess,
      multiIpLicenses: multiIpLicenses[0]?.count || 0,
      suspiciousIps: suspiciousIps[0]?.count || 0,
      riskTypeDistribution,
      lockReasons,
    }
  }

  /**
   * 获取实时监控数据
   */
  async getRealtimeData() {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // 并行执行实时查询
    const [recentAccess, todayRevenue, systemHealth] = await Promise.all([
      // 最近5分钟的访问量
      this.prisma.accessLog.count({
        where: {
          accessedAt: { gte: fiveMinutesAgo },
        },
      }),

      // 今日收入
      this.prisma.license.aggregate({
        where: {
          createdAt: { gte: todayStart },
          purchaseAmount: { not: null },
        },
        _sum: { purchaseAmount: true },
      }),

      // 系统健康检查（简单的数据库连接测试）
      this.prisma.$queryRaw`SELECT 1 as health_check`
        .then(() => ({ status: 'healthy' as const }))
        .catch(() => ({ status: 'error' as const })),
    ])

    return {
      recentAccess,
      todayRevenue: todayRevenue._sum.purchaseAmount ?? 0,
      systemHealth,
    }
  }

  /**
   * 获取转化漏斗分析数据
   */
  async getConversionFunnelData(query: UserStatisticsQueryDto) {
    const { startDate, endDate } = query

    // 构建日期过滤条件
    const dateFilter: Record<string, unknown> = {}

    if (startDate || endDate) {
      dateFilter.createdAt = {}
      const createdAtFilter = dateFilter.createdAt as Record<string, Date>

      if (startDate) {
        createdAtFilter.gte = new Date(startDate)
      }

      if (endDate) {
        createdAtFilter.lte = new Date(endDate)
      }
    }

    // 并行执行漏斗各阶段的查询
    const [totalLicenses, usedLicenses, activeUsers] = await Promise.all([
      // 总授权码数（代表完成购买）
      this.prisma.license.count({ where: dateFilter }),

      // 已使用授权码数（代表实际使用）
      this.prisma.license.count({
        where: { ...dateFilter, isUsed: true },
      }),

      // 活跃用户数（代表持续使用）
      this.prisma.user.count({
        where: { ...dateFilter, isActive: true },
      }),
    ])

    return {
      totalLicenses,
      usedLicenses,
      activeUsers,
    }
  }

  /**
   * 获取仪表盘概览统计的原始数据
   */
  async getDashboardOverviewRawData(
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    previousPeriodStart: Date,
    previousPeriodEnd: Date,
  ) {
    // 并行执行当前周期和上一周期的查询
    const [currentPeriodData, previousPeriodData] = await Promise.all([
      // 当前周期数据
      this.getCurrentPeriodDashboardData(currentPeriodStart, currentPeriodEnd),
      // 上一周期数据（用于计算增长率）
      this.getPreviousPeriodDashboardData(previousPeriodStart, previousPeriodEnd),
    ])

    return {
      current: currentPeriodData,
      previous: previousPeriodData,
    }
  }

  /**
   * 获取当前周期的仪表盘数据
   * 包含时间序列数据以确保完整性
   */
  private async getCurrentPeriodDashboardData(startDate: Date, endDate: Date) {
    const [
      totalLicenseUsers,
      totalRevenue,
      userTimeSeriesData,
      revenueTimeSeriesData,
    ] = await Promise.all([
      // 统计已有授权码的用户总数（去重email）
      this.prisma.license
        .groupBy({
          by: ['email'],
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        })
        .then((result) => result.length),

      // 统计授权码总收入
      this.prisma.license.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          purchaseAmount: {
            not: null,
          },
        },
        _sum: {
          purchaseAmount: true,
        },
      }),

      // 获取用户时间序列数据（按日期分组的新增用户数）
      this.prisma.license.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),

      // 获取收入时间序列数据（按日期分组的收入）
      this.prisma.license.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          purchaseAmount: {
            not: null,
          },
        },
        _sum: {
          purchaseAmount: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ])

    return {
      totalLicenseUsers,
      totalRevenue: Number(totalRevenue._sum.purchaseAmount) || 0,
      userTimeSeriesData: userTimeSeriesData.map((item) => ({
        createdAt: item.createdAt,
        _count: { id: item._count.id },
      })),
      revenueTimeSeriesData: revenueTimeSeriesData.map((item) => ({
        createdAt: item.createdAt,
        _count: { id: Number(item._sum.purchaseAmount) || 0 },
      })),
    }
  }

  /**
   * 获取上一周期的仪表盘数据（用于计算增长率）
   */
  private async getPreviousPeriodDashboardData(startDate: Date, endDate: Date) {
    // 与当前周期相同的查询逻辑
    return this.getCurrentPeriodDashboardData(startDate, endDate)
  }
}
