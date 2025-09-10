import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { consola } from 'consola'

import { AppConfigService } from '~/config/services/config.service'

/**
 * 动态导入 metadata，如果文件不存在则返回空元数据
 */
async function loadMetadata() {
  try {
    const metadata = await import('~/metadata')

    return metadata.default
  }
  catch {
    consola.warn('metadata.ts 文件不存在，将使用空元数据。请运行 nest build 生成元数据文件。')

    return () => Promise.resolve({ '@nestjs/swagger': { models: [], controllers: [] } })
  }
}

/**
 * Swagger 配置选项
 */
interface SwaggerOptions {
  /** 文档标题 */
  title?: string
  /** 文档描述 */
  description?: string
  /** 文档版本 */
  version?: string
  /** 文档挂载路径 */
  path?: string
  /** 是否启用持久化认证 */
  persistAuthorization?: boolean
  /** 是否启用 Swagger */
  enabled?: boolean
  /** JSON 文档路径 */
  jsonPath?: string
}

/**
 * Swagger 设置结果
 */
interface SwaggerSetupResult {
  /** 是否已启用 */
  enabled: boolean
  /** 文档访问路径 */
  docsUrl?: string
  /** JSON 文档访问路径 */
  jsonUrl?: string
  /** 配置信息 */
  config: Required<SwaggerOptions>
  printInfo?: (serverUrl: string) => void
}

/**
 * 默认 Swagger 配置
 */
const DEFAULT_OPTIONS: Required<SwaggerOptions> = {
  title: '付费阅读服务 API',
  description: '基于邮箱授权码的付费内容访问控制服务 - 提供轻量安全的内容付费解决方案，支持邮箱验证、授权码管理、访问控制和风险检测等功能',
  version: '1.0',
  path: 'api-docs',
  jsonPath: 'api-docs-json',
  enabled: true,
  persistAuthorization: true,
}

/**
 * 设置 Swagger 文档
 * @param app NestJS 应用实例
 * @param options Swagger 配置选项
 * @returns Swagger 设置结果
 */
export async function setupSwagger(
  app: INestApplication,
  options: SwaggerOptions = {},
): Promise<SwaggerSetupResult> {
  // 获取配置服务
  const configService = app.get(AppConfigService)

  // 合并配置
  const config: Required<SwaggerOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    // 生产环境默认禁用 Swagger
    enabled: options.enabled ?? !configService.isProduction,
  }

  // 如果禁用了 Swagger，则直接返回
  if (!config.enabled) {
    return {
      enabled: false,
      config,
    }
  }

  // 构建 Swagger 文档配置
  const documentConfig = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入 JWT token',
        in: 'header',
      },
      'jwt',
    )
    .build()

  /**
   * 动态加载 NestJS Swagger 插件生成的元数据，包含所有 DTO 和 Entity 的类型信息
   * 这些元数据用于自动生成 API 文档中的数据模型定义和验证规则
   * 如果 metadata.ts 文件不存在，则使用空元数据
   */
  const metadata = await loadMetadata()
  await SwaggerModule.loadPluginMetadata(metadata)

  // 创建 Swagger 文档
  const document = SwaggerModule.createDocument(app, documentConfig)

  // 设置 Swagger UI
  SwaggerModule.setup(config.path, app, document, {
    swaggerOptions: {
      persistAuthorization: config.persistAuthorization,
    },
    jsonDocumentUrl: config.jsonPath,
  })

  const printInfo = (serverUrl: string) => {
    consola.info(`Swagger 文档: ${serverUrl}/${config.path}`)
    consola.info(`Swagger JSON: ${serverUrl}/${config.jsonPath}`)
  }

  return {
    enabled: true,
    docsUrl: config.path,
    jsonUrl: config.jsonPath,
    config,
    printInfo,
  }
}
