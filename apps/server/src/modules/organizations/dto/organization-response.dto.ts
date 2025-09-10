import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

import { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'

import { BaseOrganizationDto } from './base-organization.dto'

/**
 * 组织响应 DTO
 * 用于 API 响应的组织数据格式
 */
export class OrganizationResponseDto extends BaseOrganizationDto {
  @ApiProperty({
    description: '部门数量统计',
  })
  @Expose()
  readonly departmentCount?: number

  @ApiProperty({
    description: '用户数量统计',
  })
  @Expose()
  readonly userCount?: number
}

/**
 * 组织列表项 DTO
 * 用于列表展示的精简版组织信息
 */
export class OrganizationListItemDto extends OrganizationResponseDto {}

/**
 * 组织 API 响应 DTO
 */
export class OrganizationApiResponseDto extends StandardResponseDto<OrganizationResponseDto> {
  @ApiProperty({
    description: '组织数据',
    type: OrganizationResponseDto,
  })
  @Type(() => OrganizationResponseDto)
  declare data: OrganizationResponseDto
}

/**
 * 组织列表 API 响应 DTO
 */
export class OrganizationListApiResponseDto
  extends StandardListResponseDto<OrganizationListItemDto> {
  @ApiProperty({
    description: '组织列表数据',
    type: [OrganizationListItemDto],
  })
  @Type(() => OrganizationListItemDto)
  declare data: OrganizationListItemDto[]
}
