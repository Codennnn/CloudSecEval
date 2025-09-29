import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

/**
 * 健康状态枚举
 *
 * @description 定义健康检查的所有可能状态
 */
export enum HealthStatus {
  /** 健康状态 */
  UP = 'up',
  /** 异常状态 */
  DOWN = 'down',
  /** 降级状态 - 部分功能可用 */
  DEGRADED = 'degraded',
  /** 未知状态 - 检查失败或超时 */
  UNKNOWN = 'unknown',
}

/**
 * 健康检查详细信息 DTO
 *
 * @description 单个健康检查项的详细状态信息
 */
export interface HealthDetailDto {
  /** 健康状态 */
  readonly status: HealthStatus

  /** 响应时间（毫秒） */
  readonly responseTime?: number

  /** 详细消息或错误信息 */
  readonly message?: string

  /** 额外的上下文信息 */
  readonly metadata?: Record<string, unknown>

  /** 检查时间戳 */
  readonly timestamp: string
}

/**
 * 健康检查结果 DTO
 *
 * @description 整体健康检查的响应数据结构
 */
export class HealthCheckResponseDto {
  @ApiProperty({
    description: '整体健康状态',
    enum: HealthStatus,
    example: HealthStatus.UP,
  })
  @IsEnum(HealthStatus, { message: '健康状态必须是有效的枚举值' })
  readonly status!: HealthStatus

  @ApiProperty({
    description: '各项健康检查详情',
    type: 'object',
    additionalProperties: {
      type: 'object',
    },
    example: {
      database: {
        status: 'up',
        responseTime: 15,
        message: '数据库连接正常',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  readonly info!: Record<string, HealthDetailDto>

  @ApiProperty({
    description: '异常检查项详情',
    type: 'object',
    additionalProperties: {
      type: 'object',
    },
  })
  @IsOptional()
  readonly error?: Record<string, HealthDetailDto>

  @ApiProperty({
    description: '所有检查项的完整详情',
    type: 'object',
    additionalProperties: {
      type: 'object',
    },
  })
  readonly details!: Record<string, HealthDetailDto>

  @ApiProperty({
    description: '检查总耗时（毫秒）',
    type: Number,
    example: 45,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '总耗时必须是数字' })
  readonly totalTime?: number

  @ApiProperty({
    description: '检查执行时间',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsString({ message: '时间戳必须是字符串' })
  readonly timestamp!: string
}
