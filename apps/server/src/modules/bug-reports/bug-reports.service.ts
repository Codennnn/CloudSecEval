import { BUSINESS_CODES } from '@mono/constants'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import archiver from 'archiver'
import { promises as fs } from 'fs'
import { nanoid } from 'nanoid'
import { basename, extname, join } from 'path'

import { BugReport, BugReportStatus, BugSeverity, Prisma } from '#prisma/client'
import {
  BUG_REPORT_ATTACHMENTS,
  BUG_REPORT_STATUS_TRANSITIONS,
} from '~/common/constants/bug-reports'
import { VulnerabilitySeverity } from '~/common/enums/severity.enum'
import { BusinessException } from '~/common/exceptions/business.exception'
import { HtmlSanitizerService } from '~/common/services/html-sanitizer.service'
import { UploadsService } from '~/modules/uploads/uploads.service'
import { PrismaService } from '~/prisma/prisma.service'

import { CurrentUserDto } from '../users/dto/base-user.dto'
import { BugReportsRepository } from './bug-reports.repository'
import { ApprovalAction, ProcessApprovalDto } from './dto/approval.dto'
import type { GetApprovalStatusStatsDto } from './dto/approval-status-stats.dto'
import { AttachmentDto } from './dto/base-bug-report.dto'
import type { CreateBugReportDto } from './dto/create-bug-report.dto'
import type { DailyReportsStatsDataDto, GetDailyReportsStatsDto } from './dto/daily-reports-stats.dto'
import type { DepartmentReportsStatsDataDto, GetDepartmentReportsStatsDto } from './dto/department-reports-stats.dto'
import type { SaveDraftDto, SubmitDraftDto } from './dto/draft-bug-report.dto'
import {
  ExportBugReportDto,
  ExportBugReportPackageDto,
  type ExportedBugReportDataDto,
  ExportFormat,
  ImportBugReportDto,
} from './dto/export-import-bug-report.dto'
import type { FindBugReportsDto } from './dto/find-bug-reports.dto'
import { ExtendedGetApprovalHistoryDto } from './dto/history.dto'
import type { GetTimelineDto } from './dto/timeline.dto'
import type {
  ResubmitBugReportDto,
  UpdateBugReportDto,
  UpdateBugReportStatusDto,
} from './dto/update-bug-report.dto'
import { PandocWordExportService } from './services/pandoc-word-export.service'

/**
 * 漏洞报告关联数据类型
 */
interface FullReportWithRelations {
  id: string
  title: string
  severity: VulnerabilitySeverity
  attackMethod?: string | null
  description?: string | null
  discoveredUrls?: string[]
  status: BugReportStatus
  createdAt: Date
  updatedAt: Date
  reviewNote?: string | null
  reviewedAt?: Date | null
  attachments?: unknown[]
  user?: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  reviewer?: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  organization?: {
    id: string
    name: string
    code: string
  }
}

/**
 * 导出结果类型
 */
interface ExportResult {
  buffer: Buffer
  filename: string
  contentType: string
}

/**
 * 漏洞报告业务逻辑层
 *
 * 处理漏洞报告相关的业务逻辑，包括文件处理、状态流转等
 */
@Injectable()
export class BugReportsService {
  constructor(
    private readonly bugReportsRepository: BugReportsRepository,
    private readonly uploadsService: UploadsService,
    private readonly htmlSanitizerService: HtmlSanitizerService,
    private readonly prisma: PrismaService,
    private readonly pandocWordExportService: PandocWordExportService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateBugReportDto, currentUser: CurrentUserDto) {
    let attachments: AttachmentDto[] | undefined = []

    if (dto.attachmentIds && dto.attachmentIds.length > 0) {
      attachments = await this.processAttachments(dto.attachmentIds)
    }

    // 对富文本内容进行消毒处理
    const sanitizedDescription = dto.description
      ? this.htmlSanitizerService.sanitizeHtml(dto.description)
      : undefined

    const createData: Prisma.BugReportCreateInput = {
      title: dto.title,
      severity: dto.severity,
      attackMethod: dto.attackMethod,
      description: sanitizedDescription,
      discoveredUrls: dto.discoveredUrls ?? [],
      attachments: attachments.length > 0
        ? (attachments as unknown as Prisma.InputJsonValue)
        : undefined,
      status: BugReportStatus.PENDING,
      user: { connect: { id: currentUser.id } },
      organization: { connect: { id: currentUser.organization.id } },
    }

    const bugReport = await this.bugReportsRepository.create(createData)

    return bugReport
  }

  async findById(id: BugReport['id']) {
    const bugReport = await this.bugReportsRepository.findById(id, true)

    if (!bugReport) {
      throw BusinessException.notFound(BUSINESS_CODES.BUG_REPORT_NOT_FOUND)
    }

    return this.transformAttachmentsToIds(bugReport)
  }

  /**
   * 查询漏洞报告列表
   */
  async findMany(dto: FindBugReportsDto, currentUser: CurrentUserDto) {
    const result = await this.bugReportsRepository.findMany(
      dto,
      currentUser.organization.id,
    )

    return {
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    }
  }

  /**
   * 查询当前用户的漏洞报告列表
   */
  async findMyReports(dto: FindBugReportsDto, currentUser: CurrentUserDto) {
    const result = await this.bugReportsRepository.findMyReports(
      dto,
      currentUser.id,
    )

    return {
      data: result.data.map((item) => this.transformAttachmentsToIds(item)),
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    }
  }

  /**
   * 查询当前用户所在部门成员的漏洞报告列表
   */
  async findDepartmentReports(dto: FindBugReportsDto, currentUser: CurrentUserDto) {
    const result = await this.bugReportsRepository.findDepartmentReports(
      dto,
      currentUser.department?.id,
      currentUser.organization.id,
    )

    return {
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    }
  }

  /**
   * 更新漏洞报告
   */
  async update(id: string, dto: UpdateBugReportDto) {
    // 处理附件更新
    let attachments: AttachmentDto[] | undefined

    if (dto.attachmentIds !== undefined) {
      if (dto.attachmentIds.length > 0) {
        attachments = await this.processAttachments(dto.attachmentIds)
      }
      else {
        attachments = []
      }
    }

    // 对富文本内容进行消毒处理
    const sanitizedDescription = dto.description !== undefined
      ? dto.description ? this.htmlSanitizerService.sanitizeHtml(dto.description) : dto.description
      : undefined

    const updateData: Prisma.BugReportUpdateInput = {
      ...dto.title && { title: dto.title },
      ...dto.severity && { severity: dto.severity },
      ...dto.attackMethod !== undefined && { attackMethod: dto.attackMethod },
      ...sanitizedDescription !== undefined && { description: sanitizedDescription },
      ...dto.discoveredUrls !== undefined && { discoveredUrls: dto.discoveredUrls },
      ...attachments !== undefined && {
        attachments: attachments as unknown as Prisma.InputJsonValue,
      },
    }

    const updatedBugReport = await this.bugReportsRepository.update(id, updateData)

    return updatedBugReport
  }

  /**
   * 更新漏洞报告状态
   */
  async updateStatus(id: string, dto: UpdateBugReportStatusDto, currentUser: CurrentUserDto) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 业务逻辑检查
    if (dto.status) {
      this.validateStatusTransition(bugReport.status, dto.status)
    }

    const updateData: Prisma.BugReportUpdateInput = {
      ...dto.status && {
        status: dto.status,
        reviewerId: currentUser.id,
        reviewedAt: new Date(),
      },
      ...dto.reviewNote && { reviewNote: dto.reviewNote },
    }

    const updatedBugReport = await this.bugReportsRepository.update(id, updateData)

    return updatedBugReport
  }

  /**
   * 重新提交漏洞报告
   */
  async resubmit(id: string, dto: ResubmitBugReportDto, currentUser?: CurrentUserDto) {
    const bugReport = await this.findBugReportOrThrow(id)

    if (bugReport.status !== BugReportStatus.REJECTED) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_STATUS_TRANSITION,
        '只能重新提交被驳回的报告',
      )
    }

    // 检测变更字段
    const changedFields = this.detectChangedFields(bugReport, dto)

    // 处理附件更新
    let attachments: AttachmentDto[] | undefined

    if (dto.attachmentIds !== undefined) {
      if (dto.attachmentIds.length > 0) {
        attachments = await this.processAttachments(dto.attachmentIds)
      }
      else {
        attachments = []
      }
    }

    const updateData: Prisma.BugReportUpdateInput = {
      status: BugReportStatus.PENDING,
      reviewer: { disconnect: true },
      reviewNote: dto.resubmitNote ?? null,
      reviewedAt: null,
      ...dto.title && { title: dto.title },
      ...dto.severity && { severity: dto.severity },
      ...dto.attackMethod !== undefined && { attackMethod: dto.attackMethod },
      ...dto.description !== undefined && { description: dto.description },
      ...dto.discoveredUrls !== undefined && { discoveredUrls: dto.discoveredUrls },
      ...attachments !== undefined && {
        attachments: attachments as unknown as Prisma.InputJsonValue,
      },
    }

    const updatedBugReport = await this.bugReportsRepository.update(id, updateData)

    // 记录重新提交历史
    if (currentUser) {
      await this.bugReportsRepository.recordResubmissionHistory(
        id,
        currentUser.id,
        changedFields,
      )
    }

    return updatedBugReport
  }

  /**
   * 检测变更字段
   */
  private detectChangedFields(
    original: BugReport,
    updated: ResubmitBugReportDto,
  ): string[] {
    const changes: string[] = []

    if (updated.title && original.title !== updated.title) {
      changes.push('标题')
    }

    if (updated.description !== undefined && original.description !== updated.description) {
      changes.push('描述')
    }

    if (updated.severity && original.severity !== updated.severity) {
      changes.push('严重程度')
    }

    if (updated.attackMethod !== undefined && original.attackMethod !== updated.attackMethod) {
      changes.push('攻击方式')
    }

    if (
      updated.discoveredUrls !== undefined
      && JSON.stringify(original.discoveredUrls) !== JSON.stringify(updated.discoveredUrls)
    ) {
      changes.push('发现URL')
    }

    if (updated.attachmentIds !== undefined) {
      changes.push('附件')
    }

    return changes
  }

  /**
   * 删除漏洞报告
   */
  async delete(id: string) {
    await this.bugReportsRepository.delete(id)

    // 删除成功，无需返回数据，由控制器负责返回提示信息
  }

  /**
   * 保存草稿
   * 支持部分字段保存，所有字段都是可选的
   */
  async saveDraft(dto: SaveDraftDto, currentUser: CurrentUserDto) {
    let attachments: AttachmentDto[] = []

    if (dto.attachmentIds?.length) {
      attachments = await this.processAttachments(dto.attachmentIds)
    }

    // 对富文本内容进行消毒处理
    const sanitizedDescription = dto.description
      ? this.htmlSanitizerService.sanitizeHtml(dto.description)
      : undefined

    const createData: Prisma.BugReportCreateInput = {
      title: dto.title ?? '未命名草稿',
      severity: dto.severity ?? VulnerabilitySeverity.INFO,
      attackMethod: dto.attackMethod,
      description: sanitizedDescription,
      discoveredUrls: dto.discoveredUrls ?? [],
      attachments: attachments.length > 0
        ? (attachments as unknown as Prisma.InputJsonValue)
        : undefined,
      status: BugReportStatus.DRAFT,
      user: { connect: { id: currentUser.id } },
      organization: { connect: { id: currentUser.organization.id } },
    }

    const draftReport = await this.bugReportsRepository.create(createData)

    return draftReport
  }

  /**
   * 更新草稿
   * 只能更新状态为 DRAFT 的报告
   */
  async updateDraft(id: string, dto: SaveDraftDto, currentUser: CurrentUserDto) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 验证权限和状态
    if (bugReport.status !== BugReportStatus.DRAFT) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_STATUS_TRANSITION,
        '只能更新草稿状态的报告',
      )
    }

    if (bugReport.userId !== currentUser.id) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
        '只能更新自己的草稿',
      )
    }

    // 处理附件更新
    let attachments: AttachmentDto[] | undefined

    if (dto.attachmentIds !== undefined) {
      if (dto.attachmentIds.length > 0) {
        attachments = await this.processAttachments(dto.attachmentIds)
      }
      else {
        attachments = []
      }
    }

    // 对富文本内容进行消毒处理
    const sanitizedDescription = dto.description !== undefined
      ? dto.description ? this.htmlSanitizerService.sanitizeHtml(dto.description) : dto.description
      : undefined

    const updateData: Prisma.BugReportUpdateInput = {
      ...dto.title && { title: dto.title },
      ...dto.severity && { severity: dto.severity },
      ...dto.attackMethod !== undefined && { attackMethod: dto.attackMethod },
      ...sanitizedDescription !== undefined && { description: sanitizedDescription },
      ...dto.discoveredUrls !== undefined && { discoveredUrls: dto.discoveredUrls },
      ...attachments !== undefined && {
        attachments: attachments as unknown as Prisma.InputJsonValue,
      },
    }

    const updatedDraft = await this.bugReportsRepository.update(id, updateData)

    return updatedDraft
  }

  /**
   * 提交草稿（草稿转为正式提交）
   * 验证必填字段完整性后提交
   */
  async submitDraft(id: string, dto: SubmitDraftDto, currentUser: CurrentUserDto) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 验证权限和状态
    if (bugReport.status !== BugReportStatus.DRAFT) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_STATUS_TRANSITION,
        '只能提交草稿状态的报告',
      )
    }

    if (bugReport.userId !== currentUser.id) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
        '只能提交自己的草稿',
      )
    }

    // 处理附件
    let attachments: AttachmentDto[] = []

    if (dto.attachmentIds && dto.attachmentIds.length > 0) {
      attachments = await this.processAttachments(dto.attachmentIds)
    }

    // 对富文本内容进行消毒处理
    const sanitizedDescription = dto.description
      ? this.htmlSanitizerService.sanitizeHtml(dto.description)
      : undefined

    const updateData: Prisma.BugReportUpdateInput = {
      title: dto.title,
      severity: dto.severity,
      attackMethod: dto.attackMethod,
      description: sanitizedDescription,
      discoveredUrls: dto.discoveredUrls ?? [],
      attachments: attachments.length > 0
        ? (attachments as unknown as Prisma.InputJsonValue)
        : undefined,
      status: BugReportStatus.PENDING, // 提交后变为待审核
    }

    const submittedReport = await this.bugReportsRepository.update(id, updateData)

    return submittedReport
  }

  /**
   * 获取报告审理活动时间线
   */
  async getTimeline(dto: GetTimelineDto, currentUser: CurrentUserDto) {
    const result = await this.bugReportsRepository.getTimeline(
      dto,
      currentUser.organization.id,
    )

    return {
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    }
  }

  /**
   * 处理附件（将存储文件ID转换为持久化的附件信息）
   */
  private async processAttachments(attachmentIds: string[]) {
    if (attachmentIds.length > BUG_REPORT_ATTACHMENTS.MAX_COUNT) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_PARAMETER,
        `附件数量不能超过 ${BUG_REPORT_ATTACHMENTS.MAX_COUNT} 个`,
      )
    }

    const attachments = []

    for (const attachmentId of attachmentIds) {
      const storedFile = await this.uploadsService.getStoredFile(attachmentId)

      if (!storedFile) {
        throw BusinessException.notFound(BUSINESS_CODES.INVALID_ATTACHMENT_ID)
      }

      // 验证文件类型和大小
      if (
        !BUG_REPORT_ATTACHMENTS.ALLOWED_TYPES
          .includes(storedFile.mimeType as (typeof BUG_REPORT_ATTACHMENTS.ALLOWED_TYPES)[number])
      ) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.FILE_TYPE_NOT_ALLOWED,
          `不支持的文件类型: ${storedFile.mimeType}`,
        )
      }

      if (storedFile.size > BUG_REPORT_ATTACHMENTS.MAX_SIZE) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.FILE_SIZE_EXCEEDED,
          `文件大小不能超过 ${BUG_REPORT_ATTACHMENTS.MAX_SIZE / 1024 / 1024}MB`,
        )
      }

      attachments.push({
        id: storedFile.id,
        originalName: storedFile.originalName,
        fileName: storedFile.fileName,
        mimeType: storedFile.mimeType,
        size: storedFile.size,
        hash: storedFile.hash,
        uploadedAt: storedFile.storedAt,
      })
    }

    return attachments
  }

  /**
   * 验证状态流转是否合法
   */
  private validateStatusTransition(currentStatus: BugReportStatus, newStatus: BugReportStatus) {
    const allowedTransitions
      = BUG_REPORT_STATUS_TRANSITIONS[currentStatus as keyof typeof BUG_REPORT_STATUS_TRANSITIONS]

    if (!Array.isArray(allowedTransitions)) {
      throw BusinessException.badRequest(BUSINESS_CODES.INVALID_STATUS_TRANSITION)
    }

    const isValidTransition = allowedTransitions.includes(newStatus)

    if (!isValidTransition) {
      throw BusinessException.badRequest(BUSINESS_CODES.INVALID_STATUS_TRANSITION)
    }
  }

  /**
   * 查找漏洞报告或抛出异常
   */
  private async findBugReportOrThrow(id: string) {
    const bugReport = await this.bugReportsRepository.findById(id, false)

    if (!bugReport) {
      throw BusinessException.notFound(BUSINESS_CODES.BUG_REPORT_NOT_FOUND)
    }

    return bugReport
  }

  /**
   * 统一审批处理
   */
  async processApproval(id: string, dto: ProcessApprovalDto, currentUser: CurrentUserDto) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 验证审批权限
    await this.validateApprovalPermission(bugReport, currentUser, dto.action)

    // 先执行审批操作，确保状态流转成功
    let result

    switch (dto.action) {
      case ApprovalAction.APPROVE:
        result = await this.handleApprove(bugReport, dto, currentUser)
        break

      case ApprovalAction.REJECT:
        result = await this.handleReject(bugReport, dto, currentUser)
        break

      case ApprovalAction.REQUEST_INFO:
        result = await this.handleRequestInfo(bugReport, dto, currentUser)
        break

      case ApprovalAction.FORWARD:
        result = await this.handleForward(bugReport, dto, currentUser)
        break

      default:
        throw BusinessException.badRequest(
          BUSINESS_CODES.INVALID_PARAMETER,
          '不支持的审批动作',
        )
    }

    // 只有操作成功后才记录审批日志
    await this.recordApprovalLog(id, {
      action: dto.action,
      comment: dto.comment,
      approverId: currentUser.id,
      targetUserId: dto.targetUserId,
    })

    return result
  }

  /**
   * 获取审批历史
   */
  async getApprovalHistory(id: string, includeApprover = true, includeTargetUser = true) {
    // 验证漏洞报告是否存在
    await this.findBugReportOrThrow(id)

    return this.bugReportsRepository.getApprovalHistory(
      id,
      includeApprover,
      includeTargetUser,
    )
  }

  /**
   * 获取扩展的审批历史（包含提交记录）
   */
  async getExtendedApprovalHistory(id: string, dto: ExtendedGetApprovalHistoryDto = {}) {
    // 验证漏洞报告是否存在
    await this.findBugReportOrThrow(id)

    return this.bugReportsRepository.getExtendedApprovalHistory(id, {
      includeApprover: dto.includeApprover,
      includeTargetUser: dto.includeTargetUser,
      includeSubmissions: dto.includeSubmissions,
    })
  }

  /**
   * 处理审批通过
   */
  private async handleApprove(
    bugReport: BugReport,
    dto: ProcessApprovalDto,
    currentUser: CurrentUserDto,
  ) {
    // 简化审批逻辑：支持的状态直接审批通过
    const validStatuses: BugReportStatus[] = [BugReportStatus.PENDING, BugReportStatus.IN_REVIEW]

    if (validStatuses.includes(bugReport.status)) {
      return this.updateStatus(bugReport.id, {
        status: BugReportStatus.APPROVED,
        reviewNote: dto.comment,
      }, currentUser)
    }
    else {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_STATUS_TRANSITION,
        `当前状态 ${bugReport.status} 不支持审批通过操作`,
      )
    }
  }

  /**
   * 处理审批驳回
   */
  private async handleReject(
    bugReport: BugReport,
    dto: ProcessApprovalDto,
    currentUser: CurrentUserDto,
  ) {
    return this.updateStatus(bugReport.id, {
      status: BugReportStatus.REJECTED,
      reviewNote: dto.comment,
    }, currentUser)
  }

  /**
   * 处理要求补充信息
   */
  private async handleRequestInfo(
    bugReport: BugReport,
    dto: ProcessApprovalDto,
    currentUser: CurrentUserDto,
  ) {
    // 先更新状态
    const result = await this.updateStatus(bugReport.id, {
      status: BugReportStatus.PENDING,
      reviewNote: dto.comment,
    }, currentUser)

    // 单独清除审批人 - 需要直接调用 repository
    await this.bugReportsRepository.update(bugReport.id, {
      reviewer: { disconnect: true },
    })

    return result
  }

  /**
   * 处理转发审批
   */
  private async handleForward(
    bugReport: BugReport,
    dto: ProcessApprovalDto,
    currentUser: CurrentUserDto,
  ) {
    if (!dto.targetUserId) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_PARAMETER,
        '转发操作需要指定目标用户',
      )
    }

    // 先更新审批意见
    const result = await this.updateStatus(bugReport.id, {
      reviewNote: dto.comment,
    }, currentUser)

    // 单独更新审批人 - 需要直接调用 repository
    await this.bugReportsRepository.update(bugReport.id, {
      reviewer: { connect: { id: dto.targetUserId } },
    })

    return result
  }

  /**
   * 验证审批权限
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async validateApprovalPermission(
    bugReport: BugReport,
    currentUser: CurrentUserDto,
    action: ApprovalAction,
  ) {
    // 检查报告状态是否可以审批
    const validStatuses: BugReportStatus[] = [BugReportStatus.PENDING, BugReportStatus.IN_REVIEW]

    if (!validStatuses.includes(bugReport.status)) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_PARAMETER,
        `当前状态 ${bugReport.status} 不允许审批操作`,
      )
    }

    // 检查组织权限
    if (bugReport.orgId !== currentUser.organization.id) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
        '只能审批本组织的漏洞报告',
      )
    }

    // 检查是否是自己提交的报告（不能自审）
    if (bugReport.userId === currentUser.id) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
        '不能审批自己提交的漏洞报告',
      )
    }

    // 转发操作需要额外验证目标用户
    if (action === ApprovalAction.FORWARD) {
      // 这里可以添加目标用户有效性验证
      // 例如检查目标用户是否有审批权限、是否在同一组织等
    }
  }

  /**
   * 记录审批日志
   */
  private async recordApprovalLog(bugReportId: string, data: {
    action: string
    comment: string
    approverId: string
    targetUserId?: string
  }) {
    return this.bugReportsRepository.createApprovalLog({
      bugReport: { connect: { id: bugReportId } },
      approver: { connect: { id: data.approverId } },
      action: data.action,
      comment: data.comment,
      ...data.targetUserId && {
        targetUser: { connect: { id: data.targetUserId } },
      },
    })
  }

  /**
   * 验证是否为有效的 BugSeverity 枚举值
   */
  private isValidBugSeverity(value: string): value is BugSeverity {
    return Object.values(BugSeverity).includes(value as BugSeverity)
  }

  /**
   * 获取组织下各部门的漏洞报告统计
   */
  async getDepartmentReportsStats(
    dto: GetDepartmentReportsStatsDto,
    currentUser: CurrentUserDto,
  ): Promise<DepartmentReportsStatsDataDto> {
    const stats = await this.bugReportsRepository.getDepartmentReportsStats(
      dto,
      currentUser.organization.id,
    )

    return stats
  }

  /**
   * 获取组织下各审批状态的漏洞报告统计
   */
  async getApprovalStatusStats(
    dto: GetApprovalStatusStatsDto,
    currentUser: CurrentUserDto,
  ) {
    const stats = await this.bugReportsRepository.getApprovalStatusStats(
      dto,
      currentUser.organization.id,
    )

    return stats
  }

  /**
   * 获取组织下每日报告统计
   * 支持按部门筛选
   */
  async getDailyReportsStats(
    dto: GetDailyReportsStatsDto,
    currentUser: CurrentUserDto,
  ): Promise<DailyReportsStatsDataDto> {
    let targetDepartmentId: string | undefined

    // 如果请求中指定了部门ID，验证部门是否属于当前组织
    if (dto.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: {
          id: dto.departmentId,
          orgId: currentUser.organization.id,
        },
      })

      if (!department) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.RESOURCE_NOT_FOUND,
          '指定的部门不存在或不属于当前组织',
        )
      }

      targetDepartmentId = dto.departmentId
    }
    else {
      // 没有指定部门ID，查看全组织数据
      targetDepartmentId = undefined
    }

    const stats = await this.bugReportsRepository.getDailyReportsStats(
      dto,
      currentUser.organization.id,
      targetDepartmentId,
    )

    return stats
  }

  /**
   * 转换附件数据为ID列表
   */
  private transformAttachmentsToIds<T extends { attachments?: unknown }>(
    data: T,
  ): Omit<T, 'attachments'> & { attachmentIds?: string[] } {
    const result = { ...data } as Omit<T, 'attachments'> & { attachmentIds?: string[] }

    // 如果有附件数据，提取ID列表
    if (data.attachments && Array.isArray(data.attachments)) {
      const attachments = data.attachments as AttachmentDto[]
      result.attachmentIds = attachments.map((attachment) => attachment.id)
      // 删除原始附件数据
      delete (result as Record<string, unknown>).attachments
    }

    return result
  }

  /**
   * 导出单个漏洞报告（支持JSON和Word格式）
   */
  async exportBugReport(id: string, dto: ExportBugReportDto, currentUser: CurrentUserDto) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 权限检查
    if (bugReport.orgId !== currentUser.organization.id) {
      throw BusinessException.forbidden(BUSINESS_CODES.INSUFFICIENT_PERMISSIONS, '只能导出本组织的漏洞报告')
    }

    // 获取完整数据（包含组织信息）
    const fullReport = await this.bugReportsRepository
      .findByIdForExport(id) as FullReportWithRelations | null

    if (!fullReport) {
      throw BusinessException.notFound(BUSINESS_CODES.BUG_REPORT_NOT_FOUND)
    }

    // 类型断言为包含关联数据的类型
    const reportWithRelations = fullReport

    // 构建导出数据
    const exportData = this.buildExportData(
      reportWithRelations,
      reportWithRelations,
      dto,
      currentUser,
    )

    // 根据格式选择导出方式
    switch (dto.format) {
      case ExportFormat.WORD:
        return await this.exportAsWord(exportData)

      case ExportFormat.JSON:
        return await this.exportAsJson(exportData, fullReport.id)

      default:
        return await this.exportAsJson(exportData, fullReport.id)
    }
  }

  /**
   * 导出压缩包（包含JSON、Word和附件原文件）
   */
  async exportBugReportPackage(
    id: string,
    dto: ExportBugReportPackageDto,
    currentUser: CurrentUserDto,
  ) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 权限检查
    if (bugReport.orgId !== currentUser.organization.id) {
      throw BusinessException.forbidden(BUSINESS_CODES.INSUFFICIENT_PERMISSIONS, '只能导出本组织的漏洞报告')
    }

    // 获取完整数据
    const fullReport = await this.bugReportsRepository
      .findByIdForExport(id) as FullReportWithRelations | null

    if (!fullReport) {
      throw BusinessException.notFound(BUSINESS_CODES.BUG_REPORT_NOT_FOUND)
    }

    const taskId = nanoid()
    const baseTempDir = this.configService.get<string>('app.tempDir') ?? '/tmp/app-temp'
    const tempDir = join(baseTempDir, 'package-export', taskId)

    try {
      // 创建临时目录
      await fs.mkdir(tempDir, { recursive: true })

      // 构建导出数据（用于JSON和Word）
      const exportData = this.buildExportData(
        fullReport,
        fullReport,
        { includeHistory: dto.includeHistory } as ExportBugReportDto,
        currentUser,
      )

      const files: { filePath: string, archivePath: string }[] = []

      // 1. 生成JSON文件
      if (dto.includeJson) {
        const jsonResult = await this.exportAsJson(exportData, fullReport.id)
        const jsonPath = join(tempDir, this.generateExportFilename(fullReport.title, 'json'))
        await fs.writeFile(jsonPath, jsonResult.buffer)
        files.push({ filePath: jsonPath, archivePath: this.generateExportFilename(fullReport.title, 'json') })
      }

      // 2. 生成Word文件
      if (dto.includeWord) {
        const wordResult = await this.exportAsWord(exportData)
        const wordPath = join(tempDir, this.generateExportFilename(fullReport.title, 'docx'))
        await fs.writeFile(wordPath, wordResult.buffer)
        files.push({ filePath: wordPath, archivePath: this.generateExportFilename(fullReport.title, 'docx') })
      }

      // 3. 处理附件文件
      if (dto.includeAttachments && fullReport.attachments) {
        const attachments = Array.isArray(fullReport.attachments)
          ? fullReport.attachments
          : []

        if (attachments.length > 0) {
          const attachmentFolder = '相关附件'
          // 创建附件目录
          const attachmentsDir = join(tempDir, attachmentFolder)
          await fs.mkdir(attachmentsDir, { recursive: true })

          for (const attachment of attachments) {
            const attachmentData = attachment as { id: string, originalName?: string }

            try {
              // 获取文件信息
              const fileInfo = await this.uploadsService.getStoredFile(attachmentData.id)

              if (fileInfo?.localPath) {
                // 检查文件是否存在
                try {
                  await fs.access(fileInfo.localPath)

                  // 生成安全的文件名
                  const safeFileName = this.generateSafeFileName(
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    attachmentData.originalName
                      ? attachmentData.originalName
                      : fileInfo.originalName
                        ? fileInfo.originalName
                        : `attachment_${attachmentData.id}`,
                  )
                  const attachmentPath = join(attachmentsDir, safeFileName)

                  // 复制文件
                  await fs.copyFile(fileInfo.localPath, attachmentPath)
                  files.push({ filePath: attachmentPath, archivePath: `${attachmentFolder}/${safeFileName}` })
                }
                catch {
                  // 文件不存在，跳过
                  console.warn(`附件文件不存在: ${fileInfo.localPath}`)
                }
              }
            }
            catch (error) {
              // 获取文件信息失败，跳过该附件
              console.warn(`获取附件信息失败: ${attachmentData.id}`, error)
            }
          }
        }
      }

      // 4. 创建压缩包
      const archive = archiver('zip', { zlib: { level: 9 } })
      const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = []

        archive.on('data', (chunk: Buffer) => chunks.push(chunk))
        archive.on('end', () => {
          resolve(Buffer.concat(chunks))
        })
        archive.on('error', reject)

        // 添加文件到压缩包
        for (const file of files) {
          archive.file(file.filePath, { name: file.archivePath })
        }

        void archive.finalize()
      })

      const filename = dto.filenamePrefix
        ? `${this.generateSafeFileName(dto.filenamePrefix)}.zip`
        : this.generateExportFilename(fullReport.title, 'zip')

      return {
        buffer: zipBuffer,
        filename,
        contentType: 'application/zip',
      }
    }
    finally {
      // 清理临时文件
      try {
        await fs.rm(tempDir, { recursive: true, force: true })
      }
      catch (error) {
        console.warn('清理临时文件失败:', error)
      }
    }
  }

  /**
   * 生成安全的文件名
   */
  private generateSafeFileName(originalName: string): string {
    // 移除路径分隔符和特殊字符
    let safeName = originalName.replace(/[/\\:*?"<>|]/g, '_')

    // 限制文件名长度
    const ext = extname(safeName)
    const nameWithoutExt = basename(safeName, ext)

    if (nameWithoutExt.length > 100) {
      safeName = nameWithoutExt.substring(0, 100) + ext
    }

    return safeName
  }

  /**
   * 构建导出数据
   */
  private buildExportData(
    fullReport: FullReportWithRelations,
    reportWithRelations: FullReportWithRelations,
    dto: ExportBugReportDto,
    currentUser: CurrentUserDto,
  ): Record<string, unknown> {
    // 构建基础导出数据
    const exportData = {
      exportMeta: {
        version: '1.0.0',
        exportedAt: new Date(),
        exportedBy: {
          id: currentUser.id,
          name: currentUser.name ?? '',
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl ?? undefined,
        },
      },
      report: {
        id: fullReport.id,
        title: fullReport.title,
        severity: fullReport.severity,
        attackMethod: fullReport.attackMethod ?? undefined,
        description: fullReport.description ?? undefined,
        discoveredUrls: fullReport.discoveredUrls,
        status: fullReport.status,
        createdAt: fullReport.createdAt,
        updatedAt: fullReport.updatedAt,
        reviewNote: fullReport.reviewNote ?? undefined,
        reviewedAt: fullReport.reviewedAt ?? undefined,
      },
      submitter: reportWithRelations.user
        ? {
            id: reportWithRelations.user.id,
            name: reportWithRelations.user.name ?? '',
            email: reportWithRelations.user.email,
            avatarUrl: reportWithRelations.user.avatarUrl ?? undefined,
          }
        : undefined,
      reviewer: reportWithRelations.reviewer
        ? {
            id: reportWithRelations.reviewer.id,
            name: reportWithRelations.reviewer.name ?? '',
            email: reportWithRelations.reviewer.email,
            avatarUrl: reportWithRelations.reviewer.avatarUrl ?? undefined,
          }
        : undefined,
      organization: reportWithRelations.organization
        ? {
            id: reportWithRelations.organization.id,
            name: reportWithRelations.organization.name,
            code: reportWithRelations.organization.code,
          }
        : undefined,
    }

    // 处理附件（仅在JSON格式时包含）
    if (
      dto.format === ExportFormat.JSON
      && fullReport.attachments
      && Array.isArray(fullReport.attachments)
    ) {
      interface AttachmentData {
        id: string
        originalName: string
        fileName?: string | null
        mimeType: string
        size: number
        hash?: string | null
        uploadedAt?: Date | string | null
      }

      const attachments = fullReport.attachments as unknown as AttachmentData[]
      const processedAttachments = attachments.map((attachment) => ({
        id: attachment.id,
        originalName: attachment.originalName,
        fileName: attachment.fileName ?? attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
        hash: attachment.hash ?? '',
        uploadedAt: attachment.uploadedAt ?? new Date(),
        downloadUrl: `/api/uploads/download/${attachment.id}`,
      }))

      Object.assign(exportData, { attachments: processedAttachments })
    }

    // 处理审批历史（仅在JSON格式且启用时包含）
    if (dto.format === ExportFormat.JSON && dto.includeHistory) {
      // 注意：这里需要异步处理，但为了保持方法签名简单，我们在调用方处理
      // 这个逻辑会在 exportAsJson 方法中处理
    }

    return exportData
  }

  /**
   * 导出为Word格式
   */
  private async exportAsWord(
    exportData: Record<string, unknown>,
  ): Promise<ExportResult> {
    const buffer = await this.pandocWordExportService.generateBugReportDocument(
      exportData as unknown as ExportedBugReportDataDto,
    )

    // 获取报告标题用于生成文件名
    const typedExportData = exportData as { report?: { title?: string } }
    const reportTitle = typedExportData.report?.title ?? '未知报告'
    const filename = this.generateExportFilename(reportTitle, 'docx')

    return {
      buffer,
      filename,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
  }

  /**
   * 导出为JSON格式
   */
  private async exportAsJson(
    exportData: Record<string, unknown>,
    reportId: string,
  ): Promise<ExportResult> {
    // 处理审批历史（如果需要的话）
    if (!exportData.approvalHistory && exportData.includeHistory !== false) {
      try {
        const history = await this.getExtendedApprovalHistory(reportId)
        const processedHistory = history.map((item) => ({
          id: item.id,
          eventType: item.eventType,
          action: item.eventType.toUpperCase(),
          createdAt: item.createdAt,
          user: {
            id: item.user.id,
            name: item.user.name ?? '',
            email: item.user.email,
            avatarUrl: item.user.avatarUrl,
          },
          description: item.description,
          comment: item.approvalInfo?.comment
            ?? item.submitInfo?.changedFields?.join(', ')
            ?? undefined,
          changedFields: item.submitInfo?.changedFields,
        }))
        Object.assign(exportData, { approvalHistory: processedHistory })
      }
      catch (error) {
        console.warn('获取审批历史失败:', error)
      }
    }

    const jsonContent = JSON.stringify(exportData, null, 2)

    // 获取报告标题用于生成文件名
    const typedExportData = exportData as { report?: { title?: string } }
    const reportTitle = typedExportData.report?.title ?? '未知报告'
    const filename = this.generateExportFilename(reportTitle, 'json')

    return {
      buffer: Buffer.from(jsonContent, 'utf8'),
      filename,
      contentType: 'application/json',
    }
  }

  /**
   * 导入漏洞报告
   */
  async importBugReport(
    file: Express.Multer.File,
    dto: ImportBugReportDto,
    currentUser: CurrentUserDto,
  ) {
    // 解析 JSON 文件
    interface ImportDataType {
      exportMeta?: {
        exportedAt: string
      }
      report?: {
        id: string
        title: string
        severity: string
        attackMethod?: string | null
        description?: string | null
        discoveredUrls?: string[] | null
      }
      submitter?: {
        name?: string | null
      }
      organization?: {
        name?: string
      }
    }

    let importData: ImportDataType

    try {
      const jsonContent = file.buffer.toString('utf8')
      importData = JSON.parse(jsonContent) as ImportDataType
    }
    catch {
      throw BusinessException.badRequest(BUSINESS_CODES.INVALID_PARAMETER, '无效的JSON文件格式')
    }

    // 数据验证
    if (!importData.exportMeta || !importData.report) {
      throw BusinessException.badRequest(BUSINESS_CODES.INVALID_PARAMETER, '无效的导出文件格式')
    }

    if (!importData.report.title || !importData.report.severity) {
      throw BusinessException.badRequest(BUSINESS_CODES.MISSING_PARAMETER, '缺少必要的报告信息')
    }

    // 验证严重性等级
    if (!this.isValidBugSeverity(importData.report.severity)) {
      throw BusinessException.badRequest(BUSINESS_CODES.INVALID_PARAMETER, `无效的严重性等级: ${importData.report.severity}`)
    }

    // 对富文本内容进行消毒处理
    const sanitizedDescription = importData.report.description
      ? this.htmlSanitizerService.sanitizeHtml(importData.report.description)
      : undefined

    // 创建新报告 - 此时 severity 已通过类型守卫验证，可以安全使用
    const createData: Prisma.BugReportCreateInput = {
      title: importData.report.title,
      severity: importData.report.severity,
      attackMethod: importData.report.attackMethod,
      description: sanitizedDescription,
      discoveredUrls: importData.report.discoveredUrls ?? [],
      status: dto.asNewReport ? BugReportStatus.DRAFT : BugReportStatus.PENDING,
      user: { connect: { id: currentUser.id } },
      organization: { connect: { id: currentUser.organization.id } },
    }

    const newReport = await this.bugReportsRepository.create(createData)

    // 记录导入操作
    const comment = [
      '从导出文件导入漏洞报告',
      `原报告ID: ${importData.report.id}`,
      `导出时间: ${importData.exportMeta.exportedAt}`,
      `原提交者: ${importData.submitter?.name ?? '未知'}`,
      `原组织: ${importData.organization?.name ?? '未知'}`,
      dto.importNote ? `导入备注: ${dto.importNote}` : '',
    ].filter(Boolean).join('\n')

    await this.bugReportsRepository.createApprovalLog({
      bugReport: { connect: { id: newReport.id } },
      approver: { connect: { id: currentUser.id } },
      action: 'IMPORT',
      comment,
    })

    return newReport
  }

  /**
   * 生成导出文件名
   * 格式：漏洞报告 - {漏洞标题} - {导出时间}
   */
  private generateExportFilename(title: string, extension: string): string {
    // 清理标题中的非法字符
    const cleanTitle = title
      .replace(/[<>:"/\\|?*]/g, '') // 移除文件名中的非法字符
      .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
      .trim()
      .substring(0, 50) // 限制标题长度以避免文件名过长

    // 生成时间戳 (YYYY-MM-DD HH-mm-ss 格式)
    const now = new Date()
    const timestamp = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/[/\s:]/g, (match) => {
      if (match === '/') {
        return '-'
      }

      if (match === ' ') {
        return ' '
      }

      if (match === ':') {
        return '-'
      }

      return match
    })

    return `漏洞报告 - ${cleanTitle} - ${timestamp}.${extension}`
  }
}
