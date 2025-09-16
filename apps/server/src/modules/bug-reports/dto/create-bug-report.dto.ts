import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator'

import { VulnerabilitySeverity } from '~/common/enums/severity.enum'

import { BaseBugReportDto } from './base-bug-report.dto'

/**
 * 创建漏洞报告 DTO
 *
 * 用于接收创建漏洞报告的请求数据
 * 不包含系统自动生成的字段（如ID、创建时间、用户ID、组织ID等）
 */
export class CreateBugReportDto extends PickType(BaseBugReportDto, [
  'title',
  'severity',
  'attackMethod',
  'description',
] as const) {
  @ApiProperty({
    description: '报告标题',
    example: 'SQL注入漏洞',
    maxLength: 200,
  })
  @IsString({ message: '报告标题必须是字符串' })
  @IsNotEmpty({ message: '报告标题不能为空' })
  @MaxLength(200, { message: '报告标题不能超过200个字符' })
  @Expose()
  readonly title!: string

  @ApiProperty({
    description: '漏洞等级',
    enum: VulnerabilitySeverity,
    example: VulnerabilitySeverity.HIGH,
  })
  @IsEnum(VulnerabilitySeverity, { message: '漏洞等级必须是有效的枚举值' })
  @Expose()
  readonly severity!: VulnerabilitySeverity

  @ApiPropertyOptional({
    description: '攻击方式',
    example: 'SQL注入',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '攻击方式必须是字符串' })
  @MaxLength(100, { message: '攻击方式不能超过100个字符' })
  @Expose()
  readonly attackMethod?: string

  @ApiPropertyOptional({
    description: '详细问题描述（富文本）',
    example: '<p>在登录页面发现SQL注入漏洞，通过在用户名字段输入恶意SQL代码可以绕过认证...</p>',
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
  @IsArray({ message: 'URL列表必须是数组' })
  @IsUrl({}, { each: true, message: '每个URL必须是有效的URL格式' })
  @Expose()
  readonly discoveredUrls?: string[]

  @ApiPropertyOptional({
    description: '附件ID列表（来自文件上传接口的临时文件ID）',
    example: ['file-id-1', 'file-id-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '附件ID列表必须是数组' })
  @IsString({ each: true, message: '每个附件ID必须是字符串' })
  @Expose()
  readonly attachmentIds?: string[]
}

/**
 * 批量创建漏洞报告 DTO
 */
export class BatchCreateBugReportsDto {
  @ApiProperty({
    description: '漏洞报告列表',
    type: [CreateBugReportDto],
  })
  @IsArray({ message: '漏洞报告列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => CreateBugReportDto)
  @Expose()
  readonly bugReports!: CreateBugReportDto[]
}
