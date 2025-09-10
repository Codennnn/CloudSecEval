import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator'

import { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'
import { OrganizationRefDto } from '~/modules/organizations/dto/base-organization.dto'
import { BasePermissionDto } from '~/modules/permissions/dto/permission.dto'

import { BaseRoleDto } from './base-role.dto'

export class RoleResponseDto extends PickType(BaseRoleDto, [
  'id',
  'name',
  'slug',
  'system',
  'isActive',
]) {}

/**
 * 角色权限关联 DTO
 */
export class RolePermissionDto {
  @ApiProperty({
    description: '角色权限关联 ID',
  })
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '角色 ID',
  })
  @Expose()
  readonly roleId!: string

  @ApiProperty({
    description: '权限 ID',
  })
  @Expose()
  readonly permissionId!: string

  @ApiProperty({
    description: '权限详情',
    type: BasePermissionDto,
  })
  @ValidateNested()
  @Type(() => BasePermissionDto)
  @IsObject()
  @Expose()
  readonly permission!: BasePermissionDto
}

/**
 * 角色统计信息 DTO
 */
export class RoleCountDto {
  @ApiProperty({
    description: '用户角色关联数量',
    example: 5,
  })
  @IsNumber()
  @Expose()
  readonly userRoles!: number
}

/**
 * 角色详情响应 DTO
 * 包含角色基础信息、所属组织、权限列表和统计信息
 */
export class RoleDetailResponseDto extends BaseRoleDto {
  @ApiPropertyOptional({
    description: '所属组织信息',
    type: OrganizationRefDto,
  })
  @ValidateNested()
  @Type(() => OrganizationRefDto)
  @IsObject()
  @IsOptional()
  @Expose()
  readonly organization?: OrganizationRefDto

  @ApiProperty({
    description: '角色权限列表',
    type: [RolePermissionDto],
  })
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  @IsArray()
  @Expose()
  readonly rolePermissions!: RolePermissionDto[]

  @ApiProperty({
    description: '角色统计信息',
    type: RoleCountDto,
  })
  @ValidateNested()
  @Type(() => RoleCountDto)
  @IsObject()
  @Expose()
  readonly _count!: RoleCountDto
}

export class RoleListItemDto extends BaseRoleDto {}

export class UserRoleDto {
  @ApiProperty({
    description: '角色',
    type: RoleResponseDto,
  })
  @ValidateNested()
  @Type(() => RoleResponseDto)
  @IsObject()
  readonly role!: RoleResponseDto
}

export class RoleApiResponseDto extends StandardResponseDto<RoleDetailResponseDto> {
  @ApiProperty({
    description: '角色详情',
    type: RoleDetailResponseDto,
  })
  readonly data!: RoleDetailResponseDto
}

export class RoleListApiResponseDto extends StandardListResponseDto<RoleListItemDto> {
  @ApiProperty({
    description: '角色列表',
    type: [RoleListItemDto],
  })
  readonly data!: RoleListItemDto[]
}
