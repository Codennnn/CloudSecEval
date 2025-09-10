import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { z } from 'zod'

import { BaseSearchCondition, LogicalOperator, SearchMode, SortField, SortOrder } from '../interfaces/search.interface'

// Zod schema for SortField validation
const sortFieldSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']),
})

const sortFieldArraySchema = z.array(sortFieldSchema)

/**
 * 基础搜索 DTO
 * 提供通用的搜索参数定义
 */
export class BaseSearchDto implements BaseSearchCondition {
  @ApiPropertyOptional({
    description: '全局搜索关键词，在配置的全局搜索字段中进行模糊匹配',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: '搜索模式，决定如何处理搜索条件',
    enum: SearchMode,
    enumName: 'SearchMode',
    example: SearchMode.GLOBAL,
  })
  @IsOptional()
  @IsEnum(SearchMode)
  searchMode?: SearchMode

  @ApiPropertyOptional({
    description: '字段间的逻辑操作符，决定如何组合多个搜索条件',
    enum: LogicalOperator,
    enumName: 'LogicalOperator',
    example: LogicalOperator.AND,
  })
  @IsOptional()
  @IsEnum(LogicalOperator)
  operator?: LogicalOperator

  @ApiPropertyOptional({
    description: '排序字段，支持单字段或多字段排序。单字段: 字符串；多字段: JSON 字符串数组',
    oneOf: [
      {
        type: 'string',
        example: 'createdAt',
        description: '单字段排序：直接传字段名',
      },
      {
        type: 'string',
        example: '[{"field":"name","order":"asc"},{"field":"createdAt","order":"desc"}]',
        description: '多字段排序：JSON 字符串数组格式',
      },
    ],
    examples: {
      single: {
        summary: '单字段排序',
        value: 'createdAt',
      },
      multiple: {
        summary: '多字段排序',
        value: '[{"field":"name","order":"asc"},{"field":"createdAt","order":"desc"}]',
      },
    },
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      // 尝试解析 JSON 字符串，支持多字段排序
      try {
        const parsed: unknown = JSON.parse(value)

        const validationResult = sortFieldArraySchema.safeParse(parsed)

        if (validationResult.success) {
          return validationResult.data
        }

        return value
      }
      catch {
        // JSON 解析失败，返回原字符串（单字段排序）
        return value
      }
    }

    return value
  })
  sortBy?: string | SortField[]

  @ApiPropertyOptional({
    description: '排序方向，升序或降序（仅在 sortBy 为单字段字符串时使用）',
    enum: SortOrder,
    enumName: 'SortOrder',
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder
}
