import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

import { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'
import { BaseOrganizationDto } from '~/modules/organizations/dto/base-organization.dto'
import { BaseUserDto } from '~/modules/users/dto/base-user.dto'

import { AttachmentDto, BaseBugReportDto } from './base-bug-report.dto'

/**
 * 用户引用 DTO（用于漏洞报告响应）
 */
export class UserRefDto extends PickType(BaseUserDto, ['id', 'name', 'email', 'avatarUrl'] as const) {
  @ApiProperty({
    description: '用户ID',
    example: 'user-uuid',
  })
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '用户姓名',
    example: '张三',
  })
  @Expose()
  readonly name!: string

  @ApiProperty({
    description: '用户邮箱',
    example: 'zhangsan@example.com',
  })
  @Expose()
  readonly email!: string

  @ApiPropertyOptional({
    description: '用户头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  @Expose()
  readonly avatarUrl?: string
}

/**
 * 组织引用 DTO（用于漏洞报告响应）
 */
export class OrganizationRefDto extends PickType(BaseOrganizationDto, ['id', 'name', 'code'] as const) {
  @ApiProperty({
    description: '组织ID',
    example: 'org-uuid',
  })
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '组织名称',
    example: '示例公司',
  })
  @Expose()
  readonly name!: string

  @ApiProperty({
    description: '组织编码',
    example: 'EXAMPLE_CORP',
  })
  @Expose()
  readonly code!: string
}

/**
 * 漏洞报告数据 DTO
 *
 * 用于返回漏洞报告的完整信息，包含关联的用户和组织信息
 */
export class BugReportDataDto extends BaseBugReportDto {
  @ApiPropertyOptional({
    description: '提交用户信息',
    type: () => UserRefDto,
  })
  @Type(() => UserRefDto)
  @Expose()
  readonly user?: UserRefDto

  @ApiPropertyOptional({
    description: '审核人信息',
    type: () => UserRefDto,
  })
  @Type(() => UserRefDto)
  @Expose()
  readonly reviewer?: UserRefDto

  @ApiPropertyOptional({
    description: '组织信息',
    type: () => OrganizationRefDto,
  })
  @Type(() => OrganizationRefDto)
  @Expose()
  readonly organization?: OrganizationRefDto

  @ApiPropertyOptional({
    description: '附件详细信息',
    type: [AttachmentDto],
  })
  @Type(() => AttachmentDto)
  @Expose()
  readonly attachments?: AttachmentDto[]
}

/**
 * 漏洞报告响应 DTO
 */
export class BugReportResponseDto extends StandardResponseDto<BugReportDataDto> {
  @ApiProperty({
    description: '漏洞报告数据',
    type: BugReportDataDto,
  })
  @Type(() => BugReportDataDto)
  declare data: BugReportDataDto
}

/**
 * 漏洞报告简要响应 DTO
 *
 * 用于列表展示，包含核心信息但不包含详细描述和附件
 */
export class BugReportSummaryDto extends PickType(BaseBugReportDto, [
  'id',
  'title',
  'severity',
  'status',
  'attackMethod',
  'userId',
  'orgId',
  'createdAt',
  'updatedAt',
] as const) {
  @ApiPropertyOptional({
    description: '提交用户信息',
    type: () => UserRefDto,
  })
  @Type(() => UserRefDto)
  @Expose()
  readonly user?: UserRefDto

  @ApiPropertyOptional({
    description: '附件数量',
    example: 3,
  })
  @Expose()
  readonly attachmentCount?: number

  @ApiPropertyOptional({
    description: '是否有URL',
    example: true,
  })
  @Expose()
  readonly hasUrls?: boolean
}

/**
 * 分页漏洞报告响应 DTO
 */
export class PaginatedBugReportsResponseDto extends StandardListResponseDto<BugReportSummaryDto> {
  @ApiProperty({
    description: '漏洞报告列表',
    type: [BugReportSummaryDto],
  })
  @Type(() => BugReportSummaryDto)
  @Expose()
  readonly data!: BugReportSummaryDto[]
}

/**
 * 我的漏洞报告数据项 DTO
 */
export class MyBugReportDataDto extends PickType(BaseBugReportDto, [
  'id',
  'title',
  'severity',
  'status',
  'attackMethod',
  'description',
  'discoveredUrls',
  'reviewNote',
  'reviewedAt',
  'createdAt',
  'updatedAt',
] as const) {
  @ApiPropertyOptional({
    description: '审核人信息',
    type: () => UserRefDto,
  })
  @Type(() => UserRefDto)
  @Expose()
  readonly reviewer?: UserRefDto

  @ApiPropertyOptional({
    description: '附件信息',
    type: [AttachmentDto],
  })
  @Type(() => AttachmentDto)
  @Expose()
  readonly attachments?: AttachmentDto[]
}

/**
 * 我的漏洞报告响应 DTO
 */
export class MyBugReportResponseDto extends StandardListResponseDto<MyBugReportDataDto> {
  @ApiProperty({
    description: '我的漏洞报告列表数据',
    type: [MyBugReportDataDto],
  })
  @Type(() => MyBugReportDataDto)
  declare data: MyBugReportDataDto[]
}

/**
 * 漏洞报告统计数据 DTO
 */
export class BugReportStatsDataDto {
  @ApiProperty({
    description: '总报告数',
    example: 150,
  })
  @Expose()
  readonly total!: number

  @ApiProperty({
    description: '按等级统计',
    example: {
      INFO: 10,
      LOW: 30,
      MEDIUM: 50,
      HIGH: 40,
      CRITICAL: 20,
    },
  })
  @Expose()
  readonly bySeverity!: Record<string, number>

  @ApiProperty({
    description: '按状态统计',
    example: {
      PENDING: 20,
      IN_REVIEW: 15,
      APPROVED: 80,
      REJECTED: 10,
      RESOLVED: 20,
      CLOSED: 5,
    },
  })
  @Expose()
  readonly byStatus!: Record<string, number>

  @ApiProperty({
    description: '按时间段统计',
    example: [
      { date: '2024-01-01', count: 5 },
      { date: '2024-01-02', count: 8 },
    ],
  })
  @Expose()
  readonly byTime!: { date: string, count: number }[]

  @ApiPropertyOptional({
    description: '最近活跃的报告者',
    type: [UserRefDto],
  })
  @Type(() => UserRefDto)
  @Expose()
  readonly topReporters?: UserRefDto[]

  @ApiPropertyOptional({
    description: '最近活跃的审核者',
    type: [UserRefDto],
  })
  @Type(() => UserRefDto)
  @Expose()
  readonly topReviewers?: UserRefDto[]
}

/**
 * 漏洞报告统计响应 DTO
 */
export class BugReportStatsResponseDto extends StandardResponseDto<BugReportStatsDataDto> {
  @ApiProperty({
    description: '漏洞报告统计数据',
    type: BugReportStatsDataDto,
  })
  @Type(() => BugReportStatsDataDto)
  declare data: BugReportStatsDataDto
}
