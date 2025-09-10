import { ApiProperty, PartialType, PickType } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator'

import { BaseLicenseDto } from './base-license.dto'

export class CheckUserLicenseDto extends PickType(BaseLicenseDto, ['email', 'code']) {
}

export class CheckUserLicenseWithIpDto extends CheckUserLicenseDto {
  @ApiProperty({
    description: '访问IP',
    example: '192.168.1.1',
  })
  @IsString({ message: '访问 IP 必须是字符串' })
  @IsNotEmpty({ message: '访问 IP 不能为空' })
  readonly ip!: string
}

/**
 * 授权验证 DTO
 *
 * @description 支持通过 ID 或邮箱+授权码两种方式查询
 * ID 优先级最高，如果提供了 ID 则使用 ID 查询
 * 验证逻辑：要么提供 id，要么同时提供 email 和 code
 */
export class CheckLicenseDto extends PartialType(PickType(BaseLicenseDto, ['id', 'email', 'code'])) {
  @ValidateIf((o: CheckLicenseDto) => !o.id)
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  declare readonly email?: string

  @ValidateIf((o: CheckLicenseDto) => !o.id)
  @IsString({ message: '授权码必须是字符串' })
  @IsNotEmpty({ message: '授权码不能为空' })
  declare readonly code?: string
}
