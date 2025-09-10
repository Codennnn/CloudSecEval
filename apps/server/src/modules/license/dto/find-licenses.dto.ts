import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import {
  AdvancedBooleanSearchOperators,
  AdvancedDateSearchOperators,
  AdvancedNumberSearchOperators,
  AdvancedStringSearchOperators,
} from '~/common/search/dto/advanced-search-operators.dto'
import { BaseSearchDto } from '~/common/search/dto/base-search.dto'
import { AggregateFunction, SearchOperators } from '~/common/search/interfaces/search.interface'

/**
 * 风险等级枚举
 */
export enum RiskLevel {
  SAFE = 'safe',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * 风险等级搜索操作符 DTO
 */
class RiskLevelSearchOperators implements SearchOperators<RiskLevel> {
  @ApiPropertyOptional({ description: '等于', enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  eq?: RiskLevel

  @ApiPropertyOptional({ description: '不等于', enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  neq?: RiskLevel

  @ApiPropertyOptional({ description: '包含', enum: RiskLevel, isArray: true })
  @IsOptional()
  @IsEnum(RiskLevel, { each: true })
  in?: RiskLevel[]

  @ApiPropertyOptional({ description: '不包含', enum: RiskLevel, isArray: true })
  @IsOptional()
  @IsEnum(RiskLevel, { each: true })
  notIn?: RiskLevel[]
}

/**
 * 授权码搜索字段 DTO
 */
class LicenseSearchFields {
  /** 邮箱搜索 */
  @ApiPropertyOptional({ description: '邮箱搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  email?: AdvancedStringSearchOperators | string

  /** 授权码搜索 */
  @ApiPropertyOptional({ description: '授权码搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  code?: AdvancedStringSearchOperators | string

  /** 是否已使用 */
  @ApiPropertyOptional({ description: '使用状态搜索条件', type: AdvancedBooleanSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedBooleanSearchOperators)
  isUsed?: AdvancedBooleanSearchOperators | boolean

  /** 是否被锁定 */
  @ApiPropertyOptional({ description: '锁定状态搜索条件', type: AdvancedBooleanSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedBooleanSearchOperators)
  locked?: AdvancedBooleanSearchOperators | boolean

  /** 是否已过期 */
  @ApiPropertyOptional({ description: '过期状态搜索条件', type: AdvancedBooleanSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedBooleanSearchOperators)
  isExpired?: AdvancedBooleanSearchOperators | boolean

  /** 警告次数 */
  @ApiPropertyOptional({ description: '警告次数搜索条件', type: AdvancedNumberSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedNumberSearchOperators)
  warningCount?: AdvancedNumberSearchOperators | number

  /** 购买金额 */
  @ApiPropertyOptional({ description: '购买金额搜索条件', type: AdvancedNumberSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedNumberSearchOperators)
  purchaseAmount?: AdvancedNumberSearchOperators | number

  /** 创建时间 */
  @ApiPropertyOptional({ description: '创建时间搜索条件', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  createdAt?: AdvancedDateSearchOperators | Date

  /** 过期时间 */
  @ApiPropertyOptional({ description: '过期时间搜索条件', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  expiresAt?: AdvancedDateSearchOperators | Date

  /** 最后访问时间 */
  @ApiPropertyOptional({ description: '最后访问时间搜索条件', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  lastAccessTime?: AdvancedDateSearchOperators | Date

  /** 总访问次数 */
  @ApiPropertyOptional({ description: '总访问次数搜索条件', type: AdvancedNumberSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedNumberSearchOperators)
  totalAccesses?: AdvancedNumberSearchOperators | number

  /** 风险等级 */
  @ApiPropertyOptional({ description: '风险等级搜索条件', type: RiskLevelSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => RiskLevelSearchOperators)
  riskLevel?: RiskLevelSearchOperators | RiskLevel

  /** 常用IP包含 */
  @ApiPropertyOptional({ description: 'IP地址搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  ipAddress?: AdvancedStringSearchOperators | string
}

/**
 * 聚合筛选条件 DTO
 */
export class AggregateFilterDto {
  @ApiPropertyOptional({ description: '聚合函数', enum: AggregateFunction })
  @IsOptional()
  @IsEnum(AggregateFunction)
  function?: AggregateFunction

  @ApiPropertyOptional({ description: '聚合字段' })
  @IsOptional()
  @IsString()
  field?: string

  @ApiPropertyOptional({ description: '关联表名' })
  @IsOptional()
  @IsString()
  relation?: string

  @ApiPropertyOptional({ description: '最小值' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gte?: number

  @ApiPropertyOptional({ description: '最大值' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lte?: number

  @ApiPropertyOptional({ description: '等于' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  eq?: number
}

/**
 * 高级聚合筛选字段
 */
export class AdvancedAggregateFields {
  /** 访问日志聚合筛选 */
  @ApiPropertyOptional({ description: '访问总数筛选', type: AggregateFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AggregateFilterDto)
  accessCountFilter?: AggregateFilterDto

  /** IP 地址数量筛选 */
  @ApiPropertyOptional({ description: 'IP地址数量筛选', type: AggregateFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AggregateFilterDto)
  ipCountFilter?: AggregateFilterDto

  /** 风险访问次数筛选 */
  @ApiPropertyOptional({ description: '风险访问次数筛选', type: AggregateFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AggregateFilterDto)
  riskyAccessFilter?: AggregateFilterDto

  /** 最近访问时间筛选 */
  @ApiPropertyOptional({ description: '最近访问时间筛选', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  recentAccessFilter?: AdvancedDateSearchOperators
}

/**
 * 授权码查询 DTO
 * 继承分页查询和基础搜索功能，添加授权码特定的搜索字段
 */
export class FindLicensesDto extends IntersectionType(
  PaginationQueryDto,
  BaseSearchDto,
  LicenseSearchFields,
  AdvancedAggregateFields,
) {}
