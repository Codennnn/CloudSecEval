import { IsNotEmpty, IsString, MinLength } from 'class-validator'

/**
 * 修改密码 DTO
 *
 * 用于通过验证旧密码来修改新密码的功能
 */
export class ChangePasswordDto {
  /** 当前密码 */
  @IsString({ message: '当前密码必须是字符串' })
  @IsNotEmpty({ message: '当前密码不能为空' })
  readonly currentPassword!: string

  /** 新密码 */
  @IsString({ message: '新密码必须是字符串' })
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码长度不能少于 6 个字符' })
  readonly newPassword!: string

  /** 确认新密码 */
  @IsString({ message: '确认新密码必须是字符串' })
  @IsNotEmpty({ message: '确认新密码不能为空' })
  @MinLength(6, { message: '确认新密码长度不能少于 6 个字符' })
  readonly confirmNewPassword!: string
}
