import { BadRequestException, type LogLevel, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { consola } from 'consola'
import cookieParser from 'cookie-parser'
import { json, urlencoded } from 'express'

import { AppModule } from '~/app.module'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { AllExceptionsFilter } from '~/common/filters/all-exceptions.filter'
import { HttpExceptionFilter } from '~/common/filters/http-exception.filter'
import { TransformInterceptor } from '~/common/interceptors/transform.interceptor'
import { createStartupTable } from '~/common/utils/startup-table.util'
import { setupSwagger } from '~/config/documentation/swagger.config'
import { AppConfigService } from '~/config/services/config.service'

import { flattenValidationErrors } from './common/utils/exception.util'

void (async function bootstrap() {
  const loggerLevel = (process.env.LOGGER_LEVEL?.split(',') ?? []) as LogLevel[]

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.LOGGER_ENABLED === 'false' ? false : loggerLevel,
  })

  // 设置 Express 查询解析器为 extended 模式，支持解析复杂的查询参数（如嵌套对象和数组）
  app.set('query parser', 'extended')

  // 获取配置服务
  const configService = app.get(AppConfigService)

  app.setGlobalPrefix(configService.app.apiPrefix)

  // 配置 Cookie 解析器
  app.use(cookieParser())

  // 配置请求体解析器 - 支持大型富文本内容
  const MAX_REQUEST_SIZE = '50mb' // 支持最大50MB的请求体
  app.use(json({ limit: MAX_REQUEST_SIZE }))
  app.use(urlencoded({ limit: MAX_REQUEST_SIZE, extended: true }))

  // 启用 CORS 跨域支持
  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
  // app.enableCors({
  //   origin: '*',
  //   origin: configService.app.cors.origin,
  //   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  //   credentials: configService.app.cors.credentials,
  //   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  // })

  // 全局应用验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 仅保留带有校验装饰器的属性
      forbidNonWhitelisted: true, // 对多余字段直接抛错
      transform: true, // 将请求体转换为 DTO 实例
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: false, // 禁用隐式转换，让 @Transform 装饰器来处理
      },
      disableErrorMessages: configService.isProduction,
      exceptionFactory: (validationErrors) => {
        const errors = flattenValidationErrors(validationErrors)
        const firstMessage = errors.at(0)?.messages.at(0)

        return new BadRequestException({
          message: `数据验证失败：${firstMessage}`,
          businessCode: BUSINESS_CODES.VALIDATION_ERROR,
          extraData: { errors: configService.isProduction ? undefined : errors },
        })
      },
    }),
  )

  // 全局应用响应转换拦截器
  app.useGlobalInterceptors(new TransformInterceptor())

  // 全局应用异常过滤器
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  )

  // 配置 Swagger 文档
  const swaggerResult = await setupSwagger(app)

  const port = configService.app.port
  await app.listen(port)

  const serverUrl = await app.getUrl()

  if (configService.isDevelopment) {
    swaggerResult.printInfo?.(serverUrl)
  }

  // 使用封装的工具函数创建启动信息表格
  const tableOutput = createStartupTable({
    serverUrl,
    configService,
  })

  consola.success('\n' + tableOutput)
})()
