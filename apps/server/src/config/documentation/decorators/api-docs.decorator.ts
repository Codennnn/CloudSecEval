import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, type ApiResponseOptions } from '@nestjs/swagger'

import { getBusinessCodeMessage } from '~/common/constants/business-codes'

import type { ApiDocsDecoratorOptions, ApiOperationConfig } from '../types/api-docs.types'

function createApiResponseDecorator(config: ApiResponseOptions) {
  const responseOptions: ApiResponseOptions = {
    ...config,
    ...'schema' in config && typeof config.schema === 'object'
      ? { schema: config.schema }
      : {},
    ...'example' in config && typeof config.example === 'object'
      ? { example: config.example }
      : {},
  }

  return ApiResponse(responseOptions)
}

/**
 * 最新的 API 文档装饰器（直接引用配置对象）
 * 提供最佳的类型安全性和开发体验
 *
 * @param config 直接引用的配置对象
 * @param options 可选配置
 * @returns 装饰器组合
 */
export function ApiDocs(
  config: ApiOperationConfig,
  options: Partial<ApiDocsDecoratorOptions> = {},
) {
  // 构建装饰器数组
  const decorators: (ClassDecorator | MethodDecorator)[] = []

  if (config.requireAuth !== false) {
    decorators.push(ApiBearerAuth('jwt'))
  }

  // 操作描述
  decorators.push(
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
  )

  // 成功响应
  decorators.push(createApiResponseDecorator(config.successResponse))

  // 添加错误响应
  if (config.errorResponses) {
    config.errorResponses.forEach((errorResponse) => {
      decorators.push(createApiResponseDecorator(errorResponse))
    })
  }

  if (config.errorResponseCode) {
    config.errorResponseCode.forEach((errorResponseCode) => {
      const errMsg = getBusinessCodeMessage(errorResponseCode)

      decorators.push(createApiResponseDecorator({
        status: errorResponseCode,
        description: errMsg,
        schema: {
          type: 'object',
          properties: {
            code: {
              type: 'number',
              example: errorResponseCode,
            },
            message: {
              type: 'string',
              example: errMsg,
            },
          },
        },
      }))
    })
  }

  // 添加额外的响应配置
  if (options.additionalResponses) {
    options.additionalResponses.forEach((response) => {
      decorators.push(createApiResponseDecorator(response))
    })
  }

  // 统一处理 requestBody 与 consumes（用于 multipart/form-data 等）
  if (config.consumes && config.consumes.length > 0) {
    decorators.push(ApiConsumes(...config.consumes))
  }

  if (config.requestBody) {
    decorators.push(ApiBody(config.requestBody))
  }

  return applyDecorators(...decorators)
}
