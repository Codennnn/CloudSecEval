import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDateString, IsEnum, IsOptional } from 'class-validator'

import { BugReportStatus, BugSeverity } from '#prisma/client'
import { StandardResponseDto } from '~/common/dto/standard-response.dto'

import { BaseBugReportDto } from './base-bug-report.dto'

/**
 * 获取审批状态统计的查询参数 DTO
 */
export class GetApprovalStatusStatsDto {
  @ApiPropertyOptional({
    description: '开始日期（ISO 8601格式）',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  readonly startDate?: string

  @ApiPropertyOptional({
    description: '结束日期（ISO 8601格式）',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  readonly endDate?: string

  @ApiPropertyOptional({
    description: '漏洞等级过滤',
    enum: BugSeverity,
    example: BugSeverity.HIGH,
  })
  @IsOptional()
  @IsEnum(BugSeverity, { message: '漏洞等级必须是有效的枚举值' })
  readonly severity?: BugSeverity
}

/**
 * 审批状态统计数据项 DTO
 */
export class ApprovalStatusStatsDto
  extends PickType(BaseBugReportDto, ['status']) {
  @ApiProperty({
    description: '报告数量',
    example: 15,
  })
  @Expose()
  readonly count!: number

  @ApiProperty({
    description: '占总数的百分比',
    example: 23.5,
  })
  @Expose()
  readonly percentage!: number
}

/**
 * 审批状态统计响应数据 DTO
 */
export class ApprovalStatusStatsDataDto {
  @ApiProperty({
    description: '总报告数',
    example: 64,
  })
  @Expose()
  readonly totalReports!: number

  @ApiProperty({
    description: '状态统计详情，key 为状态值，value 为包含状态和统计信息的对象',
    additionalProperties: {
      type: 'object',
      properties: {
        status: { enum: Object.values(BugReportStatus) },
        count: { type: 'number' },
        percentage: { type: 'number' },
      },
    },
  })
  @Expose()
  readonly statusStats!: Record<BugReportStatus, ApprovalStatusStatsDto>
}

/**
 * 审批状态统计响应 DTO
 */
export class ApprovalStatusStatsResponseDto
  extends StandardResponseDto<ApprovalStatusStatsDataDto> {
  @ApiProperty({
    description: '审批状态统计数据',
    type: ApprovalStatusStatsDataDto,
  })
  @Type(() => ApprovalStatusStatsDataDto)
  declare data: ApprovalStatusStatsDataDto
}
