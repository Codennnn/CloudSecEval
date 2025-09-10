import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { IsId } from '~/common/decorators/uuid.decorator'
import { CommonTimeDto } from '~/common/dto/common.dto'

/**
 * 基础授权字段 DTO
 *
 * @description 包含所有授权相关的基础字段，其他授权 DTO 可以通过 Pick/Omit 方式继承使用
 * 这个类作为所有授权相关 DTO 的字段定义源，确保一致性并支持 TypeScript 工具类型
 */
export class BaseLicenseDto extends CommonTimeDto {
  @ApiProperty({
    description: '授权码 ID',
  })
  @IsId('授权码 ID')
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '邮箱地址',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  @Expose()
  readonly email!: string

  @ApiProperty({
    description: '授权码',
    example: 'ABCD-EFGH-IJKL-MNOP-Q',
  })
  @IsString({ message: '授权码必须是字符串' })
  @IsNotEmpty({ message: '授权码不能为空' })
  @Expose()
  readonly code!: string

  @ApiPropertyOptional({
    description: '备注信息',
    example: '为付费用户发放',
  })
  @IsOptional()
  @IsString({ message: '备注信息必须是字符串' })
  @Expose()
  readonly remark?: string

  @ApiPropertyOptional({
    description: '是否锁定',
    example: false,
  })
  @IsBoolean({ message: '锁定状态必须是布尔值' })
  @IsOptional()
  @BooleanTransform()
  @Expose()
  readonly locked?: boolean

  @ApiPropertyOptional({
    description: '是否已使用',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: '是否已使用必须是布尔值' })
  @BooleanTransform()
  @Expose()
  readonly isUsed?: boolean

  @ApiPropertyOptional({
    description: '访问的页面路径',
    example: '/premium/article/123',
  })
  @IsOptional()
  @IsString({ message: '页面路径必须是字符串' })
  readonly pagePath?: string

  @ApiProperty({
    description: '购买金额（单位：元）',
    example: 99.99,
  })
  @IsPositive({ message: '购买金额必须大于 0' })
  @Type(() => Number)
  @Expose()
  readonly purchaseAmount!: number

  @ApiPropertyOptional({
    description: '最后一次访问 IP',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString({ message: '最后一次访问 IP 必须是字符串' })
  @Expose()
  readonly lastIP?: string

  @ApiPropertyOptional({
    description: '警告次数',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Expose()
  readonly warningCount?: number

  @ApiPropertyOptional({
    description: '过期时间（可选，不设置则为永久授权）',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate({ message: '过期时间必须是一个有效的日期对象' })
  @Type(() => Date)
  @Expose()
  readonly expiresAt?: Date
}
