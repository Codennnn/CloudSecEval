import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { PrismaModule } from '~/prisma/prisma.module'

import { HealthController } from './health.controller'
import { DiskHealthIndicator } from './indicators/disk-health.indicator'
import { MemoryHealthIndicator } from './indicators/memory-health.indicator'
import { PrismaHealthIndicator } from './indicators/prisma-health.indicator'
import { HealthAggregatorService } from './services/health-aggregator.service'

/**
 * 健康检查模块
 *
 * @description 提供完整的应用健康检查功能，包括：
 * - 数据库连接状态检查
 * - 系统资源（内存、磁盘）使用情况检查
 * - 多层级的健康检查端点（基础、就绪、存活、详细）
 * - 与 NestJS Terminus 集成的标准化健康检查响应
 */
@Module({
  imports: [
    TerminusModule,
    PrismaModule,
  ],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
    HealthAggregatorService,
  ],
  exports: [
    PrismaHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
    HealthAggregatorService,
  ],
})
export class HealthModule {}
