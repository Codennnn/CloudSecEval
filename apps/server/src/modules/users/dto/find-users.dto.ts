import { ApiPropertyOptional, IntersectionType, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { DeptIdDto, OrgIdDto } from '~/common/dto/common.dto'
import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import {
  AdvancedBooleanSearchOperators,
  AdvancedDateSearchOperators,
  AdvancedStringSearchOperators,
} from '~/common/search/dto/advanced-search-operators.dto'
import { BaseSearchDto } from '~/common/search/dto/base-search.dto'

/**
 * 用户搜索字段 DTO
 */
export class UserSearchFields extends IntersectionType(
  PartialType(OrgIdDto),
  PartialType(DeptIdDto),
) {
  @ApiPropertyOptional({ description: '用户名搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  name?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '邮箱搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  email?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '手机号搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  phone?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '用户状态搜索条件', type: AdvancedBooleanSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedBooleanSearchOperators)
  isActive?: AdvancedBooleanSearchOperators | boolean

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
 * 用户查询 DTO
 * 支持高级搜索功能，使用通用搜索框架
 */
export class FindUsersDto extends IntersectionType(
  PaginationQueryDto,
  BaseSearchDto,
  UserSearchFields,
) {
  @ApiPropertyOptional({ description: '是否包含子孙部门的用户' })
  @IsOptional()
  @IsBoolean({ message: '包含子孙部门必须是布尔值' })
  @BooleanTransform()
  includeDescendants?: boolean
}
