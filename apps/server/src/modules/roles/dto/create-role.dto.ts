import { ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { IsArray, IsOptional, IsUUID } from 'class-validator'

import { BaseRoleDto } from './base-role.dto'

/**
 * 创建角色 DTO
 */
export class CreateRoleDto extends PickType(BaseRoleDto, [
  'name',
  'slug',
  'description',
]) {
  @ApiPropertyOptional({
    description: '权限ID列表',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '权限列表必须是数组' })
  @IsUUID(4, { each: true, message: '权限 ID 格式无效，必须是有效的UUID' })
  readonly permissionIds?: string[]
}
