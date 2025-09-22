import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'

import { resp, respWithPagination } from '~/common/utils/response.util'
import { BUG_REPORTS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'
import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard'
import { PERMISSIONS, RequirePermissions } from '~/modules/permissions/decorators/require-permissions.decorator'
import { PermissionsGuard } from '~/modules/permissions/guards/permissions.guard'

import { CurrentUserDto } from '../users/dto/base-user.dto'
import { BugReportsService } from './bug-reports.service'
import {
  ProcessApprovalDto,
} from './dto/approval.dto'
import {
  GetApprovalStatusStatsDto,
} from './dto/approval-status-stats.dto'
import {
  CreateBugReportDto,
} from './dto/create-bug-report.dto'
import {
  GetDailyReportsStatsDto,
} from './dto/daily-reports-stats.dto'
import {
  GetDepartmentReportsStatsDto,
} from './dto/department-reports-stats.dto'
import {
  SaveDraftDto,
  SubmitDraftDto,
} from './dto/draft-bug-report.dto'
import {
  ExportBugReportDto,
  ImportBugReportDto,
} from './dto/export-import-bug-report.dto'
import {
  FindBugReportsDto,
} from './dto/find-bug-reports.dto'
import { ExtendedGetApprovalHistoryDto } from './dto/history.dto'
import { GetTimelineDto } from './dto/timeline.dto'
import {
  ResubmitBugReportDto,
  UpdateBugReportDto,
} from './dto/update-bug-report.dto'

@ApiTags('漏洞报告管理')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('bug-reports')
export class BugReportsController {
  constructor(private readonly bugReportsService: BugReportsService) {}

  @Post()
  @ApiDocs(BUG_REPORTS_API_CONFIG.create)
  @RequirePermissions(PERMISSIONS.bug_reports.create)
  async create(
    @Body() createBugReportDto: CreateBugReportDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const bugReport = await this.bugReportsService.create(createBugReportDto, currentUser)

    return resp({
      msg: '漏洞报告创建成功',
      data: bugReport,
    })
  }

  @Get()
  @ApiDocs(BUG_REPORTS_API_CONFIG.findMany)
  @RequirePermissions(PERMISSIONS.bug_reports.read)
  async findMany(
    @Query() findBugReportsDto: FindBugReportsDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const result = await this.bugReportsService.findMany(findBugReportsDto, currentUser)

    return respWithPagination({
      msg: '获取漏洞报告列表成功',
      data: result.data,
      pageOptions: result.pagination,
    })
  }

  @Get('my-reports')
  @ApiDocs(BUG_REPORTS_API_CONFIG.findMyReports)
  @RequirePermissions(PERMISSIONS.bug_reports.read)
  async findMyReports(
    @Query() findBugReportsDto: FindBugReportsDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const result = await this.bugReportsService.findMyReports(findBugReportsDto, currentUser)

    return respWithPagination({
      msg: '获取我的漏洞报告列表成功',
      data: result.data,
      pageOptions: result.pagination,
    })
  }

  @Get('department-reports')
  @ApiDocs(BUG_REPORTS_API_CONFIG.findDepartmentReports)
  @RequirePermissions(PERMISSIONS.bug_reports.read)
  async findDepartmentReports(
    @Query() findBugReportsDto: FindBugReportsDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const result = await this.bugReportsService.findDepartmentReports(
      findBugReportsDto,
      currentUser,
    )

    return respWithPagination({
      msg: '获取部门成员漏洞报告列表成功',
      data: result.data,
      pageOptions: result.pagination,
    })
  }

  @Get('timeline')
  @ApiDocs(BUG_REPORTS_API_CONFIG.getTimeline)
  @RequirePermissions(PERMISSIONS.bug_reports.read)
  async getTimeline(
    @Query() timelineDto: GetTimelineDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const result = await this.bugReportsService.getTimeline(timelineDto, currentUser)

    return respWithPagination({
      msg: '获取审理活动时间线成功',
      data: result.data,
      pageOptions: result.pagination,
    })
  }

  @Post('drafts')
  @ApiDocs(BUG_REPORTS_API_CONFIG.saveDraft)
  @RequirePermissions(PERMISSIONS.bug_reports.create)
  async saveDraft(
    @Body() saveDraftDto: SaveDraftDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const draft = await this.bugReportsService.saveDraft(saveDraftDto, currentUser)

    return resp({
      msg: '草稿保存成功',
      data: draft,
    })
  }

  @Put('drafts/:id')
  @ApiDocs(BUG_REPORTS_API_CONFIG.updateDraft)
  @RequirePermissions(PERMISSIONS.bug_reports.update)
  async updateDraft(
    @Param('id') id: string,
    @Body() updateDraftDto: SaveDraftDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const updated = await this.bugReportsService.updateDraft(id, updateDraftDto, currentUser)

    return resp({
      msg: '草稿更新成功',
      data: updated,
    })
  }

  @Put('drafts/:id/submit')
  @ApiDocs(BUG_REPORTS_API_CONFIG.submitDraft)
  @RequirePermissions(PERMISSIONS.bug_reports.create)
  async submitDraft(
    @Param('id') id: string,
    @Body() submitDraftDto: SubmitDraftDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const submitted = await this.bugReportsService.submitDraft(id, submitDraftDto, currentUser)

    return resp({
      msg: '草稿提交成功',
      data: submitted,
    })
  }

  @Put(':id/resubmit')
  @ApiDocs(BUG_REPORTS_API_CONFIG.resubmit)
  @RequirePermissions(PERMISSIONS.bug_reports.update)
  async resubmit(
    @Param('id') id: string,
    @Body() resubmitDto: ResubmitBugReportDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const updated = await this.bugReportsService.resubmit(id, resubmitDto, currentUser)

    return resp({
      msg: '漏洞报告重新提交成功',
      data: updated,
    })
  }

  @Delete(':id')
  @ApiDocs(BUG_REPORTS_API_CONFIG.delete)
  @RequirePermissions(PERMISSIONS.bug_reports.delete)
  async delete(
    @Param('id') id: string,
  ) {
    await this.bugReportsService.delete(id)

    return resp({
      msg: '漏洞报告删除成功',
    })
  }

  @Post(':id/process')
  @ApiDocs(BUG_REPORTS_API_CONFIG.processApproval)
  @RequirePermissions(PERMISSIONS.bug_reports.review)
  async processApproval(
    @Param('id') id: string,
    @Body() processApprovalDto: ProcessApprovalDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const result = await this.bugReportsService.processApproval(id, processApprovalDto, currentUser)

    return resp({
      msg: this.getApprovalSuccessMessage(processApprovalDto.action),
      data: result,
    })
  }

  @Get(':id/approval-history')
  @ApiDocs(BUG_REPORTS_API_CONFIG.getApprovalHistory)
  @RequirePermissions(PERMISSIONS.bug_reports.read)
  async getApprovalHistory(
    @Param('id') id: string,
    @Query() query: ExtendedGetApprovalHistoryDto,
  ) {
    // 判断是否需要返回扩展历史记录
    const includeSubmissions = query.includeSubmissions ?? true

    let history

    if (includeSubmissions) {
      // 返回包含提交记录的完整历史
      history = await this.bugReportsService.getExtendedApprovalHistory(id, query)
    }
    else {
      // 只返回审批记录，保持向后兼容
      history = await this.bugReportsService.getApprovalHistory(
        id,
        query.includeApprover,
        query.includeTargetUser,
      )
    }

    return resp({
      msg: '获取审批历史成功',
      data: history,
    })
  }

  @Get('department-stats')
  @ApiDocs(BUG_REPORTS_API_CONFIG.getDepartmentReportsStats)
  @RequirePermissions([PERMISSIONS.bug_reports.read, PERMISSIONS.bug_reports.stats])
  async getDepartmentReportsStats(
    @Query() statsDto: GetDepartmentReportsStatsDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const stats = await this.bugReportsService.getDepartmentReportsStats(statsDto, currentUser)

    return resp({
      msg: '获取部门报告统计成功',
      data: stats,
    })
  }

  @Get('approval-status-stats')
  @ApiDocs(BUG_REPORTS_API_CONFIG.getApprovalStatusStats)
  @RequirePermissions([
    PERMISSIONS.bug_reports.read,
    PERMISSIONS.bug_reports.stats,
    PERMISSIONS.bug_reports.client_manage,
  ])
  async getApprovalStatusStats(
    @Query() statsDto: GetApprovalStatusStatsDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const stats = await this.bugReportsService.getApprovalStatusStats(statsDto, currentUser)

    return resp({
      msg: '获取审批状态统计成功',
      data: stats,
    })
  }

  @Get('daily-stats')
  @ApiDocs(BUG_REPORTS_API_CONFIG.getDailyReportsStats)
  @RequirePermissions([
    PERMISSIONS.bug_reports.read,
    PERMISSIONS.bug_reports.stats,
    PERMISSIONS.bug_reports.client_manage,
  ])
  async getDailyReportsStats(
    @Query() statsDto: GetDailyReportsStatsDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const stats = await this.bugReportsService.getDailyReportsStats(statsDto, currentUser)

    return resp({
      msg: '获取每日报告统计成功',
      data: stats,
    })
  }

  @Get(':id')
  @ApiDocs(BUG_REPORTS_API_CONFIG.findById)
  @RequirePermissions(PERMISSIONS.bug_reports.read)
  async findById(
    @Param('id') id: string,
  ) {
    const bugReport = await this.bugReportsService.findById(id)

    return resp({
      msg: '获取漏洞报告详情成功',
      data: bugReport,
    })
  }

  @Put(':id')
  @ApiDocs(BUG_REPORTS_API_CONFIG.update)
  @RequirePermissions(PERMISSIONS.bug_reports.update)
  async update(
    @Param('id') id: string,
    @Body() updateBugReportDto: UpdateBugReportDto,
  ) {
    const updated = await this.bugReportsService.update(id, updateBugReportDto)

    return resp({
      msg: '漏洞报告更新成功',
      data: updated,
    })
  }

  @Get(':id/export')
  @ApiDocs(BUG_REPORTS_API_CONFIG.export)
  @RequirePermissions(PERMISSIONS.bug_reports.read)
  async exportBugReport(
    @Param('id') id: string,
    @Query() exportDto: ExportBugReportDto,
    @CurrentUser() currentUser: CurrentUserDto,
    @Res() response: Response,
  ) {
    const exportResult = await this.bugReportsService.exportBugReport(
      id,
      exportDto,
      currentUser,
    )

    response.setHeader('Content-Type', exportResult.contentType)
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportResult.filename}"`,
    )

    return response.send(exportResult.buffer)
  }

  @Post('import')
  @ApiDocs(BUG_REPORTS_API_CONFIG.import)
  @RequirePermissions(PERMISSIONS.bug_reports.create)
  @UseInterceptors(FileInterceptor('file'))
  async importBugReport(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() importDto: ImportBugReportDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要导入的JSON文件')
    }

    const importedReport = await this.bugReportsService.importBugReport(
      file,
      importDto,
      currentUser,
    )

    return resp({
      msg: '漏洞报告导入成功',
      data: importedReport,
    })
  }

  /**
   * 获取审批成功消息
   */
  private getApprovalSuccessMessage(action: string): string {
    const messages: Record<string, string> = {
      APPROVE: '审批通过',
      REJECT: '已驳回',
      REQUEST_INFO: '已要求补充信息',
      FORWARD: '已转发',
    }

    return messages[action] || '处理完成'
  }
}
