import { Module } from '@nestjs/common'
import { ThrottlerModule as NestThrottlerModule } from '@nestjs/throttler'

import { AppConfigService } from '~/config/services/config.service'

@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => {
        const { ttl, limit } = configService.throttler

        return [
          {
            name: 'default',
            ttl,
            limit,
          },
        ]
      },
    }),
  ],
})
export class ThrottlerModule {}
