import { Injectable } from '@nestjs/common'

import { Prisma } from '#prisma/client'
import { getPaginationParams } from '~/common/utils/pagination.util'
import { PrismaService } from '~/prisma/prisma.service'

import type { BugReportStatsDto, FindBugReportsDto } from './dto/find-bug-reports.dto'
import { type GetTimelineDto, type TimelineEventDto, TimelineEventType } from './dto/timeline.dto'
import { AdvancedBugReportSearchBuilder } from './utils/advanced-bug-report-search-builder.util'

/**
 * 漏洞报告查询过滤器
 */
interface BugReportFilter {
  /** 组织ID - 用于组织级别的权限控制 */
  orgId?: string
  /** 用户ID - 用于查询特定用户的报告 */
  userId?: string
}

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

  async findMany(dto: FindBugReportsDto, orgId?: string) {
    return this.findBugReportsWithFilter(dto, { orgId })
  }

  /**
   * 查询当前用户的漏洞报告列表
   */
  async findMyReports(dto: FindBugReportsDto, userId: string) {
    return this.findBugReportsWithFilter(dto, { userId })
  }

  /**
   * 通用的漏洞报告查询方法
   * 根据不同的过滤条件查询报告列表
   */
  private async findBugReportsWithFilter(
    dto: FindBugReportsDto,
    filter: BugReportFilter,
  ) {
    const searchBuilder = new AdvancedBugReportSearchBuilder(dto)
    const where = searchBuilder.buildWhere()

    // 应用过滤条件
    if (filter.orgId) {
      where.orgId = filter.orgId
    }

    if (filter.userId) {
      where.userId = filter.userId
    }

    const orderBy = searchBuilder.getOrderBy()
    const { skip, take } = getPaginationParams({
      page: dto.page,
      pageSize: dto.pageSize,
    })

    // 根据查询类型决定是否包含用户信息
    // 如果是查询当前用户的报告，则不需要包含用户信息
    const includeUser = filter.userId ? false : dto.includeUser ?? true

    const [data, total] = await Promise.all([
      this.prisma.bugReport.findMany({
        where,
        orderBy,
        skip,
        take,
        select: this.getListSelectOptions(
          includeUser,
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
   * 获取列表查询的字段选择选项，排除富文本字段以节省带宽
   */
  private getListSelectOptions(
    includeUser = true,
    includeReviewer = true,
    includeOrganization = false,
  ): Prisma.BugReportSelect {
    return {
      id: true,
      title: true,
      severity: true,
      attackMethod: true,
      // 排除 description 富文本字段
      discoveredUrls: true,
      attachments: true,
      status: true,
      userId: true,
      orgId: true,
      reviewerId: true,
      // 排除 reviewNote 富文本字段
      reviewedAt: true,
      createdAt: true,
      updatedAt: true,
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

  /**
   * 获取报告审理活动时间线
   */
  async getTimeline(dto: GetTimelineDto, currentOrgId: string) {
    const { skip, take } = getPaginationParams({
      page: dto.page,
      pageSize: dto.pageSize,
    })

    // 构建时间范围条件
    const timeFilter = {
      ...dto.startDate && { gte: new Date(dto.startDate) },
      ...dto.endDate && { lte: new Date(dto.endDate) },
    }

    // 1. 查询提交事件（从 BugReport 表）
    const submitEvents = this.prisma.bugReport.findMany({
      where: {
        orgId: currentOrgId,
        ...Object.keys(timeFilter).length > 0 && { createdAt: timeFilter },
        ...dto.keyword && {
          OR: [
            { title: { contains: dto.keyword, mode: 'insensitive' } },
            { description: { contains: dto.keyword, mode: 'insensitive' } },
          ],
        },
        ...dto.eventType && dto.eventType !== TimelineEventType.SUBMIT && { id: 'never-match' },
      },
      select: {
        id: true,
        title: true,
        severity: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 2. 查询审批事件（从 BugReportApprovalLog 表）
    const approvalEvents = this.prisma.bugReportApprovalLog.findMany({
      where: {
        ...Object.keys(timeFilter).length > 0 && { createdAt: timeFilter },
        ...dto.eventType && dto.eventType !== TimelineEventType.SUBMIT && {
          action: this.mapEventTypeToAction(dto.eventType)!,
        },
        bugReport: {
          orgId: currentOrgId,
          ...dto.keyword && {
            OR: [
              { title: { contains: dto.keyword, mode: 'insensitive' } },
              { description: { contains: dto.keyword, mode: 'insensitive' } },
            ],
          },
        },
      },
      select: {
        id: true,
        action: true,
        // 排除 comment 富文本字段以节省带宽
        createdAt: true,
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
          },
        },
        bugReport: {
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
            // 排除 description 和 reviewNote 富文本字段
            organization: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 3. 合并和排序事件
    const [submits, approvals] = await Promise.all([submitEvents, approvalEvents])

    const allEvents: TimelineEventDto[] = [
      // 提交事件
      ...submits.map((report) => ({
        id: `submit-${report.id}`,
        eventType: TimelineEventType.SUBMIT,
        createdAt: report.createdAt,
        bugReport: {
          id: report.id,
          title: report.title,
          severity: report.severity,
          status: report.status,
        },
        user: report.user,
        organization: report.organization,
        description: '提交了漏洞报告',
      })),
      // 审批事件
      ...approvals.map((approval) => ({
        id: `approval-${approval.id}`,
        eventType: this.mapActionToEventType(approval.action),
        createdAt: approval.createdAt,
        bugReport: {
          id: approval.bugReport.id,
          title: approval.bugReport.title,
          severity: approval.bugReport.severity,
          status: approval.bugReport.status,
        },
        user: approval.approver,
        organization: approval.bugReport.organization,
        approvalInfo: {
          action: approval.action,
          // comment 字段已在时间线查询中排除以节省带宽
          ...approval.targetUser && { targetUser: approval.targetUser },
        },
        description: this.getEventDescription(approval.action),
      })),
    ]

    // 按时间倒序排序
    allEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 应用分页
    const paginatedEvents = allEvents.slice(skip, skip + take)
    const total = allEvents.length

    const page = dto.page ?? 1
    const pageSize = take

    return {
      data: paginatedEvents,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * 将事件类型映射为审批操作
   */
  private mapEventTypeToAction(eventType: TimelineEventType): string | null {
    const mapping: Record<TimelineEventType, string | null> = {
      [TimelineEventType.SUBMIT]: null,
      [TimelineEventType.APPROVE]: 'APPROVE',
      [TimelineEventType.REJECT]: 'REJECT',
      [TimelineEventType.REQUEST_INFO]: 'REQUEST_INFO',
      [TimelineEventType.FORWARD]: 'FORWARD',
      [TimelineEventType.RESUBMIT]: 'RESUBMIT',
      [TimelineEventType.UPDATE]: null,
    }

    return mapping[eventType]
  }

  /**
   * 将审批操作映射为事件类型
   */
  private mapActionToEventType(action: string): TimelineEventType {
    const mapping: Record<string, TimelineEventType> = {
      APPROVE: TimelineEventType.APPROVE,
      REJECT: TimelineEventType.REJECT,
      REQUEST_INFO: TimelineEventType.REQUEST_INFO,
      FORWARD: TimelineEventType.FORWARD,
      RESUBMIT: TimelineEventType.RESUBMIT,
    }

    return mapping[action] ?? TimelineEventType.APPROVE
  }

  /**
   * 获取事件描述
   */
  private getEventDescription(action: string): string {
    const descriptions: Record<string, string> = {
      APPROVE: '审批通过了漏洞报告',
      REJECT: '驳回了漏洞报告',
      REQUEST_INFO: '要求补充漏洞报告信息',
      FORWARD: '转发了漏洞报告审批',
      RESUBMIT: '重新提交了漏洞报告',
    }

    return descriptions[action] || '处理了漏洞报告'
  }
}
