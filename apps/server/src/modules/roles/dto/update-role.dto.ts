import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'

import { CreateRoleDto } from './create-role.dto'

/**
 * 更新角色 DTO
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional({
    description: '角色是否启用',
  })
  @IsOptional()
  @IsBoolean({ message: '角色状态必须是布尔值' })
  @BooleanTransform()
  readonly isActive?: boolean
}
