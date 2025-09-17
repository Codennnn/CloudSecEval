import { Injectable } from '@nestjs/common'

import { Prisma } from '#prisma/client'
import { getPaginationParams } from '~/common/utils/pagination.util'
import { PrismaService } from '~/prisma/prisma.service'

import type { BugReportStatsDto, FindBugReportsDto } from './dto/find-bug-reports.dto'
import { AdvancedBugReportSearchBuilder } from './utils/advanced-bug-report-search-builder.util'

/**
 * 漏洞报告数据访问层
 *
 * 负责处理所有与漏洞报告相关的数据库操作
 */
@Injectable()
export class BugReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建漏洞报告
   */
  async create(data: Prisma.BugReportCreateInput) {
    return this.prisma.bugReport.create({
      data,
      include: this.getIncludeOptions(),
    })
  }

  /**
   * 根据ID查找漏洞报告
   */
  async findById(id: string, includeRelations = true) {
    return this.prisma.bugReport.findUnique({
      where: { id },
      include: includeRelations ? this.getIncludeOptions() : undefined,
    })
  }

  /**
   * 根据ID查找多个漏洞报告
   */
  async findByIds(ids: string[], includeRelations = false) {
    return this.prisma.bugReport.findMany({
      where: { id: { in: ids } },
      include: includeRelations ? this.getIncludeOptions() : undefined,
    })
  }

  /**
   * 查找漏洞报告（支持高级搜索功能）
   *
   * @description 使用统一的搜索框架，提供强大的查询能力
   * @param dto 搜索参数
   * @returns 包含漏洞报告列表、总数和分页信息的数据
   */
  async findMany(dto: FindBugReportsDto) {
    const searchBuilder = new AdvancedBugReportSearchBuilder(dto)

    // 构建查询条件
    const where = searchBuilder.buildWhere()
    const orderBy = searchBuilder.getOrderBy()

    const { skip, take } = getPaginationParams({
      page: dto.page,
      pageSize: dto.pageSize,
    })

    const [data, total] = await Promise.all([
      this.prisma.bugReport.findMany({
        where,
        orderBy,
        skip,
        take,
        include: this.getIncludeOptions(
          dto.includeUser,
          dto.includeReviewer,
          dto.includeOrganization,
        ),
      }),
      this.prisma.bugReport.count({ where }),
    ])

    const page = dto.page ?? 1
    const pageSize = take

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * 更新漏洞报告
   */
  async update(id: string, data: Prisma.BugReportUpdateInput) {
    return this.prisma.bugReport.update({
      where: { id },
      data,
      include: this.getIncludeOptions(),
    })
  }

  /**
   * 删除漏洞报告
   */
  async delete(id: string) {
    return this.prisma.bugReport.delete({
      where: { id },
    })
  }

  /**
   * 批量删除漏洞报告
   */
  async deleteMany(ids: string[]) {
    return this.prisma.bugReport.deleteMany({
      where: { id: { in: ids } },
    })
  }

  /**
   * 获取漏洞报告统计数据
   */
  async getStats(dto: BugReportStatsDto) {
    const where: Prisma.BugReportWhereInput = {
      ...dto.orgId && { orgId: dto.orgId },
      ...(dto.startDate ?? dto.endDate) && {
        createdAt: {
          ...dto.startDate && { gte: new Date(dto.startDate) },
          ...dto.endDate && { lte: new Date(dto.endDate) },
        },
      },
    }

    // 总数统计
    const total = await this.prisma.bugReport.count({ where })

    // 按等级统计
    const bySeverity = await this.prisma.bugReport.groupBy({
      by: ['severity'],
      where,
      _count: { id: true },
    })

    // 按状态统计
    const byStatus = await this.prisma.bugReport.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    })

    // 按时间统计（根据粒度）
    const timeGrouping = this.getTimeGrouping(dto.granularity ?? 'day')
    const byTime = await this.prisma.$queryRaw<{ date: string, count: bigint }[]>`
      SELECT 
        ${timeGrouping} as date,
        COUNT(*)::integer as count
      FROM bug_reports 
      WHERE 
        ${dto.orgId ? Prisma.sql`org_id = ${dto.orgId} AND` : Prisma.empty}
        ${dto.startDate ? Prisma.sql`created_at >= ${new Date(dto.startDate)} AND` : Prisma.empty}
        ${dto.endDate ? Prisma.sql`created_at <= ${new Date(dto.endDate)} AND` : Prisma.empty}
        true
      GROUP BY ${timeGrouping}
      ORDER BY date
    `

    // 最活跃的报告者
    const topReporters = await this.prisma.user.findMany({
      where: {
        bugReports: {
          some: where,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        _count: {
          select: { bugReports: { where } },
        },
      },
      orderBy: {
        bugReports: { _count: 'desc' },
      },
      take: 10,
    })

    // 最活跃的审核者
    const topReviewers = await this.prisma.user.findMany({
      where: {
        reviewedBugReports: {
          some: where,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        _count: {
          select: { reviewedBugReports: { where } },
        },
      },
      orderBy: {
        reviewedBugReports: { _count: 'desc' },
      },
      take: 10,
    })

    return {
      total,
      bySeverity: Object.fromEntries(
        bySeverity.map((item) => [item.severity, item._count.id]),
      ),
      byStatus: Object.fromEntries(
        byStatus.map((item) => [item.status, item._count.id]),
      ),
      byTime: byTime.map((item) => ({
        date: item.date,
        count: Number(item.count),
      })),
      topReporters: topReporters.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        reportCount: user._count.bugReports,
      })),
      topReviewers: topReviewers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        reviewCount: user._count.reviewedBugReports,
      })),
    }
  }

  /**
   * 获取关联查询选项
   */
  private getIncludeOptions(
    includeUser = true,
    includeReviewer = true,
    includeOrganization = false,
  ): Prisma.BugReportInclude {
    return {
      ...includeUser && {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      ...includeReviewer && {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      ...includeOrganization && {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    }
  }

  /**
   * 获取时间分组SQL片段
   */
  private getTimeGrouping(granularity: string): Prisma.Sql {
    switch (granularity) {
      case 'day':
        return Prisma.sql`DATE(created_at)`

      case 'week':
        return Prisma.sql`DATE_TRUNC('week', created_at)::date`

      case 'month':
        return Prisma.sql`DATE_TRUNC('month', created_at)::date`

      case 'year':
        return Prisma.sql`DATE_TRUNC('year', created_at)::date`

      default:
        return Prisma.sql`DATE(created_at)`
    }
  }

  /**
   * 创建审批日志记录
   */
  async createApprovalLog(data: Prisma.BugReportApprovalLogCreateInput) {
    return this.prisma.bugReportApprovalLog.create({
      data,
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })
  }

  /**
   * 获取漏洞报告的审批历史
   */
  async getApprovalHistory(
    bugReportId: string,
    includeApprover = true,
    includeTargetUser = true,
  ) {
    return this.prisma.bugReportApprovalLog.findMany({
      where: { bugReportId },
      include: {
        ...includeApprover && {
          approver: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        ...includeTargetUser && {
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  }
}
