import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RequestPasswordResetDto {
  /** 邮箱地址 */
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  readonly email!: string
}

export class ResetPasswordDto {
  /** 重置密码令牌 */
  @IsString({ message: '令牌必须是字符串' })
  @IsNotEmpty({ message: '令牌不能为空' })
  readonly token!: string

  /** 新密码 */
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于 6 个字符' })
  readonly password!: string

  /** 确认密码 */
  @IsString({ message: '确认密码必须是字符串' })
  @IsNotEmpty({ message: '确认密码不能为空' })
  @MinLength(6, { message: '确认密码长度不能少于 6 个字符' })
  readonly confirmPassword!: string
}
