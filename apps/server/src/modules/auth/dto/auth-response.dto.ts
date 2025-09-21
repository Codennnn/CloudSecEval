import { ApiProperty } from '@nestjs/swagger'

import { StandardResponseDto } from '~/common/dto/standard-response.dto'
import { UserResponseDto } from '~/modules/users/dto/user-response.dto'

export class DeleteUserResponseDataDto {
  @ApiProperty({
    description: '是否删除成功',
    example: true,
  })
  readonly deleted!: boolean
}

/**
 * 登录响应数据 DTO
 */
export class LoginResponseDataDto {
  @ApiProperty({
    description: '用户信息',
    type: UserResponseDto,
  })
  readonly user!: UserResponseDto

  @ApiProperty({
    description: '访问令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  readonly accessToken!: string

  @ApiProperty({
    description: '刷新令牌',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  readonly refreshToken!: string
}

/**
 * 注册响应数据 DTO
 */
export class RegisterResponseDataDto {
  @ApiProperty({
    description: '用户信息',
    type: UserResponseDto,
  })
  readonly user!: UserResponseDto
}

/**
 * 密码重置请求响应数据 DTO
 */
export class PasswordResetRequestDataDto {
  @ApiProperty({
    description: '密码重置令牌',
    example: 'reset-token-uuid',
  })
  readonly token!: string
}

/**
 * 令牌验证响应数据 DTO
 */
export class TokenVerifyResponseDataDto {
  @ApiProperty({
    description: '用户信息',
    type: UserResponseDto,
  })
  readonly user!: UserResponseDto
}

/**
 * 登录 API 响应 DTO
 */
export class LoginApiResponseDto extends StandardResponseDto<LoginResponseDataDto> {
  @ApiProperty({
    description: '登录响应数据',
    type: LoginResponseDataDto,
  })
  declare data: LoginResponseDataDto
}

/**
 * 刷新令牌 API 响应 DTO
 */
export class RefreshTokenApiResponseDto extends StandardResponseDto<LoginResponseDataDto> {
  @ApiProperty({
    description: '刷新令牌响应数据',
    type: LoginResponseDataDto,
  })
  declare data: LoginResponseDataDto
}

/**
 * 注册 API 响应 DTO
 */
export class RegisterApiResponseDto extends StandardResponseDto<RegisterResponseDataDto> {
  @ApiProperty({
    description: '注册响应数据',
    type: RegisterResponseDataDto,
  })
  declare data: RegisterResponseDataDto
}

/**
 * 用户资料 API 响应 DTO
 */
export class ProfileApiResponseDto extends StandardResponseDto<UserResponseDto> {
  @ApiProperty({
    description: '用户资料数据',
    type: UserResponseDto,
  })
  declare data: UserResponseDto
}

/**
 * 密码重置请求 API 响应 DTO
 */
export class PasswordResetRequestApiResponseDto extends StandardResponseDto<
  PasswordResetRequestDataDto
> {
  @ApiProperty({
    description: '密码重置请求响应数据',
    type: PasswordResetRequestDataDto,
  })
  declare data: PasswordResetRequestDataDto
}

/**
 * 密码重置成功 API 响应 DTO
 */
export class PasswordResetSuccessApiResponseDto extends StandardResponseDto<null> {
  @ApiProperty({
    description: '响应数据',
    nullable: true,
    example: null,
  })
  declare data: null
}

/**
 * 登出 API 响应 DTO
 */
export class LogoutApiResponseDto extends StandardResponseDto<null> {
  @ApiProperty({
    description: '响应数据',
    nullable: true,
    example: null,
  })
  declare data: null
}

/**
 * 令牌验证 API 响应 DTO
 */
export class TokenVerifyApiResponseDto extends StandardResponseDto<TokenVerifyResponseDataDto> {
  @ApiProperty({
    description: '令牌验证响应数据',
    type: TokenVerifyResponseDataDto,
  })
  declare data: TokenVerifyResponseDataDto
}

export class DeleteUserApiResponseDto extends StandardResponseDto<DeleteUserResponseDataDto> {
  @ApiProperty({
    description: '删除用户响应数据',
    type: DeleteUserResponseDataDto,
  })
  declare data: DeleteUserResponseDataDto
}

/**
 * 更新用户资料 API 响应 DTO
 */
export class UpdateProfileApiResponseDto extends StandardResponseDto<UserResponseDto> {
  @ApiProperty({
    description: '更新用户资料响应数据',
    type: UserResponseDto,
  })
  declare data: UserResponseDto
}

/**
 * 修改密码 API 响应 DTO
 */
export class ChangePasswordApiResponseDto extends StandardResponseDto<null> {
  @ApiProperty({
    description: '修改密码响应数据',
    nullable: true,
    example: null,
  })
  declare data: null
}
