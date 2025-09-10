import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

import { IsId } from '~/common/decorators/uuid.decorator'
import { CommonTimeDto } from '~/common/dto/common.dto'

/**
 * 组织基础 DTO
 * 包含组织的核心字段定义和验证规则
 */
export class BaseOrganizationDto extends CommonTimeDto {
  @ApiProperty({
    description: '组织 ID',
  })
  @IsId('组织 ID')
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '组织名称',
  })
  @IsString({ message: '组织名称必须是字符串' })
  @MinLength(2, { message: '组织名称长度不能少于 2 个字符' })
  @MaxLength(100, { message: '组织名称长度不能超过 100 个字符' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @Expose()
  readonly name!: string

  @ApiProperty({
    description: '组织编码',
  })
  @IsString({ message: '组织编码必须是字符串' })
  @MinLength(2, { message: '组织编码长度不能少于 2 个字符' })
  @MaxLength(50, { message: '组织编码长度不能超过 50 个字符' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @Expose()
  readonly code!: string

  @ApiPropertyOptional({
    description: '组织备注',
  })
  @IsOptional()
  @IsString({ message: '组织备注必须是字符串' })
  @MaxLength(500, { message: '组织备注长度不能超过 500 个字符' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || undefined : undefined)
  @Expose()
  readonly remark?: string

  @ApiPropertyOptional({
    description: '组织状态',
  })
  @IsOptional()
  @IsBoolean({ message: '组织状态必须是布尔值' })
  @Expose()
  readonly isActive?: boolean
}

export class OrganizationRefDto extends PickType(BaseOrganizationDto, ['id', 'name', 'code']) {}
