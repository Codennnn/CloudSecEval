import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'

import { type HealthDetailDto, HealthStatus } from './health-status.dto'

/**
 * 系统资源使用情况 DTO
 *
 * @description 系统资源（内存、磁盘等）的详细使用信息
 */
export interface SystemResourceDto {
  /** 总量（字节） */
  readonly total: number

  /** 已使用量（字节） */
  readonly used: number

  /** 可用量（字节） */
  readonly free: number

  /** 使用率（百分比，0-100） */
  readonly usage: number
}

/**
 * 数据库连接详情 DTO
 *
 * @description 数据库连接状态的详细信息
 */
export interface DatabaseHealthDetailDto extends HealthDetailDto {
  /** 数据库类型 */
  readonly type: string

  /** 数据库版本 */
  readonly version?: string

  /** 连接池信息 */
  readonly connectionPool?: {
    /** 活跃连接数 */
    readonly active: number
    /** 空闲连接数 */
    readonly idle: number
    /** 最大连接数 */
    readonly max: number
  }

  /** 查询统计 */
  readonly queryStats?: {
    /** 平均响应时间（毫秒） */
    readonly avgResponseTime: number
    /** 慢查询数量 */
    readonly slowQueries: number
  }
}

/**
 * 内存健康详情 DTO
 *
 * @description 内存使用状态的详细信息
 */
export interface MemoryHealthDetailDto extends HealthDetailDto {
  /** 堆内存信息 */
  readonly heap: SystemResourceDto

  /** RSS内存信息（常驻内存集） */
  readonly rss: SystemResourceDto

  /** 外部内存信息 */
  readonly external: SystemResourceDto

  /** 缓存使用信息 */
  readonly cache?: {
    /** 缓存项数量 */
    readonly items: number
    /** 缓存命中率（百分比） */
    readonly hitRate: number
    /** 内存占用（字节） */
    readonly memoryUsage: number
  }
}

/**
 * 磁盘健康详情 DTO
 *
 * @description 磁盘空间使用状态的详细信息
 */
export interface DiskHealthDetailDto extends HealthDetailDto {
  /** 磁盘路径 */
  readonly path: string

  /** 磁盘空间信息 */
  readonly space: SystemResourceDto

  /** 文件系统类型 */
  readonly filesystem?: string

  /** 关键目录检查 */
  readonly directories?: {
    /** 目录路径 */
    readonly path: string
    /** 是否可写 */
    readonly writable: boolean
    /** 是否存在 */
    readonly exists: boolean
  }[]
}

/**
 * 详细健康检查响应 DTO
 *
 * @description 包含详细系统信息的健康检查响应
 */
export class DetailedHealthCheckResponseDto {
  @ApiProperty({
    description: '整体健康状态',
    enum: HealthStatus,
    example: HealthStatus.UP,
  })
  readonly status!: HealthStatus

  @ApiProperty({
    description: '服务基本信息',
    example: {
      name: 'NestJS API Server',
      version: '1.0.0',
      environment: 'production',
      uptime: 3600000,
      startTime: '2024-01-01T00:00:00.000Z',
    },
  })
  readonly service!: {
    /** 服务名称 */
    readonly name: string
    /** 服务版本 */
    readonly version: string
    /** 运行环境 */
    readonly environment: string
    /** 运行时间（毫秒） */
    readonly uptime: number
    /** 启动时间 */
    readonly startTime: string
  }

  @ApiProperty({
    description: '数据库健康详情',
    required: false,
  })
  @IsOptional()
  readonly database?: HealthDetailDto

  @ApiProperty({
    description: '内存使用详情',
    required: false,
  })
  @IsOptional()
  readonly memory?: HealthDetailDto

  @ApiProperty({
    description: '磁盘使用详情',
    required: false,
  })
  @IsOptional()
  readonly disk?: HealthDetailDto

  @ApiProperty({
    description: '性能指标',
    example: {
      cpu: {
        usage: 25.5,
        loadAverage: [1.2, 1.5, 1.8],
      },
      requests: {
        total: 15420,
        perSecond: 12.5,
        avgResponseTime: 145,
      },
    },
    required: false,
  })
  @IsOptional()
  readonly performance?: {
    /** CPU 使用信息 */
    readonly cpu?: {
      /** CPU 使用率（百分比） */
      readonly usage: number
      /** 系统负载平均值 [1分钟, 5分钟, 15分钟] */
      readonly loadAverage: number[]
    }
    /** 请求统计信息 */
    readonly requests?: {
      /** 总请求数 */
      readonly total: number
      /** 每秒请求数 */
      readonly perSecond: number
      /** 平均响应时间（毫秒） */
      readonly avgResponseTime: number
    }
  }

  @ApiProperty({
    description: '检查总耗时（毫秒）',
    type: Number,
    example: 120,
  })
  @IsNumber({}, { message: '总耗时必须是数字' })
  readonly totalTime!: number

  @ApiProperty({
    description: '检查执行时间',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsString({ message: '时间戳必须是字符串' })
  readonly timestamp!: string
}
