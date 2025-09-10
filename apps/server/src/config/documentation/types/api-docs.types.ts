import { type ApiBodyOptions, type ApiOperationOptions, type ApiResponseOptions, type ApiResponseSchemaHost } from '@nestjs/swagger'

import type { BusinessErrorCode } from '~/common/constants/business-codes'

/**
 * 基础类型定义
 */
type JsonArray = JsonValue[]
interface JsonObject {
  [key: string]: JsonValue
}
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray

/**
 * API 响应配置类型
 * 定义标准的 API 响应结构
 */
interface ApiResponseConfig {
  /** HTTP状态码 */
  status: ApiResponseOptions['status']
  /** 响应描述 */
  description: ApiResponseOptions['description']
  /** 响应示例 */
  example?: JsonValue
  /** 响应Schema */
  schema?: ApiResponseSchemaHost['schema']
}

/**
 * API 操作配置类型
 * 定义 API 操作的完整文档配置
 */
export interface ApiOperationConfig {
  /** 操作摘要 */
  summary: ApiOperationOptions['summary']
  /** 操作详细描述 */
  description?: ApiOperationOptions['description']
  /** 成功响应配置 */
  successResponse: ApiResponseOptions
  /** 错误响应配置数组 */
  errorResponses?: ApiResponseOptions[]
  errorResponseCode?: BusinessErrorCode[]
  /** 是否需要管理员权限 */
  requireAdmin?: boolean
  /** 是否需要鉴权（添加 Bearer 认证） */
  requireAuth?: boolean

  /** 请求体配置（用于统一声明 Swagger 的 requestBody，如 multipart/form-data） */
  requestBody?: ApiBodyOptions
  /** 消费的内容类型（如 ['multipart/form-data']） */
  consumes?: string[]
}

/**
 * 装饰器选项类型
 */
export interface ApiDocsDecoratorOptions {
  /** 额外的响应配置 */
  additionalResponses?: ApiResponseConfig[]
}
