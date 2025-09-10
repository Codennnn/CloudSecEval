import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDate, IsOptional, IsUUID } from 'class-validator'

import { IsId } from '../decorators/uuid.decorator'

export class CommonTimeDto {
  @ApiProperty({
    description: '开始时间',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDate({ message: '创建时间必须是有效的日期对象' })
  @Type(() => Date)
  @Expose()
  createdAt!: Date

  @ApiPropertyOptional({
    description: '更新时间',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate({ message: '更新时间必须是有效的日期对象' })
  @Type(() => Date)
  @Expose()
  updatedAt?: Date
}

export class UuidDto {
  @ApiProperty({
    description: 'UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'ID格式无效' })
  readonly id!: string
}

export class OrgIdDto {
  @ApiProperty({
    description: '组织 ID',
  })
  @IsId('组织 ID')
  readonly orgId!: string
}

export class DeptIdDto {
  @ApiProperty({
    description: '部门 ID',
  })
  @IsId('部门 ID')
  readonly departmentId!: string
}
