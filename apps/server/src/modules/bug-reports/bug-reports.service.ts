import { BadRequestException, Injectable } from '@nestjs/common'

import { BugReport, BugReportStatus, Prisma, User } from '#prisma/client'
import {
  BUG_REPORT_ATTACHMENTS,
  BUG_REPORT_STATUS,
  BUG_REPORT_STATUS_TRANSITIONS,
} from '~/common/constants/bug-reports'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { UploadsService } from '~/modules/uploads/uploads.service'

import { BugReportsRepository } from './bug-reports.repository'
import { AttachmentDto } from './dto/base-bug-report.dto'
import type { BatchCreateBugReportsDto, CreateBugReportDto, QuickCreateBugReportDto } from './dto/create-bug-report.dto'
import type { BugReportStatsDto, FindBugReportsDto, FindMyBugReportsDto } from './dto/find-bug-reports.dto'
import type {
  BatchUpdateBugReportStatusDto,
  ResubmitBugReportDto,
  UpdateBugReportDto,
  UpdateBugReportStatusDto,
} from './dto/update-bug-report.dto'

/**
 * 漏洞报告业务逻辑层
 *
 * 处理漏洞报告相关的业务逻辑，包括权限检查、文件处理、状态流转等
 */
@Injectable()
export class BugReportsService {
  constructor(
    private readonly bugReportsRepository: BugReportsRepository,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * 创建漏洞报告
   */
  async create(dto: CreateBugReportDto, currentUser: User) {
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
      organization: { connect: { id: currentUser.orgId } },
    }

    const bugReport = await this.bugReportsRepository.create(createData)

    return bugReport
  }

  /**
   * 快速创建漏洞报告
   */
  async quickCreate(dto: QuickCreateBugReportDto, currentUser: User) {
    const createData: Prisma.BugReportCreateInput = {
      title: dto.title,
      severity: dto.severity,
      description: dto.description,
      status: BUG_REPORT_STATUS.PENDING,
      user: { connect: { id: currentUser.id } },
      organization: { connect: { id: currentUser.orgId } },
    }

    const bugReport = await this.bugReportsRepository.create(createData)

    return bugReport
  }

  /**
   * 批量创建漏洞报告
   */
  async batchCreate(dto: BatchCreateBugReportsDto, currentUser: User) {
    const createData = dto.bugReports.map((report) => ({
      title: report.title,
      severity: report.severity,
      attackMethod: report.attackMethod,
      description: report.description,
      discoveredUrls: report.discoveredUrls ?? [],
      status: BUG_REPORT_STATUS.PENDING,
      userId: currentUser.id,
      orgId: currentUser.orgId,
    }))

    const result = await this.bugReportsRepository.createMany(createData)

    return { count: result.count }
  }

  /**
   * 根据ID获取漏洞报告
   */
  async findById(id: string, currentUser: User) {
    const bugReport = await this.bugReportsRepository.findById(id, true)

    if (!bugReport) {
      throw BusinessException.notFound(BUSINESS_CODES.BUG_REPORT_NOT_FOUND)
    }

    // 权限检查：只能查看自己的报告或管理员可以查看组织内的报告
    await this.checkReadPermission(bugReport, currentUser)

    return bugReport
  }

  /**
   * 查询漏洞报告列表
   */
  async findMany(dto: FindBugReportsDto, currentUser: User) {
    // 非管理员只能查看自己组织内的报告
    if (!this.isAdmin(currentUser)) {
      dto = Object.assign({}, dto, { orgId: currentUser.orgId })
    }

    const result = await this.bugReportsRepository.findMany(dto)

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
   * 获取我的漏洞报告
   */
  async findMyReports(dto: FindMyBugReportsDto, currentUser: User) {
    const result = await this.bugReportsRepository.findMyReports(currentUser.id, dto)

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
  async update(id: string, dto: UpdateBugReportDto, currentUser: User) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 权限检查：只能更新自己的报告，且未被审核
    await this.checkUpdatePermission(bugReport, currentUser)

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
  async updateStatus(id: string, dto: UpdateBugReportStatusDto, currentUser: User) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 权限检查：只有管理员可以更新状态
    this.checkAdminPermission(currentUser)

    // 业务逻辑检查
    if (dto.status) {
      this.validateStatusTransition(bugReport.status, dto.status)
      this.validateReviewPermission(bugReport, currentUser)
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
  async batchUpdateStatus(dto: BatchUpdateBugReportStatusDto, currentUser: User) {
    // 权限检查：只有管理员可以批量更新状态
    this.checkAdminPermission(currentUser)

    // 验证所有报告是否存在且在当前用户组织内
    const bugReports = await this.bugReportsRepository.findByIds(dto.bugReportIds, false)

    const validIds: string[] = []
    const failures: { id: string, error: string }[] = []

    for (const id of dto.bugReportIds) {
      const report = bugReports.find((r) => r.id === id)

      if (!report) {
        failures.push({ id, error: '报告不存在' })
        continue
      }

      if (!this.isAdmin(currentUser) && report.orgId !== currentUser.orgId) {
        failures.push({ id, error: '无权限操作' })
        continue
      }

      try {
        this.validateStatusTransition(report.status, dto.status)
        this.validateReviewPermission(report, currentUser)
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
  async resubmit(id: string, dto: ResubmitBugReportDto, currentUser: User) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 权限检查：只能重新提交自己被驳回的报告
    if (bugReport.userId !== currentUser.id) {
      throw BusinessException.forbidden(BUSINESS_CODES.BUG_REPORT_ACCESS_DENIED)
    }

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
  async delete(id: string, currentUser: User) {
    const bugReport = await this.findBugReportOrThrow(id)

    // 权限检查：只能删除自己未被审核的报告，或管理员可以删除组织内的报告
    await this.checkDeletePermission(bugReport, currentUser)

    await this.bugReportsRepository.delete(id)

    // 删除成功，无需返回数据，由控制器负责返回提示信息
  }

  /**
   * 获取漏洞报告统计数据
   */
  async getStats(dto: BugReportStatsDto, currentUser: User) {
    // 非管理员只能查看自己组织的统计
    if (!this.isAdmin(currentUser)) {
      dto = Object.assign({}, dto, { orgId: currentUser.orgId })
    }

    const stats = await this.bugReportsRepository.getStats(dto)

    return stats
  }

  /**
   * 处理附件（将临时文件ID转换为持久化的附件信息）
   */
  private async processAttachments(attachmentIds: string[]) {
    if (attachmentIds.length > BUG_REPORT_ATTACHMENTS.MAX_COUNT) {
      throw new BadRequestException(
        `附件数量不能超过 ${BUG_REPORT_ATTACHMENTS.MAX_COUNT} 个`,
      )
    }

    const attachments = []

    for (const attachmentId of attachmentIds) {
      const tempFile = await this.uploadsService.getTempFile(attachmentId)

      if (!tempFile) {
        throw BusinessException.notFound(BUSINESS_CODES.INVALID_ATTACHMENT_ID)
      }

      // 验证文件类型和大小
      if (
        !BUG_REPORT_ATTACHMENTS.ALLOWED_TYPES
          .includes(tempFile.mimeType as (typeof BUG_REPORT_ATTACHMENTS.ALLOWED_TYPES)[number])
      ) {
        throw new BadRequestException(`不支持的文件类型: ${tempFile.mimeType}`)
      }

      if (tempFile.size > BUG_REPORT_ATTACHMENTS.MAX_SIZE) {
        throw new BadRequestException(
          `文件大小不能超过 ${BUG_REPORT_ATTACHMENTS.MAX_SIZE / 1024 / 1024}MB`,
        )
      }

      attachments.push({
        id: tempFile.id,
        originalName: tempFile.originalName,
        fileName: tempFile.fileName,
        mimeType: tempFile.mimeType,
        size: tempFile.size,
        hash: tempFile.hash,
        uploadedAt: tempFile.uploadedAt,
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

    if (!allowedTransitions) {
      throw BusinessException.badRequest(BUSINESS_CODES.INVALID_STATUS_TRANSITION)
    }

    const isValidTransition = (allowedTransitions as readonly string[]).includes(newStatus)

    if (!isValidTransition) {
      throw BusinessException.badRequest(BUSINESS_CODES.INVALID_STATUS_TRANSITION)
    }
  }

  /**
   * 验证审核权限（不能审核自己的报告）
   */
  private validateReviewPermission(bugReport: BugReport, currentUser: User) {
    if (bugReport.userId === currentUser.id) {
      throw BusinessException.badRequest(BUSINESS_CODES.CANNOT_APPROVE_OWN_BUG_REPORT)
    }
  }

  /**
   * 检查读取权限
   */
  private async checkReadPermission(bugReport: BugReport, currentUser: User) {
    const isOwner = bugReport.userId === currentUser.id
    const isInSameOrg = bugReport.orgId === currentUser.orgId
    const isAdmin = this.isAdmin(currentUser)

    if (!isOwner && !isInSameOrg && !isAdmin) {
      throw BusinessException.forbidden(BUSINESS_CODES.BUG_REPORT_ACCESS_DENIED)
    }
  }

  /**
   * 检查更新权限
   */
  private async checkUpdatePermission(bugReport: BugReport, currentUser: User) {
    // 只能更新自己的报告
    if (bugReport.userId !== currentUser.id) {
      throw BusinessException.forbidden(BUSINESS_CODES.BUG_REPORT_ACCESS_DENIED)
    }

    // 已审核的报告不能修改
    if (
      bugReport.status !== BUG_REPORT_STATUS.PENDING
      && bugReport.status !== BUG_REPORT_STATUS.REJECTED
      && bugReport.status !== BUG_REPORT_STATUS.CLOSED
    ) {
      throw BusinessException.badRequest(BUSINESS_CODES.CANNOT_EDIT_REVIEWED_BUG_REPORT)
    }
  }

  /**
   * 检查删除权限
   */
  private async checkDeletePermission(bugReport: BugReport, currentUser: User) {
    const isOwner = bugReport.userId === currentUser.id
    const isAdmin = this.isAdmin(currentUser)
    const isInSameOrg = bugReport.orgId === currentUser.orgId

    if (!isOwner && !(isAdmin && isInSameOrg)) {
      throw BusinessException.forbidden(BUSINESS_CODES.BUG_REPORT_ACCESS_DENIED)
    }

    // 用户只能删除自己未被审核的报告
    if (isOwner && !isAdmin) {
      if (
        bugReport.status !== BUG_REPORT_STATUS.PENDING
        && bugReport.status !== BUG_REPORT_STATUS.REJECTED
        && bugReport.status !== BUG_REPORT_STATUS.CLOSED
      ) {
        throw BusinessException.badRequest(BUSINESS_CODES.CANNOT_DELETE_REVIEWED_BUG_REPORT)
      }
    }
  }

  /**
   * 检查管理员权限
   */
  private checkAdminPermission(currentUser: User) {
    if (!this.isAdmin(currentUser)) {
      throw BusinessException.forbidden(BUSINESS_CODES.INSUFFICIENT_PERMISSIONS)
    }
  }

  /**
   * 判断是否为管理员
   */
  private isAdmin(user: User): boolean {
    // 这里应该根据实际的权限系统来判断
    // 暂时简化处理，实际项目中应该检查用户的角色权限
    return user.email.includes('admin') // 临时实现，实际应该检查角色
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
