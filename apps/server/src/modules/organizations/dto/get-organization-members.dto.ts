import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { IsId } from '~/common/decorators/uuid.decorator'
import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'

/**
 * 组织成员查询参数 DTO
 * - 与用户列表查询保持一致的最小必要字段
 * - 支持分页、状态筛选、关键词搜索、部门筛选与包含子孙部门
 */
export class GetOrganizationMembersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '是否按用户状态筛选' })
  @IsOptional()
  @IsBoolean()
  @BooleanTransform()
  readonly isActive?: boolean

  @ApiPropertyOptional({ description: '按姓名或邮箱搜索' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  readonly search?: string

  @ApiPropertyOptional({ description: '部门 ID（可选）' })
  @IsOptional()
  @IsId('部门 ID')
  readonly departmentId?: string

  @ApiPropertyOptional({ description: '是否包含子孙部门（与部门筛选配合使用）' })
  @IsOptional()
  @IsBoolean()
  @BooleanTransform()
  readonly includeDescendants?: boolean
}
