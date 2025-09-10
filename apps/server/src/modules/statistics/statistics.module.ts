import { Module } from '@nestjs/common'

import { PrismaModule } from '~/prisma/prisma.module'

import { StatisticsController } from './statistics.controller'
import { StatisticsRepository } from './statistics.repository'
import { StatisticsService } from './statistics.service'

/**
 * 统计信息模块
 * 提供用户、授权码、访问日志等各类业务数据的统计分析功能
 */
@Module({
  imports: [PrismaModule],
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsRepository],
  exports: [StatisticsService, StatisticsRepository],
})
export class StatisticsModule {}
