import { ApiProperty, IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

import { DeptIdDto, OrgIdDto } from '~/common/dto/common.dto'

import { BaseUserDto } from './base-user.dto'

/**
 * 创建用户 DTO
 *
 * @description 从 BaseUserDto 中选择创建用户所需的字段
 * 排除系统管理的字段（id, isActive, createdAt, updatedAt）
 */
export class CreateUserDto extends IntersectionType(
  PickType(BaseUserDto, [
    'email',
    'name',
    'phone',
    'avatarUrl',
    'password',
  ]),
  OrgIdDto,
  PartialType(DeptIdDto),
) {}

export class CreateUserWithPasswordHashDto extends OmitType(CreateUserDto, ['password']) {
  @ApiProperty({
    description: '密码哈希值',
    example: '123456',
  })
  @IsString({ message: '密码哈希值必须是字符串' })
  @IsNotEmpty({ message: '密码哈希值不能为空' })
  @Expose()
  readonly passwordHash!: string
}
