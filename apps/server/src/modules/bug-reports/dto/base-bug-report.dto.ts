import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator'

import { BugReportStatus } from '#prisma/client'
import { IsId } from '~/common/decorators/uuid.decorator'
import { CommonTimeDto } from '~/common/dto/common.dto'
import { VulnerabilitySeverity } from '~/common/enums/severity.enum'

/**
 * 附件信息 DTO
 */
export class AttachmentDto {
  @ApiProperty({
    description: '附件ID（临时文件ID）',
    example: 'abc123',
  })
  @IsString({ message: '附件ID必须是字符串' })
  @IsNotEmpty({ message: '附件ID不能为空' })
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '原始文件名',
    example: 'screenshot.png',
  })
  @IsString({ message: '文件名必须是字符串' })
  @IsNotEmpty({ message: '文件名不能为空' })
  @Expose()
  readonly originalName!: string

  @ApiProperty({
    description: '文件大小（字节）',
    example: 102400,
  })
  @Type(() => Number)
  @Expose()
  readonly size!: number

  @ApiProperty({
    description: '文件MIME类型',
    example: 'image/png',
  })
  @IsString({ message: 'MIME类型必须是字符串' })
  @IsNotEmpty({ message: 'MIME类型不能为空' })
  @Expose()
  readonly mimeType!: string
}

/**
 * 基础漏洞报告字段 DTO
 *
 * 包含所有漏洞报告相关的基础字段，其他漏洞报告 DTO 可以通过 Pick/Omit 方式继承使用
 */
export class BaseBugReportDto extends CommonTimeDto {
  @ApiProperty({
    description: '漏洞报告ID',
    example: 'uuid-string',
  })
  @IsId('漏洞报告ID')
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '报告标题',
    maxLength: 200,
  })
  @IsString({ message: '报告标题必须是字符串' })
  @IsNotEmpty({ message: '报告标题不能为空' })
  @MaxLength(200, { message: '报告标题不能超过 200 个字符' })
  @Expose()
  readonly title!: string

  @ApiProperty({
    description: '漏洞等级',
    enum: VulnerabilitySeverity,
    example: VulnerabilitySeverity.HIGH,
  })
  @IsEnum(VulnerabilitySeverity, {
    message: '漏洞等级必须是有效的枚举值',
  })
  @Expose()
  readonly severity!: VulnerabilitySeverity

  @ApiPropertyOptional({
    description: '攻击方式',
    example: 'SQL注入',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '攻击方式必须是字符串' })
  @MaxLength(100, { message: '攻击方式不能超过 100 个字符' })
  @Expose()
  readonly attackMethod?: string

  @ApiPropertyOptional({
    description: '详细问题描述（富文本）',
    example: '<p>在登录页面发现SQL注入漏洞...</p>',
  })
  @IsOptional()
  @IsString({ message: '问题描述必须是字符串' })
  @Expose()
  readonly description?: string

  @ApiPropertyOptional({
    description: '发现漏洞的URL列表',
    example: ['https://example.com/login', 'https://example.com/admin'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'URL 列表必须是数组' })
  @IsUrl({}, { each: true, message: '每个 URL 必须是有效的 URL 格式' })
  @Expose()
  readonly discoveredUrls?: string[]

  @ApiPropertyOptional({
    description: '附件列表',
    type: [AttachmentDto],
  })
  @IsOptional()
  @IsArray({ message: '附件列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @Expose()
  readonly attachments?: AttachmentDto[]

  @ApiProperty({
    description: '报告状态',
    enum: BugReportStatus,
    example: BugReportStatus.PENDING,
  })
  @IsEnum(BugReportStatus, {
    message: '报告状态必须是有效的枚举值',
  })
  @Expose()
  readonly status!: BugReportStatus

  @ApiProperty({
    description: '提交用户ID',
    example: 'user-uuid',
  })
  @IsId('用户ID')
  @Expose()
  readonly userId!: string

  @ApiProperty({
    description: '组织ID',
    example: 'org-uuid',
  })
  @IsId('组织ID')
  @Expose()
  readonly orgId!: string

  @ApiPropertyOptional({
    description: '审核人ID',
    example: 'reviewer-uuid',
  })
  @IsOptional()
  @IsId('审核人ID')
  @Expose()
  readonly reviewerId?: string

  @ApiPropertyOptional({
    description: '审核备注',
    example: '漏洞确认，建议尽快修复',
  })
  @IsOptional()
  @IsString({ message: '审核备注必须是字符串' })
  @Expose()
  readonly reviewNote?: string

  @ApiPropertyOptional({
    description: '审核时间',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate({ message: '审核时间必须是有效的日期对象' })
  @Type(() => Date)
  @Expose()
  readonly reviewedAt?: Date
}

/**
 * 漏洞报告引用 DTO（用于关联查询）
 */
export class BugReportRefDto {
  @ApiProperty({
    description: '漏洞报告 ID',
    example: 'uuid-string',
  })
  @IsId('漏洞报告 ID')
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '报告标题',
  })
  @IsString({ message: '报告标题必须是字符串' })
  @IsNotEmpty({ message: '报告标题不能为空' })
  @Expose()
  readonly title!: string

  @ApiProperty({
    description: '漏洞等级',
    enum: VulnerabilitySeverity,
    example: VulnerabilitySeverity.HIGH,
  })
  @IsEnum(VulnerabilitySeverity, {
    message: '漏洞等级必须是有效的枚举值',
  })
  @Expose()
  readonly severity!: VulnerabilitySeverity

  @ApiProperty({
    description: '报告状态',
    enum: BugReportStatus,
    example: BugReportStatus.PENDING,
  })
  @IsEnum(BugReportStatus, {
    message: '报告状态必须是有效的枚举值',
  })
  @Expose()
  readonly status!: BugReportStatus

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDate({ message: '创建时间必须是有效的日期对象' })
  @Type(() => Date)
  @Expose()
  readonly createdAt!: Date
}
