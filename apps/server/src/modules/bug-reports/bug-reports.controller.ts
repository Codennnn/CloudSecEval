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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { resp, respWithPagination } from '~/common/utils/response.util'
import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard'
import { PERMISSIONS, RequirePermissions } from '~/modules/permissions/decorators/require-permissions.decorator'
import { PermissionsGuard } from '~/modules/permissions/guards/permissions.guard'

import { CurrentUserDto } from '../users/dto/base-user.dto'
import { BugReportsService } from './bug-reports.service'
import {
  BatchOperationResponseDto,
  BugReportResponseDto,
  BugReportStatsResponseDto,
  BugReportSummaryDto,
  PaginatedBugReportsResponseDto,
} from './dto/bug-report-response.dto'
import {
  BatchCreateBugReportsDto,
  CreateBugReportDto,
} from './dto/create-bug-report.dto'
import {
  BugReportStatsDto,
  FindBugReportsDto,
} from './dto/find-bug-reports.dto'
import {
  BatchUpdateBugReportStatusDto,
  ResubmitBugReportDto,
  UpdateBugReportDto,
  UpdateBugReportStatusDto,
} from './dto/update-bug-report.dto'

@ApiTags('漏洞报告管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('bug-reports')
export class BugReportsController {
  constructor(private readonly bugReportsService: BugReportsService) {}

  @Post()
  @ApiOperation({
    summary: '创建漏洞报告',
    description: '用户提交新的漏洞报告，支持附件上传',
  })
  @ApiResponse({
    status: 201,
    description: '漏洞报告创建成功',
    type: BugReportResponseDto,
  })
  @RequirePermissions(PERMISSIONS.bug_reports.create)
  async create(
    @Body() createBugReportDto: CreateBugReportDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const bugReport = await this.bugReportsService.create(createBugReportDto, currentUser)

    return resp({
      data: bugReport,
      dto: BugReportResponseDto,
      msg: '漏洞报告创建成功',
    })
  }

  @Post('batch')
  @ApiOperation({
    summary: '批量创建漏洞报告',
    description: '批量创建多个漏洞报告，适用于导入场景',
  })
  @ApiResponse({
    status: 201,
    description: '批量创建成功',
    type: BatchOperationResponseDto,
  })
  @RequirePermissions([PERMISSIONS.bug_reports.create, PERMISSIONS.bug_reports.batch_operations])
  async batchCreate(
    @Body() batchCreateDto: BatchCreateBugReportsDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const { count } = await this.bugReportsService.batchCreate(batchCreateDto, currentUser)

    return resp({
      data: {
        successCount: count,
        failureCount: 0,
        successIds: [],
        failures: [],
      },
      dto: BatchOperationResponseDto,
      msg: `成功批量创建 ${count} 个漏洞报告`,
    })
  }

  @Get()
  @ApiOperation({
    summary: '获取漏洞报告列表',
    description: '分页查询漏洞报告，支持多种筛选条件和排序',
  })
  @ApiResponse({
    status: 200,
    description: '获取漏洞报告列表成功',
    type: PaginatedBugReportsResponseDto,
  })
  @RequirePermissions(PERMISSIONS.bug_reports.read)
  async findMany(
    @Query() findBugReportsDto: FindBugReportsDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const result = await this.bugReportsService.findMany(findBugReportsDto, currentUser)

    return respWithPagination({
      data: result.data,
      dto: BugReportSummaryDto,
      pageOptions: result.pagination,
      msg: '获取漏洞报告列表成功',
    })
  }

  @Get('stats')
  @ApiOperation({
    summary: '获取漏洞报告统计数据',
    description: '获取漏洞报告的统计信息，按等级、状态、时间等维度分析',
  })
  @ApiResponse({
    status: 200,
    description: '获取统计数据成功',
    type: BugReportStatsResponseDto,
  })
  @RequirePermissions([PERMISSIONS.bug_reports.read, PERMISSIONS.bug_reports.stats])
  async getStats(
    @Query() statsDto: BugReportStatsDto,
  ) {
    const stats = await this.bugReportsService.getStats(statsDto)

    return resp({
      data: stats,
      dto: BugReportStatsResponseDto,
      msg: '获取统计数据成功',
    })
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取漏洞报告详情',
    description: '根据ID获取漏洞报告的详细信息',
  })
  @ApiParam({ name: 'id', description: '漏洞报告ID' })
  @ApiResponse({
    status: 200,
    description: '获取漏洞报告详情成功',
    type: BugReportResponseDto,
  })
  @RequirePermissions(PERMISSIONS.bug_reports.read)
  async findById(
    @Param('id') id: string,
  ) {
    const bugReport = await this.bugReportsService.findById(id)

    return resp({
      data: bugReport,
      dto: BugReportResponseDto,
      msg: '获取漏洞报告成功',
    })
  }

  @Put(':id')
  @ApiOperation({
    summary: '更新漏洞报告',
    description: '更新漏洞报告的内容，只能更新自己未被审核的报告',
  })
  @ApiParam({ name: 'id', description: '漏洞报告ID' })
  @ApiResponse({
    status: 200,
    description: '漏洞报告更新成功',
    type: BugReportResponseDto,
  })
  @RequirePermissions(PERMISSIONS.bug_reports.update)
  async update(
    @Param('id') id: string,
    @Body() updateBugReportDto: UpdateBugReportDto,
  ) {
    const updated = await this.bugReportsService.update(id, updateBugReportDto)

    return resp({
      data: updated,
      dto: BugReportResponseDto,
      msg: '漏洞报告更新成功',
    })
  }

  @Put(':id/status')
  @ApiOperation({
    summary: '更新漏洞报告状态',
    description: '管理员审核漏洞报告，更新报告状态和审核意见',
  })
  @ApiParam({ name: 'id', description: '漏洞报告ID' })
  @ApiResponse({
    status: 200,
    description: '漏洞报告状态更新成功',
    type: BugReportResponseDto,
  })
  @RequirePermissions([PERMISSIONS.bug_reports.review, PERMISSIONS.bug_reports.update_status])
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBugReportStatusDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const updated = await this.bugReportsService.updateStatus(id, updateStatusDto, currentUser)

    return resp({
      data: updated,
      dto: BugReportResponseDto,
      msg: '漏洞报告状态更新成功',
    })
  }

  @Put('batch/status')
  @ApiOperation({
    summary: '批量更新漏洞报告状态',
    description: '管理员批量审核多个漏洞报告',
  })
  @ApiResponse({
    status: 200,
    description: '批量更新状态成功',
    type: BatchOperationResponseDto,
  })
  @RequirePermissions([
    PERMISSIONS.bug_reports.review,
    PERMISSIONS.bug_reports.update_status,
    PERMISSIONS.bug_reports.batch_operations,
  ])
  async batchUpdateStatus(
    @Body() batchUpdateDto: BatchUpdateBugReportStatusDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const result = await this.bugReportsService.batchUpdateStatus(batchUpdateDto, currentUser)

    return resp({
      data: result,
      dto: BatchOperationResponseDto,
      msg: `批量更新完成，成功 ${result.successCount} 个，失败 ${result.failureCount} 个`,
    })
  }

  @Put(':id/resubmit')
  @ApiOperation({
    summary: '重新提交漏洞报告',
    description: '重新提交被驳回的漏洞报告，可以修改内容后重新提交审核',
  })
  @ApiParam({ name: 'id', description: '漏洞报告ID' })
  @ApiResponse({
    status: 200,
    description: '漏洞报告重新提交成功',
    type: BugReportResponseDto,
  })
  @RequirePermissions(PERMISSIONS.bug_reports.update)
  async resubmit(
    @Param('id') id: string,
    @Body() resubmitDto: ResubmitBugReportDto,
  ) {
    const updated = await this.bugReportsService.resubmit(id, resubmitDto)

    return resp({
      data: updated,
      dto: BugReportResponseDto,
      msg: '漏洞报告重新提交成功',
    })
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除漏洞报告',
    description: '删除漏洞报告，只能删除自己未被审核的报告',
  })
  @ApiParam({ name: 'id', description: '漏洞报告ID' })
  @ApiResponse({
    status: 200,
    description: '漏洞报告删除成功',
  })
  @RequirePermissions(PERMISSIONS.bug_reports.delete)
  async delete(
    @Param('id') id: string,
  ) {
    await this.bugReportsService.delete(id)

    return resp({
      msg: '漏洞报告删除成功',
    })
  }
}
