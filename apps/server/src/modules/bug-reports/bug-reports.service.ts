import { BadRequestException, Injectable } from '@nestjs/common'

import { BugReport, BugReportStatus, Prisma } from '#prisma/client'
import {
  BUG_REPORT_ATTACHMENTS,
  BUG_REPORT_STATUS_TRANSITIONS,
} from '~/common/constants/bug-reports'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { VulnerabilitySeverity } from '~/common/enums/severity.enum'
import { BusinessException } from '~/common/exceptions/business.exception'
import { UploadsService } from '~/modules/uploads/uploads.service'

import { CurrentUserDto } from '../users/dto/base-user.dto'
import { BugReportsRepository } from './bug-reports.repository'
import { AttachmentDto } from './dto/base-bug-report.dto'
import type { CreateBugReportDto } from './dto/create-bug-report.dto'
import type { SaveDraftDto, SubmitDraftDto } from './dto/draft-bug-report.dto'
import type { BugReportStatsDto, FindBugReportsDto } from './dto/find-bug-reports.dto'
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
  ) {}

  async create(dto: CreateBugReportDto, currentUser: CurrentUserDto) {
    let attachments: AttachmentDto[] | undefined = []

    if (dto.attachmentIds && dto.attachmentIds.length > 0) {
      attachments = await this.processAttachments(dto.attachmentIds)
    }

    const createData: Prisma.BugReportCreateInput = {
      title: dto.title,
      severity: dto.severity,
      attackMethod: dto.attackMethod,
      description: dto.description,
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
      Object.assign({}, dto, { orgId: currentUser.organization.id }),
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

    const updateData: Prisma.BugReportUpdateInput = {
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

    const createData: Prisma.BugReportCreateInput = {
      title: dto.title ?? '未命名草稿',
      severity: dto.severity ?? VulnerabilitySeverity.INFO,
      attackMethod: dto.attackMethod,
      description: dto.description,
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

    const updateData: Prisma.BugReportUpdateInput = {
      ...dto.title && { title: dto.title },
      ...dto.severity && { severity: dto.severity },
      ...dto.attackMethod !== undefined && { attackMethod: dto.attackMethod },
      ...dto.description !== undefined && { description: dto.description },
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

    const updateData: Prisma.BugReportUpdateInput = {
      title: dto.title,
      severity: dto.severity,
      attackMethod: dto.attackMethod,
      description: dto.description,
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
   * 获取漏洞报告统计数据
   */
  async getStats(dto: BugReportStatsDto) {
    const stats = await this.bugReportsRepository.getStats(dto)

    return stats
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
}
