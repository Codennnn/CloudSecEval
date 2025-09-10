import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '~/common/utils/pagination.util'

/**
 * 分页查询基础 DTO
 *
 * @description 包含分页查询的基础字段，其他需要分页的 DTO 可以继承使用
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: '页码，从 1 开始',
    example: 1,
    default: DEFAULT_PAGE,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于 0' })
  page?: number

  @ApiPropertyOptional({
    description: '每页数量，最大 100 条',
    example: 10,
    default: DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于 0' })
  @Max(100, { message: '每页数量不能超过 100' })
  pageSize?: number
}
