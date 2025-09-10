import { IntersectionType, OmitType, PartialType } from '@nestjs/swagger'

import { DeptIdDto } from '~/common/dto/common.dto'

import { BaseUserDto } from './base-user.dto'

/**
 * 更新用户 DTO
 */
export class UpdateUserDto extends PartialType(
  IntersectionType(
    OmitType(BaseUserDto, [
      'id',
      'avatarUrl',
      'password',
      'createdAt',
      'updatedAt',
    ]),
    PartialType(DeptIdDto),
  ),
) {}
