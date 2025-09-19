import { ApiProperty, ApiPropertyOptional, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

import { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'
import { OrganizationRefDto } from '~/modules/organizations/dto/base-organization.dto'
import { UserListItemDto } from '~/modules/users/dto/user-response.dto'

import { BaseDepartmentDto, DepartmentRefDto } from './base-department.dto'

/**
 * 部门响应 DTO
 * 用于 API 响应的部门数据格式
 */
export class DepartmentResponseDto extends OmitType(BaseDepartmentDto, ['orgId']) {
  @ApiProperty({
    description: '所属组织信息',
    type: OrganizationRefDto,
  })
  @Type(() => OrganizationRefDto)
  @Expose()
  readonly organization!: OrganizationRefDto

  @ApiProperty({
    description: '上级部门信息',
    type: DepartmentRefDto,
  })
  @Type(() => DepartmentRefDto)
  @Expose()
  readonly parent?: DepartmentRefDto

  @ApiProperty({
    description: '子部门数量统计',
  })
  @Expose()
  readonly childrenCount?: number

  @ApiProperty({
    description: '用户数量统计',
  })
  @Expose()
  readonly userCount?: number
}

export class DepartmentListItemDto extends DepartmentResponseDto {
  @ApiProperty({
    description: '用户数量统计',
  })
  @Expose()
  readonly _count!: {
    users: number
  }
}

/**
 * 部门树节点 DTO
 * 用于树形结构展示的部门信息
 */
export class DepartmentTreeNodeDto extends DepartmentListItemDto {
  @ApiPropertyOptional({
    description: '子部门',
    type: [DepartmentTreeNodeDto],
  })
  @Expose()
  readonly children?: DepartmentTreeNodeDto[]
}

export class DepartmentApiResponseDto extends StandardResponseDto<DepartmentResponseDto> {
  @ApiProperty({
    description: '部门数据',
    type: DepartmentResponseDto,
  })
  @Type(() => DepartmentResponseDto)
  declare data: DepartmentResponseDto
}

export class DepartmentListApiResponseDto extends StandardListResponseDto<DepartmentListItemDto> {
  @ApiProperty({
    description: '部门列表数据',
    type: [DepartmentListItemDto],
  })
  @Type(() => DepartmentListItemDto)
  declare data: DepartmentListItemDto[]
}

export class DepartmentTreeApiResponseDto extends StandardResponseDto<DepartmentTreeNodeDto[]> {
  @ApiProperty({
    description: '部门树数据',
    type: [DepartmentTreeNodeDto],
  })
  @Type(() => DepartmentTreeNodeDto)
  declare data: DepartmentTreeNodeDto[]
}

/**
 * 部门成员列表 API 响应 DTO
 */
export class DepartmentMembersApiResponseDto extends StandardListResponseDto<UserListItemDto> {
  @ApiProperty({
    description: '部门成员列表数据',
    type: [UserListItemDto],
  })
  readonly data!: UserListItemDto[]
}

export class OnlineDepartmentDto extends PickType(BaseDepartmentDto, ['id', 'name', 'remark']) {
}

/**
 * 部门在线人数统计 DTO
 */
export class DepartmentOnlineStatsDto {
  @ApiProperty({
    description: '部门信息',
    type: OnlineDepartmentDto,
  })
  @Type(() => OnlineDepartmentDto)
  @Expose()
  readonly department!: OnlineDepartmentDto

  @ApiProperty({
    description: '在线人数',
    example: 8,
  })
  @Expose()
  readonly online!: number
}

/**
 * 部门在线人数统计汇总数据 DTO
 */
export class DepartmentOnlineStatsSummaryDto {
  @ApiProperty({
    description: '总在线人数',
    example: 45,
  })
  @Expose()
  readonly totalOnline!: number

  @ApiProperty({
    description: '各部门在线人数统计',
    type: [DepartmentOnlineStatsDto],
  })
  @Type(() => DepartmentOnlineStatsDto)
  @Expose()
  readonly departments!: DepartmentOnlineStatsDto[]
}

/**
 * 部门在线人数统计 API 响应 DTO
 */
export class DepartmentOnlineStatsApiResponseDto extends StandardResponseDto<
  DepartmentOnlineStatsSummaryDto
> {
  @ApiProperty({
    description: '部门在线人数统计汇总数据',
    type: DepartmentOnlineStatsSummaryDto,
  })
  @Type(() => DepartmentOnlineStatsSummaryDto)
  declare data: DepartmentOnlineStatsSummaryDto
}
