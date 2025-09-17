import { BadRequestException, Injectable } from '@nestjs/common'

import { BugReportStatus, Prisma } from '#prisma/client'
import {
  BUG_REPORT_ATTACHMENTS,
  BUG_REPORT_STATUS,
  BUG_REPORT_STATUS_TRANSITIONS,
} from '~/common/constants/bug-reports'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { UploadsService } from '~/modules/uploads/uploads.service'

import { CurrentUserDto } from '../users/dto/base-user.dto'
import { BugReportsRepository } from './bug-reports.repository'
import { AttachmentDto } from './dto/base-bug-report.dto'
import type { BatchCreateBugReportsDto, CreateBugReportDto } from './dto/create-bug-report.dto'
import type { BugReportStatsDto, FindBugReportsDto } from './dto/find-bug-reports.dto'
import type {
  BatchUpdateBugReportStatusDto,
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
    // 处理附件
    let attachments: AttachmentDto[] | undefined = []

    if (dto.attachmentIds && dto.attachmentIds.length > 0) {
      attachments = await this.processAttachments(dto.attachmentIds)
    }

    // 构建创建数据
    const createData: Prisma.BugReportCreateInput = {
      title: dto.title,
      severity: dto.severity,
      attackMethod: dto.attackMethod,
      description: dto.description,
      discoveredUrls: dto.discoveredUrls ?? [],
      attachments: attachments.length > 0
        ? (attachments as unknown as Prisma.InputJsonValue)
        : undefined,
      status: BUG_REPORT_STATUS.PENDING,
      user: { connect: { id: currentUser.id } },
      organization: { connect: { id: currentUser.organization.id } },
    }

    const bugReport = await this.bugReportsRepository.create(createData)

    return bugReport
  }

  /**
   * 批量创建漏洞报告
   */
  async batchCreate(dto: BatchCreateBugReportsDto, currentUser: CurrentUserDto) {
    const createData = dto.bugReports.map((report) => ({
      title: report.title,
      severity: report.severity,
      attackMethod: report.attackMethod,
      description: report.description,
      discoveredUrls: report.discoveredUrls ?? [],
      status: BUG_REPORT_STATUS.PENDING,
      userId: currentUser.id,
      orgId: currentUser.organization.id,
    }))

    const result = await this.bugReportsRepository.createMany(createData)

    return { count: result.count }
  }

  /**
   * 根据ID获取漏洞报告
   */
  async findById(id: string) {
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
   * 批量更新漏洞报告状态
   */
  async batchUpdateStatus(dto: BatchUpdateBugReportStatusDto, currentUser: CurrentUserDto) {
    // 验证所有报告是否存在
    const bugReports = await this.bugReportsRepository.findByIds(dto.bugReportIds, false)

    const validIds: string[] = []
    const failures: { id: string, error: string }[] = []

    for (const id of dto.bugReportIds) {
      const report = bugReports.find((r) => r.id === id)

      if (!report) {
        failures.push({ id, error: '报告不存在' })
        continue
      }

      try {
        this.validateStatusTransition(report.status, dto.status)
        validIds.push(id)
      }
      catch (error) {
        failures.push({ id, error: error instanceof Error ? error.message : '状态更新失败' })
      }
    }

    // 执行批量更新
    if (validIds.length > 0) {
      await this.bugReportsRepository.updateManyStatus(
        validIds,
        dto.status,
        currentUser.id,
        dto.reviewNote,
      )
    }

    return {
      successCount: validIds.length,
      failureCount: failures.length,
      successIds: validIds,
      failures,
    }
  }

  /**
   * 重新提交漏洞报告
   */
  async resubmit(id: string, dto: ResubmitBugReportDto) {
    const bugReport = await this.findBugReportOrThrow(id)

    if (bugReport.status !== BUG_REPORT_STATUS.REJECTED) {
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
      status: BUG_REPORT_STATUS.PENDING,
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
   * 获取漏洞报告统计数据
   */
  async getStats(dto: BugReportStatsDto) {
    const stats = await this.bugReportsRepository.getStats(dto)

    return stats
  }

  /**
   * 处理附件（将存储文件ID转换为持久化的附件信息）
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async processAttachments(attachmentIds: string[]) {
    if (attachmentIds.length > BUG_REPORT_ATTACHMENTS.MAX_COUNT) {
      throw new BadRequestException(
        `附件数量不能超过 ${BUG_REPORT_ATTACHMENTS.MAX_COUNT} 个`,
      )
    }

    const attachments = []

    for (const attachmentId of attachmentIds) {
      const storedFile = this.uploadsService.getStoredFile(attachmentId)

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

    if (typeof allowedTransitions !== 'string') {
      throw BusinessException.badRequest(BUSINESS_CODES.INVALID_STATUS_TRANSITION)
    }

    const isValidTransition = (allowedTransitions as readonly string[]).includes(newStatus)

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
