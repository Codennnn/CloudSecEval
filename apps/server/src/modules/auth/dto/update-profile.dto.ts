import { PartialType, PickType } from '@nestjs/swagger'

import { SafeUserDto } from '~/modules/users/dto/base-user.dto'

/**
 * 更新用户资料 DTO
 *
 * @description 用于用户更新自己的资料信息
 * 仅包含用户可以自主修改的字段
 */
export class UpdateProfileDto extends PartialType(PickType(SafeUserDto, [
  'email',
  'name',
  'phone',
])) {}
