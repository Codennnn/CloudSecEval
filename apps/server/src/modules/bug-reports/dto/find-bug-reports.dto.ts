import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { IsId } from '~/common/decorators/uuid.decorator'
import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'

/**
 * 查询漏洞报告 DTO
 *
 * 用于接收查询漏洞报告的请求参数，支持多种筛选条件
 */
export class FindBugReportsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '漏洞等级筛选',
    enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH',
  })
  @IsOptional()
  @IsEnum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: '漏洞等级必须是有效的枚举值',
  })
  @Expose()
  readonly severity?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  @ApiPropertyOptional({
    description: '多个漏洞等级筛选',
    enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    isArray: true,
    example: ['HIGH', 'CRITICAL'],
  })
  @IsOptional()
  @IsArray({ message: '漏洞等级列表必须是数组' })
  @IsEnum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    each: true,
    message: '每个漏洞等级必须是有效的枚举值',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim())
    }

    return value
  })
  @Expose()
  readonly severities?: ('INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[]

  @ApiPropertyOptional({
    description: '报告状态筛选',
    enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'],
    example: 'PENDING',
  })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'], {
    message: '报告状态必须是有效的枚举值',
  })
  @Expose()
  readonly status?: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'CLOSED'

  @ApiPropertyOptional({
    description: '多个报告状态筛选',
    enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'],
    isArray: true,
    example: ['PENDING', 'IN_REVIEW'],
  })
  @IsOptional()
  @IsArray({ message: '报告状态列表必须是数组' })
  @IsEnum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'], {
    each: true,
    message: '每个报告状态必须是有效的枚举值',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim())
    }

    return value
  })
  @Expose()
  readonly statuses?: ('PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'CLOSED')[]

  @ApiPropertyOptional({
    description: '提交用户ID筛选',
    example: 'user-uuid',
  })
  @IsOptional()
  @IsId('用户ID')
  @Expose()
  readonly userId?: string

  @ApiPropertyOptional({
    description: '审核人ID筛选',
    example: 'reviewer-uuid',
  })
  @IsOptional()
  @IsId('审核人ID')
  @Expose()
  readonly reviewerId?: string

  @ApiPropertyOptional({
    description: '组织ID筛选',
    example: 'org-uuid',
  })
  @IsOptional()
  @IsId('组织ID')
  @Expose()
  readonly orgId?: string

  @ApiPropertyOptional({
    description: '标题关键词搜索',
    example: 'SQL注入',
  })
  @IsOptional()
  @IsString({ message: '标题关键词必须是字符串' })
  @Expose()
  readonly titleKeyword?: string

  @ApiPropertyOptional({
    description: '攻击方式关键词搜索',
    example: 'SQL',
  })
  @IsOptional()
  @IsString({ message: '攻击方式关键词必须是字符串' })
  @Expose()
  readonly attackMethodKeyword?: string

  @ApiPropertyOptional({
    description: '描述关键词搜索',
    example: '登录',
  })
  @IsOptional()
  @IsString({ message: '描述关键词必须是字符串' })
  @Expose()
  readonly descriptionKeyword?: string

  @ApiPropertyOptional({
    description: '创建时间开始筛选（ISO日期字符串）',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '开始时间必须是有效的ISO日期字符串' })
  @Expose()
  readonly createdAtStart?: string

  @ApiPropertyOptional({
    description: '创建时间结束筛选（ISO日期字符串）',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '结束时间必须是有效的ISO日期字符串' })
  @Expose()
  readonly createdAtEnd?: string

  @ApiPropertyOptional({
    description: '是否包含附件筛选',
    example: true,
  })
  @IsOptional()
  @BooleanTransform()
  @Expose()
  readonly hasAttachments?: boolean

  @ApiPropertyOptional({
    description: '排序字段',
    enum: ['createdAt', 'updatedAt', 'severity', 'status', 'title'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'severity', 'status', 'title'], {
    message: '排序字段必须是有效的枚举值',
  })
  @Expose()
  readonly sortBy?: 'createdAt' | 'updatedAt' | 'severity' | 'status' | 'title'

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: '排序方向必须是 ASC 或 DESC',
  })
  @Expose()
  readonly sortOrder?: 'ASC' | 'DESC'

  @ApiPropertyOptional({
    description: '是否包含关联的用户信息',
    example: true,
  })
  @IsOptional()
  @BooleanTransform()
  @Expose()
  readonly includeUser?: boolean

  @ApiPropertyOptional({
    description: '是否包含关联的审核人信息',
    example: true,
  })
  @IsOptional()
  @BooleanTransform()
  @Expose()
  readonly includeReviewer?: boolean

  @ApiPropertyOptional({
    description: '是否包含关联的组织信息',
    example: false,
  })
  @IsOptional()
  @BooleanTransform()
  @Expose()
  readonly includeOrganization?: boolean
}

/**
 * 我的漏洞报告查询 DTO
 *
 * 用于用户查询自己提交的漏洞报告
 */
export class FindMyBugReportsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '漏洞等级筛选',
    enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH',
  })
  @IsOptional()
  @IsEnum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: '漏洞等级必须是有效的枚举值',
  })
  @Expose()
  readonly severity?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  @ApiPropertyOptional({
    description: '报告状态筛选',
    enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'],
    example: 'PENDING',
  })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'], {
    message: '报告状态必须是有效的枚举值',
  })
  @Expose()
  readonly status?: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'CLOSED'

  @ApiPropertyOptional({
    description: '标题关键词搜索',
    example: 'SQL注入',
  })
  @IsOptional()
  @IsString({ message: '标题关键词必须是字符串' })
  @Expose()
  readonly titleKeyword?: string

  @ApiPropertyOptional({
    description: '创建时间开始筛选（ISO日期字符串）',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '开始时间必须是有效的ISO日期字符串' })
  @Expose()
  readonly createdAtStart?: string

  @ApiPropertyOptional({
    description: '创建时间结束筛选（ISO日期字符串）',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '结束时间必须是有效的ISO日期字符串' })
  @Expose()
  readonly createdAtEnd?: string
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
