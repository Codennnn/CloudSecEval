import { IntersectionType, PickType } from '@nestjs/swagger'

import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import { BaseSearchDto } from '~/common/search/dto/base-search.dto'

import { BaseOrganizationDto } from './base-organization.dto'

/**
 * 组织高级搜索 DTO
 * 继承通用搜索和分页功能，并添加组织特定的搜索字段
 */
export class FindOrganizationsDto extends IntersectionType(
  BaseSearchDto,
  PaginationQueryDto,
  PickType(BaseOrganizationDto, ['isActive']),
) {}
