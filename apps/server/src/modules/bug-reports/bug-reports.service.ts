import { BadRequestException, Injectable } from '@nestjs/common'

import { BugReport, BugReportStatus, Prisma } from '#prisma/client'
import {
  BUG_REPORT_ATTACHMENTS,
  BUG_REPORT_STATUS_TRANSITIONS,
} from '~/common/constants/bug-reports'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { VulnerabilitySeverity } from '~/common/enums/severity.enum'
import { BusinessException } from '~/common/exceptions/business.exception'
import { HtmlSanitizerService } from '~/common/services/html-sanitizer.service'
import { UploadsService } from '~/modules/uploads/uploads.service'

import { CurrentUserDto } from '../users/dto/base-user.dto'
import { BugReportsRepository } from './bug-reports.repository'
import { ApprovalAction, ProcessApprovalDto } from './dto/approval.dto'
import type { ApprovalStatusStatsDataDto, GetApprovalStatusStatsDto } from './dto/approval-status-stats.dto'
import { AttachmentDto } from './dto/base-bug-report.dto'
import type { CreateBugReportDto } from './dto/create-bug-report.dto'
import type { DepartmentReportsStatsDataDto, GetDepartmentReportsStatsDto } from './dto/department-reports-stats.dto'
import type { SaveDraftDto, SubmitDraftDto } from './dto/draft-bug-report.dto'
import type { FindBugReportsDto } from './dto/find-bug-reports.dto'
import type { GetTimelineDto } from './dto/timeline.dto'
import type {
  ResubmitBugReportDto,
  UpdateBugReportDto,
  UpdateBugReportStatusDto,
} from './dto/update-bug-report.dto'

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

    return bugReport
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
  async resubmit(id: string, dto: ResubmitBugReportDto) {
    const bugReport = await this.findBugReportOrThrow(id)

    if (bugReport.status !== BugReportStatus.REJECTED) {
      throw new BadRequestException('只能重新提交被驳回的报告')
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

    return updatedBugReport
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
      throw new BadRequestException('只能更新草稿状态的报告')
    }

    if (bugReport.userId !== currentUser.id) {
      throw new BadRequestException('只能更新自己的草稿')
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
      throw new BadRequestException('只能提交草稿状态的报告')
    }

    if (bugReport.userId !== currentUser.id) {
      throw new BadRequestException('只能提交自己的草稿')
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
      throw new BadRequestException(
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
        throw new BadRequestException(`不支持的文件类型: ${storedFile.mimeType}`)
      }

      if (storedFile.size > BUG_REPORT_ATTACHMENTS.MAX_SIZE) {
        throw new BadRequestException(
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

    // 记录审批日志
    await this.recordApprovalLog(id, {
      action: dto.action,
      comment: dto.comment,
      approverId: currentUser.id,
      targetUserId: dto.targetUserId,
    })

    // 根据审批动作执行相应逻辑
    switch (dto.action) {
      case ApprovalAction.APPROVE:
        return this.handleApprove(bugReport, dto, currentUser)

      case ApprovalAction.REJECT:
        return this.handleReject(bugReport, dto, currentUser)

      case ApprovalAction.REQUEST_INFO:
        return this.handleRequestInfo(bugReport, dto, currentUser)

      case ApprovalAction.FORWARD:
        return this.handleForward(bugReport, dto, currentUser)

      default:
        throw new BadRequestException('不支持的审批动作')
    }
  }

  /**
   * 获取审批历史
   */
  async getApprovalHistory(id: string, includeApprover = true, includeTargetUser = true) {
    // 验证漏洞报告是否存在
    await this.findBugReportOrThrow(id)

    return this.bugReportsRepository.getApprovalHistory(id, includeApprover, includeTargetUser)
  }

  /**
   * 处理审批通过
   */
  private async handleApprove(
    bugReport: BugReport,
    dto: ProcessApprovalDto,
    currentUser: CurrentUserDto,
  ) {
    // 检查是否需要多级审批（这里简化处理，可根据实际需求扩展）
    const needsSecondApproval = this.needsSecondApproval(bugReport)

    if (needsSecondApproval && bugReport.status === BugReportStatus.PENDING) {
      // 第一级审批通过，进入审核中状态
      return this.updateStatus(bugReport.id, {
        status: BugReportStatus.IN_REVIEW,
        reviewNote: dto.comment,
      }, currentUser)
    }
    else {
      // 最终审批通过
      return this.updateStatus(bugReport.id, {
        status: BugReportStatus.APPROVED,
        reviewNote: dto.comment,
      }, currentUser)
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
      throw new BadRequestException('转发操作需要指定目标用户')
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
      throw new BadRequestException(`当前状态 ${bugReport.status} 不允许审批操作`)
    }

    // 检查组织权限
    if (bugReport.orgId !== currentUser.organization.id) {
      throw new BadRequestException('只能审批本组织的漏洞报告')
    }

    // 检查是否是自己提交的报告（不能自审）
    if (bugReport.userId === currentUser.id) {
      throw new BadRequestException('不能审批自己提交的漏洞报告')
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
   * 判断是否需要二级审批
   */
  private needsSecondApproval(bugReport: BugReport): boolean {
    // 这里可以根据业务规则决定是否需要二级审批
    // 例如：高危和严重等级的漏洞需要二级审批
    const highRiskSeverities = ['HIGH', 'CRITICAL']

    return highRiskSeverities.includes(bugReport.severity)
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
  ): Promise<ApprovalStatusStatsDataDto> {
    const stats = await this.bugReportsRepository.getApprovalStatusStats(
      dto,
      currentUser.organization.id,
    )

    return stats
  }
}
