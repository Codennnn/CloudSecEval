import { ApiProperty } from '@nestjs/swagger'

/**
 * 分页响应元数据 DTO
 *
 * @description 用于 API 响应中的分页信息
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: '总记录数',
    example: 100,
    type: 'number',
  })
  total!: number

  @ApiProperty({
    description: '当前页码',
    example: 1,
    type: 'number',
  })
  page!: number

  @ApiProperty({
    description: '每页记录数',
    example: 10,
    type: 'number',
  })
  pageSize!: number

  @ApiProperty({
    description: '总页数',
    example: 10,
    type: 'number',
  })
  totalPages!: number

  @ApiProperty({
    description: '是否有下一页',
    example: true,
    type: 'boolean',
  })
  hasNextPage!: boolean

  @ApiProperty({
    description: '是否有上一页',
    example: false,
    type: 'boolean',
  })
  hasPrevPage!: boolean
}
