import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDateString, IsOptional } from 'class-validator'

import { StandardResponseDto } from '~/common/dto/standard-response.dto'

/**
 * 获取每日报告统计的查询参数 DTO
 */
export class GetDailyReportsStatsDto {
  @ApiPropertyOptional({
    description: '开始日期（ISO 8601格式），默认为30天前',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  readonly startDate?: string

  @ApiPropertyOptional({
    description: '结束日期（ISO 8601格式），默认为当前日期',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  readonly endDate?: string
}

/**
 * 每日报告统计数据项 DTO
 */
export class DailyReportStatsDto {
  @ApiProperty({
    description: '日期',
    example: '2024-01-15',
  })
  @Expose()
  readonly date!: string

  @ApiProperty({
    description: '当日提交报告数量',
    example: 12,
  })
  @Expose()
  readonly submittedCount!: number

  @ApiProperty({
    description: '当日审核报告数量',
    example: 8,
  })
  @Expose()
  readonly reviewedCount!: number
}

/**
 * 每日报告统计响应数据 DTO
 */
export class DailyReportsStatsDataDto {
  @ApiProperty({
    description: '统计天数',
    example: 30,
  })
  @Expose()
  readonly totalDays!: number

  @ApiProperty({
    description: '统计时间范围内的总提交数',
    example: 156,
  })
  @Expose()
  readonly totalSubmitted!: number

  @ApiProperty({
    description: '统计时间范围内的总审核数',
    example: 142,
  })
  @Expose()
  readonly totalReviewed!: number

  @ApiProperty({
    description: '每日统计详情',
    type: [DailyReportStatsDto],
  })
  @Type(() => DailyReportStatsDto)
  @Expose()
  readonly dailyStats!: DailyReportStatsDto[]
}

/**
 * 每日报告统计响应 DTO
 */
export class DailyReportsStatsResponseDto
  extends StandardResponseDto<DailyReportsStatsDataDto> {
  @ApiProperty({
    description: '每日报告统计数据',
    type: DailyReportsStatsDataDto,
  })
  @Type(() => DailyReportsStatsDataDto)
  declare data: DailyReportsStatsDataDto
}
