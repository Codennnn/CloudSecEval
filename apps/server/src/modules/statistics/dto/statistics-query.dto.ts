import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'

/**
 * 统计周期类型
 */
type StatisticsPeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'

/**
 * 统计查询基础 DTO
 */
export class StatisticsQueryDto {
  @ApiPropertyOptional({
    description: '开始日期',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly startDate?: Date

  @ApiPropertyOptional({
    description: '结束日期',
    example: '2024-12-31T23:59:59.999Z',
    type: String,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly endDate?: Date

  @ApiPropertyOptional({
    description: '统计周期',
    enum: ['hour', 'day', 'week', 'month', 'quarter', 'year'],
    example: 'day',
  })
  @IsOptional()
  @IsEnum(['hour', 'day', 'week', 'month', 'quarter', 'year'])
  readonly period?: StatisticsPeriod

  @ApiPropertyOptional({
    description: '页面大小',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  readonly limit?: number = 10

  @ApiPropertyOptional({
    description: '页面偏移',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly offset?: number = 0
}

/**
 * 用户统计查询 DTO
 */
export class UserStatisticsQueryDto extends StatisticsQueryDto {
  @ApiPropertyOptional({
    description: '是否包含非活跃用户',
    example: true,
  })
  @IsOptional()
  @BooleanTransform()
  readonly includeInactive?: boolean

  @ApiPropertyOptional({
    description: '用户状态过滤',
    enum: ['active', 'inactive', 'all'],
    example: 'all',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'all'])
  readonly userStatus?: 'active' | 'inactive' | 'all' = 'all'
}

/**
 * 授权码统计查询 DTO
 */
export class LicenseStatisticsQueryDto extends StatisticsQueryDto {
  @ApiPropertyOptional({
    description: '授权码状态过滤',
    enum: ['used', 'unused', 'locked', 'expired', 'all'],
    example: 'all',
  })
  @IsOptional()
  @IsEnum(['used', 'unused', 'locked', 'expired', 'all'])
  readonly licenseStatus?: 'used' | 'unused' | 'locked' | 'expired' | 'all' = 'all'

  @ApiPropertyOptional({
    description: '最小购买金额',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly minAmount?: number

  @ApiPropertyOptional({
    description: '最大购买金额',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly maxAmount?: number
}

/**
 * 收入统计查询 DTO
 */
export class RevenueStatisticsQueryDto extends StatisticsQueryDto {
  @ApiPropertyOptional({
    description: '货币单位',
    example: 'CNY',
    enum: ['CNY', 'USD', 'EUR'],
  })
  @IsOptional()
  @IsEnum(['CNY', 'USD', 'EUR'])
  readonly currency?: 'CNY' | 'USD' | 'EUR' = 'CNY'

  @ApiPropertyOptional({
    description: '是否包含退款',
    example: false,
  })
  @IsOptional()
  @BooleanTransform()
  readonly includeRefunds?: boolean = false
}

/**
 * 访问统计查询 DTO
 */
export class AccessStatisticsQueryDto extends StatisticsQueryDto {
  @ApiPropertyOptional({
    description: '是否仅统计风险访问',
    example: false,
  })
  @IsOptional()
  @BooleanTransform()
  readonly onlyRisky?: boolean = false

  @ApiPropertyOptional({
    description: 'IP地址过滤',
    example: '192.168.1.1',
  })
  @IsOptional()
  readonly ipAddress?: string

  @ApiPropertyOptional({
    description: '邮箱过滤',
    example: 'user@example.com',
  })
  @IsOptional()
  readonly email?: string
}

/**
 * 实时监控查询 DTO
 */
export class RealtimeQueryDto {
  @ApiPropertyOptional({
    description: '数据刷新间隔（秒）',
    example: 30,
    minimum: 10,
    maximum: 300,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(300)
  readonly refreshInterval?: number = 30
}
