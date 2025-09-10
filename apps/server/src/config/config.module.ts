import { Global, Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { ZodError } from 'zod'

import appConfig from './configurations/app.config'
import databaseConfig from './configurations/database.config'
import jwtConfig from './configurations/jwt.config'
import mailConfig from './configurations/mail.config'

const configurationProviders = [
  appConfig,
  databaseConfig,
  jwtConfig,
  mailConfig,
]

import { validationSchema } from './schemas/validation.schema'
import { AppConfigService } from './services/config.service'

/**
 * Zod 环境变量验证函数
 *
 * 此函数由 NestJS ConfigModule 在应用启动时自动调用，用于验证环境变量配置的完整性和有效性。
 *
 * @param config - 由 ConfigModule 传入的配置对象，包含以下来源的环境变量。
 *
 * 验证流程：
 *   - 在应用启动阶段，ConfigModule 会自动收集所有环境变量
 *   - 将收集到的配置对象传递给此 validate 函数进行验证
 *   - 如果验证失败，应用启动将被中断并抛出详细的错误信息
 *
 * @returns 验证通过的配置对象
 * @throws Error 当配置验证失败时抛出包含详细错误信息的异常
 */
const validate = (config: Record<string, unknown>) => {
  try {
    return validationSchema.parse(config)
  }
  catch (err) {
    if (err instanceof ZodError) {
      const errorMessages = err.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')

      throw new Error(`环境变量配置验证失败：${errorMessages}`)
    }

    throw new Error(`环境变量配置验证失败：${String(err)}`)
  }
}

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configurationProviders,
      validate,
      envFilePath: [
        '.env.local',
        `.env.${process.env.NODE_ENV}`,
      ],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
