import { Injectable } from '@nestjs/common'

import { BugReport, BugReportStatus, BugSeverity, Prisma } from '#prisma/client'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { VulnerabilitySeverity } from '~/common/enums/severity.enum'
import { BusinessException } from '~/common/exceptions/business.exception'
import { getPaginationParams } from '~/common/utils/pagination.util'
import { PrismaService } from '~/prisma/prisma.service'

import type { ApprovalStatusStatsDataDto, ApprovalStatusStatsDto, GetApprovalStatusStatsDto, SeverityStatsDto } from './dto/approval-status-stats.dto'
import type { DailyReportStatsDto, GetDailyReportsStatsDto } from './dto/daily-reports-stats.dto'
import type { DepartmentReportsStatsDataDto, GetDepartmentReportsStatsDto } from './dto/department-reports-stats.dto'
import type { FindBugReportsDto } from './dto/find-bug-reports.dto'
import { ExtendedApprovalHistoryDto, HistoryEventType } from './dto/history.dto'
import { type GetTimelineDto, type TimelineBugReportDto, type TimelineEventDto, TimelineEventType } from './dto/timeline.dto'
import { AdvancedBugReportSearchBuilder } from './utils/advanced-bug-report-search-builder.util'

/**
 * 漏洞报告查询过滤器
 */
interface BugReportFilter {
  /** 组织ID - 用于组织级别的权限控制 */
  orgId?: string
  /** 用户ID - 用于查询特定用户的报告 */
  userId?: string
  /** 部门ID - 用于查询特定部门成员的报告 */
  departmentId?: string
}

/**
 * 漏洞报告基础信息接口
 */
interface BugReportBasicInfo {
  id: string
  title: string
  severity: BugSeverity
  status: BugReportStatus
}

/**
 * 用户基础信息接口
 */
interface UserBasicInfo {
  id: string
  name: string | null
  email: string
  avatarUrl?: string | null
}

/**
 * 组织基础信息接口
 */
interface OrganizationBasicInfo {
  id: string
  name: string
  code: string
}

/**
 * 提交事件数据接口
 */
interface SubmitEventData {
  id: string
  createdAt: Date
  title: string
  severity: BugSeverity
  status: BugReportStatus
  user: UserBasicInfo
  organization: OrganizationBasicInfo
}

/**
 * 审批事件数据接口
 */
interface ApprovalEventData {
  id: string
  action: string
  createdAt: Date
  approver: UserBasicInfo
  targetUser?: {
    id: string
    name: string | null
    email: string
  } | null
  bugReport: BugReportBasicInfo & {
    organization: OrganizationBasicInfo
  }
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
   * 根据ID查找漏洞报告（用于导出，包含组织信息）
   */
  async findByIdForExport(id: string): Promise<BugReport & {
    user?: { id: string, name: string | null, email: string, avatarUrl: string | null } | null
    reviewer?: { id: string, name: string | null, email: string, avatarUrl: string | null } | null
    organization?: { id: string, name: string, code: string } | null
  } | null> {
    return this.prisma.bugReport.findUnique({
      where: { id },
      include: this.getIncludeOptions(true, true, true),
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
   * 查询部门成员的漏洞报告列表
   */
  async findDepartmentReports(dto: FindBugReportsDto, departmentId?: string, orgId?: string) {
    if (!departmentId) {
      // 如果用户没有部门，返回空结果
      return {
        data: [],
        total: 0,
        page: dto.page ?? 1,
        pageSize: dto.pageSize ?? 10,
        totalPages: 0,
      }
    }

    return this.findBugReportsWithFilter(dto, { departmentId, orgId })
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

    if (filter.departmentId) {
      where.user = {
        departmentId: filter.departmentId,
      }
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
   * 获取漏洞报告的完整历史记录（包含提交和审批）
   */
  async getExtendedApprovalHistory(
    bugReportId: string,
    options: {
      includeApprover?: boolean
      includeTargetUser?: boolean
      includeSubmissions?: boolean
      eventTypes?: HistoryEventType[]
    } = {},
  ): Promise<ExtendedApprovalHistoryDto[]> {
    const {
      includeApprover = true,
      includeTargetUser = true,
      includeSubmissions = true,
      eventTypes,
    } = options

    // 1. 获取报告基础信息
    const bugReport = await this.prisma.bugReport.findUnique({
      where: { id: bugReportId },
      include: {
        user: includeApprover
          ? {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            }
          : false,
      },
    })

    if (!bugReport) {
      throw BusinessException.notFound(BUSINESS_CODES.BUG_REPORT_NOT_FOUND)
    }

    // 2. 获取审批日志
    const approvalLogs = await this.prisma.bugReportApprovalLog.findMany({
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

    // 3. 组合所有历史事件
    const allEvents: ExtendedApprovalHistoryDto[] = []

    // 添加首次提交事件
    if (
      includeSubmissions
      && (!eventTypes || eventTypes.includes(HistoryEventType.SUBMIT))
    ) {
      allEvents.push({
        id: `submit-${bugReport.id}`,
        eventType: HistoryEventType.SUBMIT,
        createdAt: bugReport.createdAt,
        user: bugReport.user,
        description: '提交了漏洞报告',
        submitInfo: {
          title: bugReport.title,
          severity: bugReport.severity,
          status: bugReport.status,
          isResubmit: false,
        },
        bugReport: {
          id: bugReport.id,
          title: bugReport.title,
          severity: bugReport.severity,
          status: bugReport.status,
        },
      })
    }

    // 添加审批事件和重新提交事件
    for (const log of approvalLogs) {
      const eventType = this.mapActionToHistoryEventType(log.action)

      if (eventTypes && !eventTypes.includes(eventType)) {
        continue
      }

      const event: ExtendedApprovalHistoryDto = {
        id: `approval-${log.id}`,
        eventType,
        createdAt: log.createdAt,
        user: log.approver,
        description: this.getHistoryEventDescription(log.action),
        bugReport: {
          id: bugReport.id,
          title: bugReport.title,
          severity: bugReport.severity,
          status: bugReport.status,
        },
        // 审批相关信息
        ...eventType !== HistoryEventType.RESUBMIT && {
          approvalInfo: {
            action: log.action,
            comment: log.comment || undefined,
            ...log.targetUser && { targetUser: log.targetUser },
          },
        },
        // 重新提交信息
        ...eventType === HistoryEventType.RESUBMIT && includeSubmissions && {
          submitInfo: {
            title: bugReport.title,
            severity: bugReport.severity,
            status: bugReport.status,
            isResubmit: true,
            changedFields: log.comment
              ? this.extractChangedFieldsFromComment(log.comment)
              : undefined,
          },
        },
      }

      allEvents.push(event)
    }

    // 按时间排序
    allEvents.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )

    return allEvents
  }

  /**
   * 记录重新提交历史
   */
  async recordResubmissionHistory(
    bugReportId: string,
    userId: string,
    changedFields?: string[],
  ) {
    const comment = changedFields?.length
      ? `重新提交报告，修改了以下字段: ${changedFields.join(', ')}`
      : '重新提交报告'

    return this.createApprovalLog({
      bugReport: { connect: { id: bugReportId } },
      action: 'RESUBMIT',
      comment,
      approver: { connect: { id: userId } }, // 这里用提交者ID，区分于审核员
      createdAt: new Date(),
    })
  }

  /**
   * 将审批操作映射为历史事件类型
   */
  private mapActionToHistoryEventType(action: string): HistoryEventType {
    const mapping: Record<string, HistoryEventType> = {
      APPROVE: HistoryEventType.APPROVE,
      REJECT: HistoryEventType.REJECT,
      REQUEST_INFO: HistoryEventType.REQUEST_INFO,
      FORWARD: HistoryEventType.FORWARD,
      RESUBMIT: HistoryEventType.RESUBMIT,
    }

    return mapping[action] ?? HistoryEventType.APPROVE
  }

  /**
   * 获取历史事件描述
   */
  private getHistoryEventDescription(action: string): string {
    const descriptions: Record<string, string> = {
      APPROVE: '审批通过了漏洞报告',
      REJECT: '驳回了漏洞报告',
      REQUEST_INFO: '要求补充漏洞报告信息',
      FORWARD: '转发了漏洞报告审批',
      RESUBMIT: '重新提交了漏洞报告',
    }

    return descriptions[action] || '处理了漏洞报告'
  }

  /**
   * 从评论中提取变更字段信息
   */
  private extractChangedFieldsFromComment(comment: string): string[] {
    const match = /修改了以下字段:\s*(.+)/.exec(comment)

    if (match?.[1]) {
      return match[1].split(',').map((field) => field.trim())
    }

    return []
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

    // 构建部门筛选条件
    let departmentFilter: Prisma.BugReportWhereInput = {}

    if (dto.departmentId) {
      if (dto.includeSubDepartments) {
        // 如果需要包含子部门，先获取所有子部门ID
        const departmentIds = await this.collectDescendantDepartmentIds(dto.departmentId)
        departmentFilter = {
          user: {
            departmentId: { in: departmentIds },
          },
        }
      }
      else {
        // 只筛选指定部门
        departmentFilter = {
          user: {
            departmentId: dto.departmentId,
          },
        }
      }
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
        ...departmentFilter,
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
          ...departmentFilter,
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
      ...this.mapSubmitEvents(submits),
      ...this.mapApprovalEvents(approvals),
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

  /**
   * 获取组织下各部门的漏洞报告统计
   */
  async getDepartmentReportsStats(
    dto: GetDepartmentReportsStatsDto,
    orgId: string,
  ): Promise<DepartmentReportsStatsDataDto> {
    // 构建时间和状态过滤条件
    const where: Prisma.BugReportWhereInput = {
      orgId,
      // 排除草稿状态的报告
      status: {
        not: BugReportStatus.DRAFT,
        ...dto.status && { equals: dto.status as BugReportStatus },
      },
      // 只统计有部门的用户报告
      user: {
        department: {
          isNot: null,
        },
      },
      ...(dto.startDate ?? dto.endDate) && {
        createdAt: {
          ...dto.startDate && { gte: new Date(dto.startDate) },
          ...dto.endDate && { lte: new Date(dto.endDate) },
        },
      },
    }

    // 统计总报告数
    const totalReports = await this.prisma.bugReport.count({ where })

    // 按部门和状态统计报告数量
    const departmentStatusStats = await this.prisma.bugReport.groupBy({
      by: ['userId', 'status'],
      where,
      _count: { id: true },
    })

    // 获取用户部门信息
    const userIds = departmentStatusStats.map((item) => item.userId)
    const usersWithDepartments = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        department: {
          select: {
            id: true,
            name: true,
            remark: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // 按部门分组统计
    const departmentCountMap = new Map<string, {
      departmentId: string
      departmentName: string
      parentDepartmentName?: string
      departmentRemark?: string
      totalCount: number
      statusCounts: Map<string, number>
    }>()

    for (const stat of departmentStatusStats) {
      const user = usersWithDepartments.find((u) => u.id === stat.userId)

      // 由于已经在where条件中过滤，这里应该都有部门
      if (!user?.department) {
        continue
      }

      const deptKey = user.department.id
      const existing = departmentCountMap.get(deptKey)

      if (existing) {
        existing.totalCount += stat._count.id
        const currentStatusCount = existing.statusCounts.get(stat.status) ?? 0
        existing.statusCounts.set(stat.status, currentStatusCount + stat._count.id)
      }
      else {
        const statusCounts = new Map<string, number>()
        statusCounts.set(stat.status, stat._count.id)
        departmentCountMap.set(deptKey, {
          departmentId: user.department.id,
          departmentName: user.department.name,
          parentDepartmentName: user.department.parent?.name,
          departmentRemark: user.department.remark ?? undefined,
          totalCount: stat._count.id,
          statusCounts,
        })
      }
    }

    // 转换为数组并排序
    const departmentStatsArray = Array.from(departmentCountMap.values()).map((item) => ({
      department: {
        id: item.departmentId,
        name: item.departmentName,
        remark: item.departmentRemark,
        parentName: item.parentDepartmentName,
        path: item.parentDepartmentName
          ? `${item.parentDepartmentName}/${item.departmentName}`
          : item.departmentName,
      },
      reportCount: item.totalCount,
      statusCounts: Object.fromEntries(
        Array.from(item.statusCounts.entries()).map(([status, count]) => [
          status,
          { status: status as BugReportStatus, count },
        ]),
      ) as Record<BugReportStatus, { status: BugReportStatus, count: number }>,
    })).sort((a, b) => b.reportCount - a.reportCount)

    return {
      totalReports,
      totalDepartments: departmentStatsArray.length,
      departmentStats: departmentStatsArray,
    }
  }

  /**
   * 获取某部门及其子孙部门的 ID 列表
   * 用于支持包含子部门的统计查询
   */
  private async collectDescendantDepartmentIds(rootDeptId: string): Promise<string[]> {
    const allDepartments = await this.prisma.department.findMany({
      select: { id: true, parentId: true },
    })

    const childrenMap = new Map<string, string[]>()

    for (const dept of allDepartments) {
      const parentId = dept.parentId ?? 'root'
      const children = childrenMap.get(parentId) ?? []
      children.push(dept.id)
      childrenMap.set(parentId, children)
    }

    const result: string[] = []
    const stack = [rootDeptId]

    while (stack.length > 0) {
      const currentId = stack.pop()!
      result.push(currentId)
      const children = childrenMap.get(currentId) ?? []

      for (const childId of children) {
        stack.push(childId)
      }
    }

    return result
  }

  /**
   * 获取组织下各审批状态的漏洞报告统计
   */
  async getApprovalStatusStats(
    dto: GetApprovalStatusStatsDto,
    orgId: string,
  ): Promise<ApprovalStatusStatsDataDto> {
    // 构建查询条件
    const where: Prisma.BugReportWhereInput = {
      orgId,
      ...dto.severity && { severity: dto.severity },
      ...(dto.startDate ?? dto.endDate) && {
        createdAt: {
          ...dto.startDate && { gte: new Date(dto.startDate) },
          ...dto.endDate && { lte: new Date(dto.endDate) },
        },
      },
    }

    // 添加部门筛选条件
    if (dto.departmentId) {
      if (dto.includeSubDepartments) {
        // 如果需要包含子部门，先获取所有子部门ID
        const departmentIds = await this.collectDescendantDepartmentIds(dto.departmentId)
        where.user = {
          departmentId: { in: departmentIds },
        }
      }
      else {
        // 只筛选指定部门
        where.user = {
          departmentId: dto.departmentId,
        }
      }
    }

    // 统计总报告数
    const totalReports = await this.prisma.bugReport.count({ where })

    // 按状态分组统计
    const statusGroups = await this.prisma.bugReport.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    })

    // 按漏洞等级分组统计
    const severityGroups = await this.prisma.bugReport.groupBy({
      by: ['severity'],
      where,
      _count: { id: true },
    })

    // 构建状态统计映射
    const statusStatsMap = new Map<BugReportStatus, ApprovalStatusStatsDto>()

    // 添加有数据的状态
    for (const group of statusGroups) {
      statusStatsMap.set(group.status, {
        status: group.status,
        count: group._count.id,
        percentage: totalReports > 0
          ? Math.round(group._count.id / totalReports * 100 * 100) / 100
          : 0,
      })
    }

    // 确保所有状态都有数据（即使数量为0）
    const allStatuses = Object.values(BugReportStatus)

    for (const status of allStatuses) {
      if (!statusStatsMap.has(status)) {
        statusStatsMap.set(status, {
          status,
          count: 0,
          percentage: 0,
        })
      }
    }

    // 构建漏洞等级统计映射
    const severityStatsMap = new Map<BugSeverity, SeverityStatsDto>()

    // 添加有数据的等级
    for (const group of severityGroups) {
      severityStatsMap.set(group.severity, {
        severity: group.severity,
        count: group._count.id,
        percentage: totalReports > 0
          ? Math.round(group._count.id / totalReports * 100 * 100) / 100
          : 0,
      })
    }

    // 确保所有等级都有数据（即使数量为0）
    const allSeverities = Object.values(BugSeverity)

    for (const severity of allSeverities) {
      if (!severityStatsMap.has(severity)) {
        severityStatsMap.set(severity, {
          severity,
          count: 0,
          percentage: 0,
        })
      }
    }

    // 转换为 Record 对象
    const statusStats = Object.fromEntries(statusStatsMap.entries()) as Record<
      BugReportStatus,
      ApprovalStatusStatsDto
    >

    const severityStats = Object.fromEntries(severityStatsMap.entries()) as Record<
      BugSeverity,
      SeverityStatsDto
    >

    return {
      totalReports,
      statusStats,
      severityStats,
    }
  }

  /**
   * 映射提交事件
   */
  private mapSubmitEvents(submits: SubmitEventData[]): TimelineEventDto[] {
    return submits.map((report) => ({
      id: `submit-${report.id}`,
      eventType: TimelineEventType.SUBMIT,
      createdAt: report.createdAt,
      bugReport: this.createBugReportInfo(report),
      user: report.user,
      organization: report.organization,
      description: '提交了漏洞报告',
    }))
  }

  /**
   * 映射审批事件
   */
  private mapApprovalEvents(approvals: ApprovalEventData[]): TimelineEventDto[] {
    return approvals.map((approval) => ({
      id: `approval-${approval.id}`,
      eventType: this.mapActionToEventType(approval.action),
      createdAt: approval.createdAt,
      bugReport: this.createBugReportInfo(approval.bugReport),
      user: approval.approver,
      organization: approval.bugReport.organization,
      approvalInfo: {
        action: approval.action,
        comment: '', // comment 字段已在时间线查询中排除以节省带宽
        ...approval.targetUser && { targetUser: approval.targetUser },
      },
      description: this.getEventDescription(approval.action),
    }))
  }

  /**
   * 创建漏洞报告基础信息
   */
  private createBugReportInfo(report: BugReportBasicInfo): TimelineBugReportDto {
    return {
      id: report.id,
      title: report.title,
      severity: report.severity as unknown as VulnerabilitySeverity,
      status: report.status,
    }
  }

  /**
   * 获取组织下每日报告统计
   * 统计该组织下所有部门成员每日提交的漏洞报告数以及审核通过的漏洞报告数
   * 支持按部门筛选
   */
  async getDailyReportsStats(
    dto: GetDailyReportsStatsDto,
    orgId: string,
    departmentId?: string,
  ) {
    // 设置默认时间范围：最近30天
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date()
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000) // 30天前

    // 改进时间边界处理：考虑时区影响，使用UTC时间进行数据库查询
    // 但同时确保时间范围的准确性
    const startOfPeriod = new Date(startDate)
    startOfPeriod.setHours(0, 0, 0, 0)

    const endOfPeriod = new Date(endDate)
    endOfPeriod.setHours(23, 59, 59, 999)

    // 构建部门筛选条件
    const departmentFilter = departmentId ? Prisma.sql`AND u."departmentId" = ${departmentId}::uuid` : Prisma.empty

    // 查询该组织下所有部门成员每日提交的漏洞报告统计
    // 通过JOIN users表确保只统计该组织成员提交的报告
    // 支持按部门筛选
    const submittedStats = await this.prisma.$queryRaw<
      { date: string, count: number }[]
    >`
      SELECT 
        DATE(br."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai') as date,
        COUNT(*)::int as count
      FROM bug_reports br
      INNER JOIN users u ON br."userId" = u.id
      WHERE u."orgId" = ${orgId}::uuid
        ${departmentFilter}
        AND br.status IN (
          ${BugReportStatus.PENDING}::"public"."bug_report_status",
          ${BugReportStatus.IN_REVIEW}::"public"."bug_report_status",
          ${BugReportStatus.APPROVED}::"public"."bug_report_status",
          ${BugReportStatus.REJECTED}::"public"."bug_report_status",
          ${BugReportStatus.RESOLVED}::"public"."bug_report_status",
          ${BugReportStatus.CLOSED}::"public"."bug_report_status"
        )
        AND br."createdAt" >= ${startOfPeriod}
        AND br."createdAt" <= ${endOfPeriod}
      GROUP BY DATE(br."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai')
      ORDER BY date
    `

    // 查询该组织下成员提交的报告每日审核通过的统计
    // 只统计 action = 'APPROVE' 的审批记录
    // 支持按部门筛选
    const reviewedStats = await this.prisma.$queryRaw<
      { date: string, count: number }[]
    >`
      SELECT 
        DATE(bal."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai') as date,
        COUNT(DISTINCT bal."bugReportId")::int as count
      FROM bug_report_approval_logs bal
      INNER JOIN bug_reports br ON bal."bugReportId" = br.id
      INNER JOIN users u ON br."userId" = u.id
      WHERE u."orgId" = ${orgId}::uuid
        ${departmentFilter}
        AND bal.action = 'APPROVE'
        AND bal."createdAt" >= ${startOfPeriod}
        AND bal."createdAt" <= ${endOfPeriod}
      GROUP BY DATE(bal."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai')
      ORDER BY date
    `

    // 添加调试信息（开发环境下可取消注释用于问题排查）
    // console.warn('Daily Stats Query Debug:', {
    //   orgId,
    //   startDate: startDate.toISOString().split('T')[0],
    //   endDate: endDate.toISOString().split('T')[0],
    //   startOfPeriod: startOfPeriod.toISOString(),
    //   endOfPeriod: endOfPeriod.toISOString(),
    //   submittedStatsCount: submittedStats.length,
    //   reviewedStatsCount: reviewedStats.length,
    //   submittedStats: submittedStats.slice(0, 3), // 显示前3条数据用于调试
    // })

    // 构建完整的日期范围
    const dailyStatsMap = new Map<string, DailyReportStatsDto>()
    const currentDate = new Date(startOfPeriod)

    // 初始化所有日期为0
    while (currentDate <= endOfPeriod) {
      const dateStr = currentDate.toISOString().split('T')[0]
      dailyStatsMap.set(dateStr, {
        date: dateStr,
        submittedCount: 0,
        reviewedCount: 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 填充提交数据
    for (const stat of submittedStats) {
      // 确保日期格式为字符串 YYYY-MM-DD
      const dateStr = typeof stat.date === 'string'
        ? stat.date
        : new Date(stat.date).toISOString().split('T')[0]

      const existing = dailyStatsMap.get(dateStr)

      if (existing) {
        dailyStatsMap.set(dateStr, {
          date: existing.date,
          submittedCount: stat.count,
          reviewedCount: existing.reviewedCount,
        })
      }
    }

    // 填充审核通过数据
    for (const stat of reviewedStats) {
      // 确保日期格式为字符串 YYYY-MM-DD
      const dateStr = typeof stat.date === 'string'
        ? stat.date
        : new Date(stat.date).toISOString().split('T')[0]

      const existing = dailyStatsMap.get(dateStr)

      if (existing) {
        dailyStatsMap.set(dateStr, {
          date: existing.date,
          submittedCount: existing.submittedCount,
          reviewedCount: stat.count,
        })
      }
    }

    // 转换为数组并排序
    const dailyStats = Array.from(dailyStatsMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    // 计算总计
    const totalSubmitted = dailyStats.reduce((sum, stat) => sum + stat.submittedCount, 0)
    const totalReviewed = dailyStats.reduce((sum, stat) => sum + stat.reviewedCount, 0)
    const totalDays = dailyStats.length

    return {
      totalDays,
      totalSubmitted,
      totalReviewed,
      dailyStats,
    }
  }
}
