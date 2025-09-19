import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

import { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'
import { BaseOrganizationDto } from '~/modules/organizations/dto/base-organization.dto'
import { BaseUserDto } from '~/modules/users/dto/base-user.dto'

import { BaseBugReportDto } from './base-bug-report.dto'

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
    description: '附件ID列表',
    type: [String],
    example: ['file-id-1', 'file-id-2'],
  })
  @Expose()
  readonly attachmentIds?: string[]
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
export class PaginatedBugReportsResponseDto
  extends StandardListResponseDto<BugReportSummaryDto> {
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
    description: '附件ID列表',
    type: [String],
    example: ['file-id-1', 'file-id-2'],
  })
  @Expose()
  readonly attachmentIds?: string[]
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
