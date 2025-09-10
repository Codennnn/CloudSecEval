import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator'

import { IsId } from '~/common/decorators/uuid.decorator'
import { CommonTimeDto } from '~/common/dto/common.dto'

/**
 * 部门基础DTO
 * 包含部门的核心字段定义和验证规则
 */
export class BaseDepartmentDto extends CommonTimeDto {
  @ApiProperty({
    description: '部门 ID',
  })
  @IsId('部门 ID')
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '所属组织 ID',
  })
  @IsId('所属组织 ID')
  @Expose()
  readonly orgId!: string

  @ApiProperty({
    description: '部门名称',
  })
  @IsString({ message: '部门名称必须是字符串' })
  @MinLength(2, { message: '部门名称长度不能少于 2 个字符' })
  @MaxLength(100, { message: '部门名称长度不能超过 100 个字符' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @Expose()
  readonly name!: string

  @ApiPropertyOptional({
    description: '部门备注',
    example: '研发部负责研发工作',
  })
  @IsOptional()
  @IsString({ message: '部门备注必须是字符串' })
  @MaxLength(500, { message: '部门备注长度不能超过500个字符' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || undefined : undefined)
  @Expose()
  readonly remark?: string

  @ApiPropertyOptional({
    description: '部门状态',
  })
  @IsOptional()
  @IsBoolean({ message: '部门状态必须是布尔值' })
  @Expose()
  readonly isActive?: boolean
}

export class DepartmentRefDto extends PickType(BaseDepartmentDto, ['id', 'name']) {
  @ApiProperty({
    description: '上级部门信息',
    type: DepartmentRefDto,
  })
  @ValidateNested()
  @Type(() => DepartmentRefDto)
  @IsObject()
  @IsOptional()
  @Expose()
  readonly parent?: DepartmentRefDto
}
