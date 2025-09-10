import { ApiProperty, PickType } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsOptional } from 'class-validator'

import { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'
import { generateAvatarUrl } from '~/common/utils/gravatar.util'

import { SafeUserDto } from './base-user.dto'

/**
 * 用户响应基础 DTO
 *
 * @description 从 BaseUserDto 中排除敏感字段（密码），用于所有用户响应
 */
export class UserResponseDto extends SafeUserDto {
  /**
   * 头像URL - 自动生成 Gravatar 头像（如果为空）
   *
   * @description 使用 Transform 装饰器确保每次返回用户信息时都有头像 URL
   * 如果用户没有设置自定义头像，则自动使用邮箱生成 Gravatar 头像
   */
  @Transform(({ value, obj }: { value?: string, obj: UserResponseDto }) => {
    if (value) {
      return value
    }

    // 如果没有头像，则使用 Gravatar 生成
    return generateAvatarUrl(obj.email, { size: 200 })
  })
  declare readonly avatarUrl?: string

  @ApiProperty({
    description: '权限标识列表',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  declare readonly permissions?: string[]
}

/**
 * 用户列表项响应 DTO
 *
 * @description 用于列表接口，只包含必要字段以提高性能
 */
export class UserListItemDto extends PickType(UserResponseDto, [
  'id',
  'email',
  'name',
  'phone',
  'avatarUrl',
  'isActive',
  'createdAt',
  'updatedAt',
  'organization',
  'department',
]) {}

/**
 * 用户列表 API 响应 DTO
 *
 * @description 用于用户列表接口的标准化响应格式，包含用户列表数据和分页信息
 */
export class UserListApiResponseDto extends StandardListResponseDto<UserListItemDto> {
  @ApiProperty({
    description: '用户列表数据',
    type: [UserListItemDto],
  })
  declare data: UserListItemDto[]
}

/**
 * 单个用户 API 响应 DTO
 *
 * @description 用于单个用户查询、创建、更新接口的标准化响应格式，包含完整的用户信息
 */
export class UserApiResponseDto extends StandardResponseDto<UserResponseDto> {
  @ApiProperty({
    description: '用户数据',
    type: UserResponseDto,
  })
  declare data: UserResponseDto
}
