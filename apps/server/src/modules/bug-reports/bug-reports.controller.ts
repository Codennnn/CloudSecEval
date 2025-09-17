import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

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
  GetApprovalHistoryDto,
  ProcessApprovalDto,
} from './dto/approval.dto'
import {
  CreateBugReportDto,
} from './dto/create-bug-report.dto'
import {
  SaveDraftDto,
  SubmitDraftDto,
} from './dto/draft-bug-report.dto'
import {
  BugReportStatsDto,
  FindBugReportsDto,
} from './dto/find-bug-reports.dto'
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

  @Get('stats')
  @ApiDocs(BUG_REPORTS_API_CONFIG.getStats)
  @RequirePermissions([PERMISSIONS.bug_reports.read, PERMISSIONS.bug_reports.stats])
  async getStats(
    @Query() statsDto: BugReportStatsDto,
  ) {
    const stats = await this.bugReportsService.getStats(statsDto)

    return resp({
      msg: '获取统计数据成功',
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
      msg: '获取漏洞报告成功',
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
  ) {
    const updated = await this.bugReportsService.resubmit(id, resubmitDto)

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
    @Query() query: GetApprovalHistoryDto,
  ) {
    const history = await this.bugReportsService.getApprovalHistory(
      id,
      query.includeApprover,
      query.includeTargetUser,
    )

    return resp({
      msg: '获取审批历史成功',
      data: history,
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
