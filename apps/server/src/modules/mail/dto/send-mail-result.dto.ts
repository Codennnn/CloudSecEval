import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

/**
 * 邮件发送结果 DTO
 *
 * @description 定义邮件发送操作的返回结果
 */
export class SendMailResultDto {
  @ApiProperty({
    description: '是否发送成功',
    example: true,
  })
  @IsBoolean({ message: '发送状态必须是布尔值' })
  readonly success!: boolean

  @ApiPropertyOptional({
    description: '邮件 ID（Resend 返回的 ID）',
    example: 're_123456789',
  })
  @IsOptional()
  @IsString({ message: '邮件ID必须是字符串' })
  readonly messageId?: string

  @ApiPropertyOptional({
    description: '错误信息',
    example: '邮件发送失败：无效的邮箱地址',
  })
  @IsOptional()
  @IsString({ message: '错误信息必须是字符串' })
  readonly error?: string
}
