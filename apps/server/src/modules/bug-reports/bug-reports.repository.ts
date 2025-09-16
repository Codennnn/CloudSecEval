import { Injectable } from '@nestjs/common'

import { Prisma } from '#prisma/client'
import { BugReportStatus } from '~/common/constants/bug-reports'
import { getPaginationParams } from '~/common/utils/pagination.util'
import { PrismaService } from '~/prisma/prisma.service'

import type { BugReportStatsDto, FindBugReportsDto, FindMyBugReportsDto } from './dto/find-bug-reports.dto'

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
   * 批量创建漏洞报告
   */
  async createMany(data: Prisma.BugReportCreateManyInput[]) {
    return this.prisma.bugReport.createMany({
      data,
      skipDuplicates: false,
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
   * 查找漏洞报告（支持复杂条件筛选和分页）
   */
  async findMany(dto: FindBugReportsDto) {
    const where = this.buildWhereCondition(dto)
    const orderBy = this.buildOrderBy(dto.sortBy, dto.sortOrder)

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
   * 查找用户自己的漏洞报告
   */
  async findMyReports(userId: string, dto: FindMyBugReportsDto) {
    const where: Prisma.BugReportWhereInput = {
      userId,
      ...dto.severity && { severity: dto.severity },
      ...dto.status && { status: dto.status },
      ...dto.titleKeyword && {
        title: { contains: dto.titleKeyword, mode: 'insensitive' },
      },
      ...(dto.createdAtStart ?? dto.createdAtEnd) && {
        createdAt: {
          ...dto.createdAtStart && { gte: new Date(dto.createdAtStart) },
          ...dto.createdAtEnd && { lte: new Date(dto.createdAtEnd) },
        },
      },
    }

    const { skip, take } = getPaginationParams({
      page: dto.page,
      pageSize: dto.pageSize,
    })

    const [data, total] = await Promise.all([
      this.prisma.bugReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
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
   * 批量更新漏洞报告状态
   */
  async updateManyStatus(
    ids: string[],
    status: string,
    reviewerId?: string,
    reviewNote?: string,
  ) {
    const updateData: Prisma.BugReportUpdateManyArgs['data'] = {
      status: status as BugReportStatus,
      ...reviewerId && { reviewerId },
      ...reviewNote && { reviewNote },
      ...status !== 'PENDING' && { reviewedAt: new Date() },
    }

    return this.prisma.bugReport.updateMany({
      where: { id: { in: ids } },
      data: updateData,
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
   * 检查用户是否拥有指定的漏洞报告
   */
  async checkOwnership(id: string, userId: string): Promise<boolean> {
    const report = await this.prisma.bugReport.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    return !!report
  }

  /**
   * 检查漏洞报告是否在指定组织内
   */
  async checkOrganization(id: string, orgId: string): Promise<boolean> {
    const report = await this.prisma.bugReport.findFirst({
      where: { id, orgId },
      select: { id: true },
    })

    return !!report
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
   * 构建查询条件
   */
  private buildWhereCondition(dto: FindBugReportsDto): Prisma.BugReportWhereInput {
    const where: Prisma.BugReportWhereInput = {}

    // 等级筛选
    if (dto.severity) {
      where.severity = dto.severity
    }
    else if (dto.severities && dto.severities.length > 0) {
      where.severity = { in: dto.severities }
    }

    // 状态筛选
    if (dto.status) {
      where.status = dto.status
    }
    else if (dto.statuses && dto.statuses.length > 0) {
      where.status = { in: dto.statuses }
    }

    // 用户和组织筛选
    if (dto.userId) {
      where.userId = dto.userId
    }

    if (dto.reviewerId) {
      where.reviewerId = dto.reviewerId
    }

    if (dto.orgId) {
      where.orgId = dto.orgId
    }

    // 关键词搜索
    if (dto.titleKeyword) {
      where.title = { contains: dto.titleKeyword, mode: 'insensitive' }
    }

    if (dto.attackMethodKeyword) {
      where.attackMethod = { contains: dto.attackMethodKeyword, mode: 'insensitive' }
    }

    if (dto.descriptionKeyword) {
      where.description = { contains: dto.descriptionKeyword, mode: 'insensitive' }
    }

    // 时间范围筛选
    if (dto.createdAtStart || dto.createdAtEnd) {
      where.createdAt = {}

      if (dto.createdAtStart) {
        where.createdAt.gte = new Date(dto.createdAtStart)
      }

      if (dto.createdAtEnd) {
        where.createdAt.lte = new Date(dto.createdAtEnd)
      }
    }

    // 附件筛选
    if (dto.hasAttachments !== undefined) {
      if (dto.hasAttachments) {
        where.attachments = { not: Prisma.JsonNull }
      }
      else {
        where.attachments = { equals: Prisma.JsonNull }
      }
    }

    return where
  }

  /**
   * 构建排序条件
   */
  private buildOrderBy(
    sortBy?: string,
    sortOrder?: string,
  ): Prisma.BugReportOrderByWithRelationInput {
    const order = sortOrder === 'ASC' ? 'asc' : 'desc'

    switch (sortBy) {
      case 'title':
        return { title: order }

      case 'severity':
        return { severity: order }

      case 'status':
        return { status: order }

      case 'updatedAt':
        return { updatedAt: order }

      case 'createdAt':
        return { createdAt: order }

      default:
        return { createdAt: order }
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
}
