import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { IsId } from '~/common/decorators/uuid.decorator'
import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'

/**
 * 获取部门成员查询参数 DTO
 */
export class GetDepartmentMembersDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '是否包含子部门的用户',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @BooleanTransform()
  readonly includeChildren?: boolean

  @ApiPropertyOptional({
    description: '按用户状态筛选',
  })
  @IsOptional()
  @IsBoolean()
  @BooleanTransform()
  readonly isActive?: boolean

  @ApiPropertyOptional({
    description: '按用户姓名或邮箱搜索',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  readonly search?: string
}

/**
 * 获取部门成员路径参数 DTO
 */
export class GetDepartmentMembersParamsDto {
  @ApiProperty({
    description: '部门 ID',
  })
  @IsId('部门 ID')
  readonly departmentId!: string
}
