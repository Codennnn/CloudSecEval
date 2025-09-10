import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'

import type { SearchOperators } from '../interfaces/search.interface'

/**
 * 通用 字符串 搜索操作符 DTO
 * - 适用于大多数字符串字段的高级搜索
 */
export class AdvancedStringSearchOperators implements SearchOperators<string> {
  @ApiPropertyOptional({ description: '等于' })
  @IsOptional()
  @IsString()
  eq?: string

  @ApiPropertyOptional({ description: '不等于' })
  @IsOptional()
  @IsString()
  neq?: string

  @ApiPropertyOptional({ description: '包含', type: [String] })
  @IsOptional()
  @IsString({ each: true })
  in?: string[]

  @ApiPropertyOptional({ description: '不包含', type: [String] })
  @IsOptional()
  @IsString({ each: true })
  notIn?: string[]

  @ApiPropertyOptional({ description: '包含子字符串' })
  @IsOptional()
  @IsString()
  contains?: string

  @ApiPropertyOptional({ description: '以...开始' })
  @IsOptional()
  @IsString()
  startsWith?: string

  @ApiPropertyOptional({ description: '以...结束' })
  @IsOptional()
  @IsString()
  endsWith?: string

  @ApiPropertyOptional({ description: '正则表达式匹配' })
  @IsOptional()
  @IsString()
  regex?: string

  @ApiPropertyOptional({ description: '不区分大小写匹配' })
  @IsOptional()
  @IsString()
  ilike?: string

  @ApiPropertyOptional({ description: '是否为空' })
  @IsOptional()
  @IsBoolean()
  isNull?: boolean

  @ApiPropertyOptional({ description: '是否不为空' })
  @IsOptional()
  @IsBoolean()
  isNotNull?: boolean
}

/**
 * 通用 数值 搜索操作符 DTO
 * - 适用于金额、计数等数值字段的高级搜索
 */
export class AdvancedNumberSearchOperators implements SearchOperators<number> {
  @ApiPropertyOptional({ description: '等于' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  eq?: number

  @ApiPropertyOptional({ description: '不等于' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  neq?: number

  @ApiPropertyOptional({ description: '大于' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gt?: number

  @ApiPropertyOptional({ description: '大于等于' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gte?: number

  @ApiPropertyOptional({ description: '小于' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lt?: number

  @ApiPropertyOptional({ description: '小于等于' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lte?: number

  @ApiPropertyOptional({ description: '包含', type: [Number] })
  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  in?: number[]

  @ApiPropertyOptional({ description: '不包含', type: [Number] })
  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  notIn?: number[]

  @ApiPropertyOptional({ description: '范围查询 [最小值, 最大值]', type: [Number] })
  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  between?: [number, number]

  @ApiPropertyOptional({ description: '是否为空' })
  @IsOptional()
  @IsBoolean()
  isNull?: boolean

  @ApiPropertyOptional({ description: '是否不为空' })
  @IsOptional()
  @IsBoolean()
  isNotNull?: boolean
}

/**
 * 通用 日期 搜索操作符 DTO
 * - 适用于时间戳、日期字段的高级搜索
 */
export class AdvancedDateSearchOperators implements SearchOperators<Date> {
  @ApiPropertyOptional({ description: '等于' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  eq?: Date

  @ApiPropertyOptional({ description: '不等于' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  neq?: Date

  @ApiPropertyOptional({ description: '大于' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  gt?: Date

  @ApiPropertyOptional({ description: '大于等于' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  gte?: Date

  @ApiPropertyOptional({ description: '小于' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lt?: Date

  @ApiPropertyOptional({ description: '小于等于' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lte?: Date

  @ApiPropertyOptional({ description: '范围查询 [开始日期, 结束日期]', type: [Date] })
  @IsOptional()
  @IsDate({ each: true })
  @Type(() => Date)
  between?: [Date, Date]

  @ApiPropertyOptional({ description: '是否为空' })
  @IsOptional()
  @IsBoolean()
  isNull?: boolean

  @ApiPropertyOptional({ description: '是否不为空' })
  @IsOptional()
  @IsBoolean()
  isNotNull?: boolean
}

/**
 * 通用 布尔 搜索操作符 DTO
 * - 适用于布尔字段的高级搜索
 */
export class AdvancedBooleanSearchOperators implements SearchOperators<boolean> {
  @ApiPropertyOptional({ description: '等于' })
  @IsOptional()
  @IsBoolean()
  @BooleanTransform()
  eq?: boolean

  @ApiPropertyOptional({ description: '不等于' })
  @IsOptional()
  @IsBoolean()
  @BooleanTransform()
  neq?: boolean

  @ApiPropertyOptional({ description: '是否为空' })
  @IsOptional()
  @IsBoolean()
  isNull?: boolean

  @ApiPropertyOptional({ description: '是否不为空' })
  @IsOptional()
  @IsBoolean()
  isNotNull?: boolean
}
