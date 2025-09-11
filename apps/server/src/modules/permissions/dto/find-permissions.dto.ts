import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, ValidateNested } from 'class-validator'

import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import {
  AdvancedBooleanSearchOperators,
  AdvancedDateSearchOperators,
  AdvancedStringSearchOperators,
} from '~/common/search/dto/advanced-search-operators.dto'
import { BaseSearchDto } from '~/common/search/dto/base-search.dto'

/**
 * 权限可搜索字段 DTO
 */
export class PermissionSearchFields {
  @ApiPropertyOptional({ description: '资源名称搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  resource?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '操作类型搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  action?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '权限标识符搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  slug?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '描述搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  description?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '是否为系统权限搜索条件', type: AdvancedBooleanSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedBooleanSearchOperators)
  system?: AdvancedBooleanSearchOperators | boolean

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
}

/**
 * 权限查询 DTO（支持高级搜索）
 */
export class FindPermissionsDto extends IntersectionType(
  PaginationQueryDto,
  BaseSearchDto,
  PermissionSearchFields,
) {}
