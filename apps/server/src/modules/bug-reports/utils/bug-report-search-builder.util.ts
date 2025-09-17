import { BugReportStatus, Prisma } from '#prisma/client'
import { VulnerabilitySeverity } from '~/common/enums/severity.enum'

/**
 * 漏洞报告高级搜索构建器
 *
 * 提供复杂查询条件的构建功能，支持多种筛选和排序组合
 */
export class BugReportSearchBuilder {
  private where: Prisma.BugReportWhereInput = {}
  private orderBy: Prisma.BugReportOrderByWithRelationInput[] = []
  private include: Prisma.BugReportInclude = {}

  constructor() {
    this.reset()
  }

  /**
   * 重置查询条件
   */
  reset(): this {
    this.where = {}
    this.orderBy = []
    this.include = {}

    return this
  }

  /**
   * 按组织筛选
   */
  byOrganization(orgId: string): this {
    this.where.orgId = orgId

    return this
  }

  /**
   * 按用户筛选
   */
  byUser(userId: string): this {
    this.where.userId = userId

    return this
  }

  /**
   * 按审核人筛选
   */
  byReviewer(reviewerId: string): this {
    this.where.reviewerId = reviewerId

    return this
  }

  /**
   * 按单个等级筛选
   */
  bySeverity(severity: VulnerabilitySeverity): this {
    this.where.severity = severity

    return this
  }

  /**
   * 按多个等级筛选
   */
  bySeverities(severities: VulnerabilitySeverity[]): this {
    if (severities.length > 0) {
      this.where.severity = { in: severities }
    }

    return this
  }

  /**
   * 按单个状态筛选
   */
  byStatus(status: BugReportStatus): this {
    this.where.status = status

    return this
  }

  /**
   * 按多个状态筛选
   */
  byStatuses(statuses: BugReportStatus[]): this {
    if (statuses.length > 0) {
      this.where.status = { in: statuses }
    }

    return this
  }

  /**
   * 按标题关键词搜索
   */
  byTitleKeyword(keyword: string): this {
    if (keyword.trim()) {
      this.where.title = {
        contains: keyword.trim(),
        mode: 'insensitive',
      }
    }

    return this
  }

  /**
   * 按攻击方式关键词搜索
   */
  byAttackMethodKeyword(keyword: string): this {
    if (keyword.trim()) {
      this.where.attackMethod = {
        contains: keyword.trim(),
        mode: 'insensitive',
      }
    }

    return this
  }

  /**
   * 按描述关键词搜索
   */
  byDescriptionKeyword(keyword: string): this {
    if (keyword.trim()) {
      this.where.description = {
        contains: keyword.trim(),
        mode: 'insensitive',
      }
    }

    return this
  }

  /**
   * 按全文关键词搜索（标题、攻击方式、描述）
   */
  byGlobalKeyword(keyword: string): this {
    if (keyword.trim()) {
      const searchTerm = { contains: keyword.trim(), mode: 'insensitive' } as const
      this.where.OR = [
        { title: searchTerm },
        { attackMethod: searchTerm },
        { description: searchTerm },
      ]
    }

    return this
  }

  /**
   * 按创建时间范围筛选
   */
  byCreatedAtRange(startDate?: Date | string, endDate?: Date | string): this {
    if (startDate || endDate) {
      this.where.createdAt = {}

      if (startDate) {
        this.where.createdAt.gte = new Date(startDate)
      }

      if (endDate) {
        this.where.createdAt.lte = new Date(endDate)
      }
    }

    return this
  }

  /**
   * 按更新时间范围筛选
   */
  byUpdatedAtRange(startDate?: Date | string, endDate?: Date | string): this {
    if (startDate || endDate) {
      this.where.updatedAt = {}

      if (startDate) {
        this.where.updatedAt.gte = new Date(startDate)
      }

      if (endDate) {
        this.where.updatedAt.lte = new Date(endDate)
      }
    }

    return this
  }

  /**
   * 按审核时间范围筛选
   */
  byReviewedAtRange(startDate?: Date | string, endDate?: Date | string): this {
    if (startDate || endDate) {
      this.where.reviewedAt = {}

      if (startDate) {
        this.where.reviewedAt.gte = new Date(startDate)
      }

      if (endDate) {
        this.where.reviewedAt.lte = new Date(endDate)
      }
    }

    return this
  }

  /**
   * 按是否有附件筛选
   */
  byHasAttachments(hasAttachments: boolean): this {
    if (hasAttachments) {
      this.where.attachments = { not: Prisma.JsonNull }
    }
    else {
      this.where.attachments = { equals: Prisma.JsonNull }
    }

    return this
  }

  /**
   * 按是否有URL筛选
   */
  byHasUrls(hasUrls: boolean): this {
    if (hasUrls) {
      this.where.discoveredUrls = { isEmpty: false }
    }
    else {
      this.where.discoveredUrls = { isEmpty: true }
    }

    return this
  }

  /**
   * 按是否已审核筛选
   */
  byIsReviewed(isReviewed: boolean): this {
    if (isReviewed) {
      this.where.reviewedAt = { not: null }
    }
    else {
      this.where.reviewedAt = null
    }

    return this
  }

  /**
   * 按URL关键词搜索
   */
  byUrlKeyword(keyword: string): this {
    if (keyword.trim()) {
      this.where.discoveredUrls = {
        hasSome: [keyword.trim()],
      }
    }

    return this
  }

  /**
   * 按严重等级排序
   */
  orderBySeverity(order: 'asc' | 'desc' = 'desc'): this {
    this.orderBy.push({ severity: order })

    return this
  }

  /**
   * 按状态排序
   */
  orderByStatus(order: 'asc' | 'desc' = 'asc'): this {
    this.orderBy.push({ status: order })

    return this
  }

  /**
   * 按创建时间排序
   */
  orderByCreatedAt(order: 'asc' | 'desc' = 'desc'): this {
    this.orderBy.push({ createdAt: order })

    return this
  }

  /**
   * 按更新时间排序
   */
  orderByUpdatedAt(order: 'asc' | 'desc' = 'desc'): this {
    this.orderBy.push({ updatedAt: order })

    return this
  }

  /**
   * 按标题排序
   */
  orderByTitle(order: 'asc' | 'desc' = 'asc'): this {
    this.orderBy.push({ title: order })

    return this
  }

  /**
   * 按用户名排序
   */
  orderByUserName(order: 'asc' | 'desc' = 'asc'): this {
    this.orderBy.push({
      user: { name: order },
    })

    return this
  }

  /**
   * 包含用户信息
   */
  includeUser(select?: Prisma.UserSelect): this {
    this.include.user = select
      ? { select }
      : {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        }

    return this
  }

  /**
   * 包含审核人信息
   */
  includeReviewer(select?: Prisma.UserSelect): this {
    this.include.reviewer = select
      ? { select }
      : {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        }

    return this
  }

  /**
   * 包含组织信息
   */
  includeOrganization(select?: Prisma.OrganizationSelect): this {
    this.include.organization = select
      ? { select }
      : {
          select: {
            id: true,
            name: true,
            code: true,
          },
        }

    return this
  }

  /**
   * 构建查询条件
   */
  buildWhere(): Prisma.BugReportWhereInput {
    return { ...this.where }
  }

  /**
   * 构建排序条件
   */
  buildOrderBy(): Prisma.BugReportOrderByWithRelationInput[] {
    return this.orderBy.length > 0 ? [...this.orderBy] : [{ createdAt: 'desc' }]
  }

  /**
   * 构建包含条件
   */
  buildInclude(): Prisma.BugReportInclude {
    return { ...this.include }
  }

  /**
   * 构建完整查询选项
   */
  build(): {
    where: Prisma.BugReportWhereInput
    orderBy: Prisma.BugReportOrderByWithRelationInput[]
    include: Prisma.BugReportInclude
  } {
    return {
      where: this.buildWhere(),
      orderBy: this.buildOrderBy(),
      include: this.buildInclude(),
    }
  }

  /**
   * 静态方法：创建新的搜索构建器实例
   */
  static create(): BugReportSearchBuilder {
    return new BugReportSearchBuilder()
  }

  /**
   * 静态方法：快速构建我的报告查询
   */
  static forMyReports(userId: string): BugReportSearchBuilder {
    return new BugReportSearchBuilder()
      .byUser(userId)
      .includeReviewer()
      .orderByCreatedAt('desc')
  }

  /**
   * 静态方法：快速构建待审核报告查询
   */
  static forPendingReports(orgId?: string): BugReportSearchBuilder {
    const builder = new BugReportSearchBuilder()
      .byStatus(BugReportStatus.PENDING)
      .includeUser()
      .orderByCreatedAt('asc')

    if (orgId) {
      builder.byOrganization(orgId)
    }

    return builder
  }

  /**
   * 静态方法：快速构建高危报告查询
   */
  static forCriticalReports(orgId?: string): BugReportSearchBuilder {
    const builder = new BugReportSearchBuilder()
      .bySeverities([VulnerabilitySeverity.HIGH, VulnerabilitySeverity.CRITICAL])
      .includeUser()
      .orderBySeverity('desc')
      .orderByCreatedAt('desc')

    if (orgId) {
      builder.byOrganization(orgId)
    }

    return builder
  }

  /**
   * 静态方法：快速构建最近活动查询
   */
  static forRecentActivity(days = 7, orgId?: string): BugReportSearchBuilder {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const builder = new BugReportSearchBuilder()
      .byCreatedAtRange(startDate)
      .includeUser()
      .includeReviewer()
      .orderByCreatedAt('desc')

    if (orgId) {
      builder.byOrganization(orgId)
    }

    return builder
  }
}
