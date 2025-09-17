import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import {
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator'

import { BaseBugReportDto } from './base-bug-report.dto'
import { CreateBugReportDto } from './create-bug-report.dto'

/**
 * 保存草稿 DTO
 * 所有字段都是可选的，允许部分保存
 */
export class SaveDraftDto extends PartialType(PickType(BaseBugReportDto, [
  'title',
  'severity',
  'attackMethod',
  'description',
  'discoveredUrls',
] as const)) {
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
 * 草稿转正式提交 DTO
 * 继承创建DTO，确保必填字段完整
 */
export class SubmitDraftDto extends CreateBugReportDto {}
