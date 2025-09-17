import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'

import { BugReportStatus } from '#prisma/client'

import { CreateBugReportDto } from './create-bug-report.dto'

/**
 * 更新漏洞报告 DTO
 *
 * 用于接收更新漏洞报告的请求数据
 * 继承自 CreateBugReportDto，所有字段都为可选
 */
export class UpdateBugReportDto extends PartialType(CreateBugReportDto) {
  // 继承自 CreateBugReportDto 的所有字段都变为可选
}

/**
 * 更新漏洞报告状态 DTO
 *
 * 用于管理员审核或更新报告状态
 */
export class UpdateBugReportStatusDto {
  @ApiPropertyOptional({
    description: '新的报告状态',
    enum: BugReportStatus,
    example: BugReportStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(BugReportStatus, {
    message: '报告状态必须是有效的枚举值',
  })
  @Expose()
  readonly status?: BugReportStatus

  @ApiPropertyOptional({
    description: '审核备注',
    example: '漏洞确认，建议尽快修复。影响评估：高危。',
  })
  @IsOptional()
  @IsString({ message: '审核备注必须是字符串' })
  @Expose()
  readonly reviewNote?: string
}

/**
 * 重新提交漏洞报告 DTO
 *
 * 用于被驳回的报告重新提交审核
 */
export class ResubmitBugReportDto extends PickType(UpdateBugReportDto, [
  'title',
  'severity',
  'attackMethod',
  'description',
  'discoveredUrls',
  'attachmentIds',
] as const) {
  @ApiPropertyOptional({
    description: '重新提交说明',
    example: '已根据审核意见修改漏洞描述和附件',
  })
  @IsOptional()
  @IsString({ message: '重新提交说明必须是字符串' })
  @Expose()
  readonly resubmitNote?: string
}
