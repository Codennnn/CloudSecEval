import { PickType } from '@nestjs/swagger'

import { BaseUserDto } from '~/modules/users/dto/base-user.dto'

/**
 * 登录 DTO
 *
 * 只需要邮箱和密码进行身份验证
 */
export class LoginDto extends PickType(BaseUserDto, [
  'email',
  'password',
]) {}
