import { ApiProperty } from '@nestjs/swagger'

import { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'

import { BasePermissionDto } from './permission.dto'

export class PermissionDetailResponseDto extends BasePermissionDto {}

export class PermissionListItemDto extends BasePermissionDto {}

export class PermissionApiResponseDto extends StandardResponseDto<PermissionDetailResponseDto> {
  @ApiProperty({
    description: '权限详情',
    type: PermissionDetailResponseDto,
  })
  readonly data!: PermissionDetailResponseDto
}

export class PermissionListApiResponseDto extends StandardListResponseDto<PermissionListItemDto> {
  @ApiProperty({
    description: '权限列表',
    type: [PermissionListItemDto],
  })
  readonly data!: PermissionListItemDto[]
}
