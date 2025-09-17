import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsDateString, IsEnum, IsOptional, ValidateNested } from 'class-validator'

import { BugReportStatus } from '#prisma/client'
import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { IsId } from '~/common/decorators/uuid.decorator'
import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import { VulnerabilitySeverity } from '~/common/enums/severity.enum'
import {
  AdvancedDateSearchOperators,
  AdvancedStringSearchOperators,
} from '~/common/search/dto/advanced-search-operators.dto'
import { BaseSearchDto } from '~/common/search/dto/base-search.dto'

/**
 * 漏洞报告搜索字段 DTO
 * 支持高级搜索操作符，提供强大的查询能力
 */
export class BugReportSearchFields {
  @ApiPropertyOptional({ description: '标题搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  title?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({
    description: '漏洞等级',
    enum: VulnerabilitySeverity,
    example: VulnerabilitySeverity.HIGH,
  })
  @IsOptional()
  @IsEnum(VulnerabilitySeverity)
  severity?: VulnerabilitySeverity

  @ApiPropertyOptional({ description: '攻击方式搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  attackMethod?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '描述搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  description?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({
    description: '状态',
    enum: BugReportStatus,
    example: BugReportStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(BugReportStatus)
  status?: BugReportStatus

  @ApiPropertyOptional({ description: '提交用户ID' })
  @IsOptional()
  @IsId('用户ID')
  userId?: string

  @ApiPropertyOptional({ description: '审核人ID' })
  @IsOptional()
  @IsId('审核人ID')
  reviewerId?: string

  @ApiPropertyOptional({ description: '组织ID' })
  @IsOptional()
  @IsId('组织ID')
  orgId?: string

  @ApiPropertyOptional({ description: '创建时间搜索条件', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  createdAt?: AdvancedDateSearchOperators | Date

  @ApiPropertyOptional({ description: '更新时间搜索条件', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  updatedAt?: AdvancedDateSearchOperators | Date

  @ApiPropertyOptional({ description: '审核时间搜索条件', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  reviewedAt?: AdvancedDateSearchOperators | Date
}

/**
 * 查询漏洞报告 DTO
 * 支持高级搜索功能，使用通用搜索框架
 */
export class FindBugReportsDto extends IntersectionType(
  PaginationQueryDto,
  BaseSearchDto,
  BugReportSearchFields,
) {
  @ApiPropertyOptional({ description: '是否包含关联的用户信息', example: true })
  @IsOptional()
  @IsBoolean({ message: '包含用户信息必须是布尔值' })
  @BooleanTransform()
  includeUser?: boolean

  @ApiPropertyOptional({ description: '是否包含关联的审核人信息', example: true })
  @IsOptional()
  @IsBoolean({ message: '包含审核人信息必须是布尔值' })
  @BooleanTransform()
  includeReviewer?: boolean

  @ApiPropertyOptional({ description: '是否包含关联的组织信息', example: false })
  @IsOptional()
  @IsBoolean({ message: '包含组织信息必须是布尔值' })
  @BooleanTransform()
  includeOrganization?: boolean
}

/**
 * 漏洞报告统计查询 DTO
 */
export class BugReportStatsDto {
  @ApiPropertyOptional({
    description: '组织ID筛选',
    example: 'org-uuid',
  })
  @IsOptional()
  @IsId('组织ID')
  @Expose()
  readonly orgId?: string

  @ApiPropertyOptional({
    description: '统计开始时间（ISO日期字符串）',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '开始时间必须是有效的ISO日期字符串' })
  @Expose()
  readonly startDate?: string

  @ApiPropertyOptional({
    description: '统计结束时间（ISO日期字符串）',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '结束时间必须是有效的ISO日期字符串' })
  @Expose()
  readonly endDate?: string

  @ApiPropertyOptional({
    description: '统计粒度',
    enum: ['day', 'week', 'month', 'year'],
    example: 'day',
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'], {
    message: '统计粒度必须是有效的枚举值',
  })
  @Expose()
  readonly granularity?: 'day' | 'week' | 'month' | 'year'
}
