import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, Length, Matches, ValidateNested } from 'class-validator'

import { BugReportStatus } from '#prisma/client'
import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { VulnerabilitySeverity } from '~/common/enums/severity.enum'

/**
 * 导出格式枚举
 */
export enum ExportFormat {
  JSON = 'json',
  WORD = 'word',
  PACKAGE = 'package',
}

/**
 * 导出选项 DTO
 */
export class ExportBugReportDto {
  @ApiPropertyOptional({
    description: '导出格式',
    enum: ExportFormat,
    default: ExportFormat.JSON,
  })
  @IsOptional()
  @IsEnum(ExportFormat, { message: '导出格式必须是有效的枚举值' })
  @Expose()
  readonly format?: ExportFormat = ExportFormat.JSON

  @ApiPropertyOptional({
    description: '是否包含附件内容（base64编码）',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: '包含附件内容选项必须是布尔值' })
  @BooleanTransform(false)
  @Expose()
  readonly includeAttachmentContent?: boolean = false

  @ApiPropertyOptional({
    description: '是否包含审批历史',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: '包含审批历史选项必须是布尔值' })
  @BooleanTransform(true)
  @Expose()
  readonly includeHistory?: boolean = true
}

/**
 * 压缩包导出选项 DTO
 */
export class ExportBugReportPackageDto {
  @ApiPropertyOptional({
    description: '是否包含JSON格式文件',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: '包含JSON选项必须是布尔值' })
  @BooleanTransform(true)
  @Expose()
  readonly includeJson?: boolean = true

  @ApiPropertyOptional({
    description: '是否包含Word格式文件',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: '包含Word选项必须是布尔值' })
  @BooleanTransform(true)
  @Expose()
  readonly includeWord?: boolean = true

  @ApiPropertyOptional({
    description: '是否包含原始附件文件',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: '包含附件选项必须是布尔值' })
  @BooleanTransform(true)
  @Expose()
  readonly includeAttachments?: boolean = true

  @ApiPropertyOptional({
    description: '是否包含审批历史',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: '包含审批历史选项必须是布尔值' })
  @BooleanTransform(true)
  @Expose()
  readonly includeHistory?: boolean = true

  @ApiPropertyOptional({
    description: '压缩包文件名前缀（不包含扩展名）',
  })
  @IsOptional()
  @IsString({ message: '文件名前缀必须是字符串' })
  @Length(1, 100, { message: '文件名前缀长度必须在1-100个字符之间' })
  @Matches(/^[^<>:"/\\|?*]+$/, {
    message: '文件名前缀不能包含以下字符: < > : " / \\ | ? *',
  })
  @Expose()
  readonly filenamePrefix?: string
}

/**
 * 导入选项 DTO
 */
export class ImportBugReportDto {
  @ApiPropertyOptional({
    description: '是否作为新报告导入（忽略原有ID）',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @BooleanTransform(true)
  @Expose()
  readonly asNewReport?: boolean = true

  @ApiPropertyOptional({
    description: '是否导入审批历史',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @BooleanTransform(true)
  @Expose()
  readonly includeHistory?: boolean = true

  @ApiPropertyOptional({
    description: '导入备注',
  })
  @IsOptional()
  @IsString()
  @Expose()
  readonly importNote?: string
}

/**
 * 用户信息 DTO
 */
export class ExportUserDto {
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
 * 组织信息 DTO
 */
export class ExportOrganizationDto {
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
 * 附件信息 DTO
 */
export class ExportAttachmentDto {
  @ApiProperty({
    description: '附件ID',
    example: 'attachment-uuid',
  })
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '原始文件名',
    example: 'screenshot.png',
  })
  @Expose()
  readonly originalName!: string

  @ApiProperty({
    description: '存储文件名',
    example: '20240101_screenshot_abc123.png',
  })
  @Expose()
  readonly fileName!: string

  @ApiProperty({
    description: '文件MIME类型',
    example: 'image/png',
  })
  @Expose()
  readonly mimeType!: string

  @ApiProperty({
    description: '文件大小（字节）',
    example: 102400,
  })
  @Expose()
  readonly size!: number

  @ApiProperty({
    description: '文件哈希值',
    example: 'sha256-hash-string',
  })
  @Expose()
  readonly hash!: string

  @ApiProperty({
    description: '上传时间',
    example: '2024-01-01T10:05:00.000Z',
  })
  @Type(() => Date)
  @Expose()
  readonly uploadedAt!: Date

  @ApiProperty({
    description: '下载URL',
    example: 'https://example.com/files/download/attachment-uuid',
  })
  @Expose()
  readonly downloadUrl!: string

  @ApiPropertyOptional({
    description: 'base64编码的文件内容（可选）',
  })
  @Expose()
  readonly content?: string
}

/**
 * 审批历史 DTO
 */
export class ExportApprovalHistoryDto {
  @ApiProperty({
    description: '历史记录ID',
    example: 'history-uuid',
  })
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '事件类型',
    example: 'APPROVE',
  })
  @Expose()
  readonly eventType!: string

  @ApiProperty({
    description: '操作类型',
    example: 'APPROVE',
  })
  @Expose()
  readonly action!: string

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T11:30:00.000Z',
  })
  @Type(() => Date)
  @Expose()
  readonly createdAt!: Date

  @ApiProperty({
    description: '操作用户信息',
    type: () => ExportUserDto,
  })
  @Type(() => ExportUserDto)
  @Expose()
  readonly user!: ExportUserDto

  @ApiProperty({
    description: '操作描述',
    example: '审批通过了漏洞报告',
  })
  @Expose()
  readonly description!: string

  @ApiPropertyOptional({
    description: '审批意见或备注',
    example: '漏洞确认，建议尽快修复',
  })
  @Expose()
  readonly comment?: string

  @ApiPropertyOptional({
    description: '变更字段（重新提交时）',
    type: [String],
    example: ['description', 'attachments'],
  })
  @IsOptional()
  @IsArray()
  @Expose()
  readonly changedFields?: string[]
}

/**
 * 报告基本信息 DTO
 */
export class ExportReportDto {
  @ApiProperty({
    description: '报告ID',
    example: 'report-uuid',
  })
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '报告标题',
    example: '某系统SQL注入漏洞',
  })
  @Expose()
  readonly title!: string

  @ApiProperty({
    description: '漏洞等级',
    enum: VulnerabilitySeverity,
    example: VulnerabilitySeverity.HIGH,
  })
  @Expose()
  readonly severity!: VulnerabilitySeverity

  @ApiPropertyOptional({
    description: '攻击方式',
    example: 'SQL注入',
  })
  @Expose()
  readonly attackMethod?: string

  @ApiPropertyOptional({
    description: '详细描述',
    example: '<p>在登录页面发现SQL注入漏洞...</p>',
  })
  @Expose()
  readonly description?: string

  @ApiPropertyOptional({
    description: '发现漏洞的URL列表',
    type: [String],
    example: ['https://example.com/login', 'https://example.com/admin'],
  })
  @IsOptional()
  @IsArray()
  @Expose()
  readonly discoveredUrls?: string[]

  @ApiProperty({
    description: '报告状态',
    enum: BugReportStatus,
    example: BugReportStatus.APPROVED,
  })
  @Expose()
  readonly status!: BugReportStatus

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T10:00:00.000Z',
  })
  @Type(() => Date)
  @Expose()
  readonly createdAt!: Date

  @ApiProperty({
    description: '更新时间',
    example: '2024-01-01T11:30:00.000Z',
  })
  @Type(() => Date)
  @Expose()
  readonly updatedAt!: Date

  @ApiPropertyOptional({
    description: '审核备注',
    example: '漏洞确认，建议尽快修复',
  })
  @Expose()
  readonly reviewNote?: string

  @ApiPropertyOptional({
    description: '审核时间',
    example: '2024-01-01T11:30:00.000Z',
  })
  @Type(() => Date)
  @Expose()
  readonly reviewedAt?: Date
}

/**
 * 导出元数据 DTO
 */
export class ExportMetaDto {
  @ApiProperty({
    description: '导出格式版本号',
    example: '1.0.0',
  })
  @Expose()
  readonly version!: string

  @ApiProperty({
    description: '导出时间',
    example: '2024-01-01T12:00:00.000Z',
  })
  @Type(() => Date)
  @Expose()
  readonly exportedAt!: Date

  @ApiProperty({
    description: '导出操作者信息',
    type: () => ExportUserDto,
  })
  @Type(() => ExportUserDto)
  @Expose()
  readonly exportedBy!: ExportUserDto
}

/**
 * 完整的导出数据结构 DTO
 */
export class ExportedBugReportDataDto {
  @ApiProperty({
    description: '导出元数据',
    type: () => ExportMetaDto,
  })
  @Type(() => ExportMetaDto)
  @Expose()
  readonly exportMeta!: ExportMetaDto

  @ApiProperty({
    description: '漏洞报告信息',
    type: () => ExportReportDto,
  })
  @Type(() => ExportReportDto)
  @Expose()
  readonly report!: ExportReportDto

  @ApiPropertyOptional({
    description: '提交者信息',
    type: () => ExportUserDto,
  })
  @Type(() => ExportUserDto)
  @Expose()
  readonly submitter?: ExportUserDto

  @ApiPropertyOptional({
    description: '审核人信息',
    type: () => ExportUserDto,
  })
  @Type(() => ExportUserDto)
  @Expose()
  readonly reviewer?: ExportUserDto

  @ApiPropertyOptional({
    description: '组织信息',
    type: () => ExportOrganizationDto,
  })
  @Type(() => ExportOrganizationDto)
  @Expose()
  readonly organization?: ExportOrganizationDto

  @ApiPropertyOptional({
    description: '附件列表',
    type: [ExportAttachmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExportAttachmentDto)
  @Expose()
  readonly attachments?: ExportAttachmentDto[]

  @ApiPropertyOptional({
    description: '审批历史记录',
    type: [ExportApprovalHistoryDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExportApprovalHistoryDto)
  @Expose()
  readonly approvalHistory?: ExportApprovalHistoryDto[]
}
