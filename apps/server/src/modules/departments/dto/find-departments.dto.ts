import { ApiPropertyOptional, IntersectionType, PartialType, PickType } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { OrgIdDto } from '~/common/dto/common.dto'
import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import { BaseSearchDto } from '~/common/search/dto/base-search.dto'

import { BaseDepartmentDto } from './base-department.dto'
import { CreateDepartmentDto } from './create-department.dto'

/**
 * 部门搜索 DTO
 * 继承通用搜索和分页功能，并添加部门特定的搜索字段
 */
export class FindDepartmentsDto extends IntersectionType(
  BaseSearchDto,
  PaginationQueryDto,
  PickType(BaseDepartmentDto, ['isActive']),
  PickType(CreateDepartmentDto, ['parentId']),
  PartialType(OrgIdDto),
) {
  @ApiPropertyOptional({
    description: '是否包含子孙部门，默认不包含',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: '包含子孙部门必须是布尔值' })
  @BooleanTransform()
  readonly includeDescendants?: boolean
}
