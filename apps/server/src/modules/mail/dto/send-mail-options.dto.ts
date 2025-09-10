import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

/**
 * 邮件发送选项 DTO
 *
 * @description 定义邮件发送时需要的参数
 */
export class SendMailOptionsDto {
  @ApiProperty({
    description: '收件人邮箱地址',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '收件人邮箱格式不正确' })
  @IsNotEmpty({ message: '收件人邮箱不能为空' })
  readonly to!: string

  @ApiProperty({
    description: '邮件主题',
    example: '授权码通知',
  })
  @IsString({ message: '邮件主题必须是字符串' })
  @IsNotEmpty({ message: '邮件主题不能为空' })
  readonly subject!: string

  @ApiProperty({
    description: 'HTML 邮件内容',
    example: '<h1>您的授权码</h1><p>您的授权码是：ABC123</p>',
  })
  @IsString({ message: 'HTML 邮件内容必须是字符串' })
  @IsNotEmpty({ message: 'HTML 邮件内容不能为空' })
  readonly html!: string

  @ApiPropertyOptional({
    description: '纯文本邮件内容（可选）',
    example: '您的授权码是：ABC123',
  })
  @IsOptional()
  @IsString({ message: '纯文本邮件内容必须是字符串' })
  readonly text?: string
}
