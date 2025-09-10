import { ApiProperty, PickType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'

import { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'

import { BaseRoleDto } from './base-role.dto'

export class RoleResponseDto extends PickType(BaseRoleDto, [
  'id',
  'name',
  'slug',
  'system',
  'isActive',
]) {}

export class RoleDetailResponseDto extends BaseRoleDto {}

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
