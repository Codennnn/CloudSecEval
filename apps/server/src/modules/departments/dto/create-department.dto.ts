import { ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'

import { BaseDepartmentDto } from './base-department.dto'

export class CreateDepartmentDto extends PickType(BaseDepartmentDto, [
  'orgId',
  'name',
  'remark',
  'isActive',
]) {
  @ApiPropertyOptional({
    description: '上级部门 ID，空字符串表示获取顶级部门',
  })
  @IsOptional()
  @IsString({ message: '上级部门 ID 必须是字符串' })
  @Transform(({ value }: { value: unknown }) => value === '' ? null : value)
  @Expose()
  readonly parentId?: string

  readonly organization?: {
    connect: {
      id: string
    }
  }

  readonly parent?: {
    connect: {
      id: string
    }
  }
}
