import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AllConfig, AppConfig, DatabaseConfig, JwtConfig, ThrottlerConfig } from '~/config/schemas/types'

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<AllConfig, true>) {}

  get app(): AppConfig {
    return this.configService.get('app', { infer: true })
  }

  get database(): DatabaseConfig {
    return this.configService.get('database', { infer: true })
  }

  get jwt(): JwtConfig {
    return this.configService.get('jwt', { infer: true })
  }

  get throttler(): ThrottlerConfig {
    return this.configService.get('throttler', { infer: true })
  }

  get isDevelopment(): boolean {
    return this.app.env === 'development'
  }

  get isProduction(): boolean {
    return this.app.env === 'production'
  }

  get isTest(): boolean {
    return this.app.env === 'test'
  }
}
