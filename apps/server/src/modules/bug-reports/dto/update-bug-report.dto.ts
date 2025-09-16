import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'

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
    enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'],
    example: 'APPROVED',
  })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'], {
    message: '报告状态必须是有效的枚举值',
  })
  @Expose()
  readonly status?: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'CLOSED'

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
 * 批量更新漏洞报告状态 DTO
 */
export class BatchUpdateBugReportStatusDto {
  @ApiPropertyOptional({
    description: '漏洞报告ID列表',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
  })
  @IsString({ each: true, message: '每个漏洞报告ID必须是字符串' })
  @Expose()
  readonly bugReportIds!: string[]

  @ApiPropertyOptional({
    description: '新的报告状态',
    enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'],
    example: 'APPROVED',
  })
  @IsEnum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'], {
    message: '报告状态必须是有效的枚举值',
  })
  @Expose()
  readonly status!: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'CLOSED'

  @ApiPropertyOptional({
    description: '批量审核备注',
    example: '批量审核通过',
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
