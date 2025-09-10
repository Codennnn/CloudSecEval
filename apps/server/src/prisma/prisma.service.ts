import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

import { Prisma, PrismaClient } from '#prisma/client'
import { AppConfigService } from '~/config/services/config.service'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor(private readonly configService: AppConfigService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('成功连接到数据库')

    // 开发环境下可以启用查询日志
    if (this.configService.isDevelopment) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.$on('query', (ev: Prisma.QueryEvent) => {
        this.logger.debug(`查询: ${ev.query}`)
        this.logger.debug(`参数: ${ev.params}`)
        this.logger.debug(`持续时间: ${ev.duration}ms`)
      })
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('已断开数据库连接')
  }
}
