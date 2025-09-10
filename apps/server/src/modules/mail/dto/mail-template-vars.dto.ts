import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator'

/**
 * 基础邮件模板变量 DTO
 *
 * @description 所有邮件模板的基础变量类
 */
export class BaseMailTemplateVarsDto {
  @ApiProperty({
    description: '收件人邮箱',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '收件人邮箱格式不正确' })
  @IsNotEmpty({ message: '收件人邮箱不能为空' })
  readonly email!: string
}

/**
 * 授权码邮件模板变量 DTO
 *
 * @description 发送授权码邮件时使用的模板变量
 */
export class LicenseCodeTemplateVarsDto extends BaseMailTemplateVarsDto {
  @ApiProperty({
    description: '授权码',
    example: 'ABCD-EFGH-IJKL-MNOP-Q',
  })
  @IsString({ message: '授权码必须是字符串' })
  @IsNotEmpty({ message: '授权码不能为空' })
  readonly code!: string
}

/**
 * 安全警告邮件模板变量 DTO
 *
 * @description 发送安全警告邮件时使用的模板变量
 */
export class SecurityWarningTemplateVarsDto extends BaseMailTemplateVarsDto {
  @ApiProperty({
    description: '新的 IP 地址',
    example: '192.168.1.100',
  })
  @IsString({ message: 'IP地址必须是字符串' })
  @IsNotEmpty({ message: 'IP地址不能为空' })
  readonly newIP!: string

  @ApiProperty({
    description: '警告时间',
    example: '2024-01-15 14:30:00',
  })
  @IsString({ message: '警告时间必须是字符串' })
  @IsNotEmpty({ message: '警告时间不能为空' })
  readonly warningTime!: string
}

/**
 * 账户锁定邮件模板变量 DTO
 *
 * @description 发送账户锁定邮件时使用的模板变量
 */
export class AccountLockTemplateVarsDto extends BaseMailTemplateVarsDto {
  @ApiProperty({
    description: '锁定时间',
    example: '2024-01-15 14:30:00',
  })
  @IsString({ message: '锁定时间必须是字符串' })
  @IsNotEmpty({ message: '锁定时间不能为空' })
  readonly lockTime!: string

  @ApiProperty({
    description: '锁定原因',
    example: '多次异常访问检测',
  })
  @IsString({ message: '锁定原因必须是字符串' })
  @IsNotEmpty({ message: '锁定原因不能为空' })
  readonly reason!: string
}

/**
 * 过期提醒邮件模板变量 DTO
 *
 * @description 发送过期提醒邮件时使用的模板变量
 */
export class ExpirationReminderTemplateVarsDto extends BaseMailTemplateVarsDto {
  @ApiProperty({
    description: '授权码',
    example: 'ABCD-EFGH-IJKL-MNOP-Q',
  })
  @IsString({ message: '授权码必须是字符串' })
  @IsNotEmpty({ message: '授权码不能为空' })
  readonly code!: string

  @ApiProperty({
    description: '过期时间',
    example: '2024-12-31 23:59:59',
  })
  @IsString({ message: '过期时间必须是字符串' })
  @IsNotEmpty({ message: '过期时间不能为空' })
  readonly expiresAt!: string

  @ApiProperty({
    description: '剩余天数',
    example: 7,
  })
  @IsNumber({}, { message: '剩余天数必须是数字' })
  @Type(() => Number)
  readonly daysRemaining!: number
}

/**
 * 过期通知邮件模板变量 DTO
 *
 * @description 发送过期通知邮件时使用的模板变量
 */
export class ExpirationNoticeTemplateVarsDto extends BaseMailTemplateVarsDto {
  @ApiProperty({
    description: '授权码',
    example: 'ABCD-EFGH-IJKL-MNOP-Q',
  })
  @IsString({ message: '授权码必须是字符串' })
  @IsNotEmpty({ message: '授权码不能为空' })
  readonly code!: string

  @ApiProperty({
    description: '过期时间',
    example: '2024-12-31 23:59:59',
  })
  @IsString({ message: '过期时间必须是字符串' })
  @IsNotEmpty({ message: '过期时间不能为空' })
  readonly expiredAt!: string
}
