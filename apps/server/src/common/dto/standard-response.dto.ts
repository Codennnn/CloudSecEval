import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { BUSINESS_CODES, getBusinessCodeMessage } from '~/common/constants/business-codes'

import { PaginationMetaDto } from './pagination-meta.dto'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export class StandardResponseDto<T = unknown> {
  @ApiProperty({
    description: '状态码',
    type: Number,
    example: BUSINESS_CODES.SUCCESS,
  })
  code!: number

  @ApiProperty({
    description: '消息',
    type: String,
    example: getBusinessCodeMessage(BUSINESS_CODES.SUCCESS),
  })
  @IsOptional()
  message?: string

  @ApiProperty({
    description: '响应数据',
    type: Object,
  })
  data!: T
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export class StandardListResponseDto<T = unknown> extends StandardResponseDto<T[]> {
  @ApiProperty({
    description: '分页信息',
    type: PaginationMetaDto,
  })
  @IsOptional()
  pagination?: PaginationMetaDto
}
