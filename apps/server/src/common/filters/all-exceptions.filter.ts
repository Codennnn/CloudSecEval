import { BUSINESS_CODES, BusinessCode } from '@mono/constants'
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import type { Response } from 'express'
import { z } from 'zod'

import { StandardResponseDto } from '../dto/standard-response.dto'
import { BusinessException } from '../exceptions/business.exception'
import { handlePrismaError, isPrismaError } from '../utils/prisma-error.util'
import { mapHttpStatusToBusinessCode } from '../utils/response.util'

/**
 * 全局异常捕获过滤器
 *
 * 捕获并处理应用中的所有异常，无论是否为 HTTP 异常，提供最后的错误处理机制。
 *
 * 工作原理：
 * - 不指定具体异常类型，捕获系统中抛出的所有异常
 * - 将各类异常转换为统一的 HTTP 响应格式
 * - 为预期内的 HttpException 保留其状态码
 * - 将意外异常统一处理为 500 内部服务器错误
 * - 支持自定义业务状态码
 *
 * 优势：
 * - 提供完整的异常处理保障，确保所有错误都能被正确响应
 * - 防止未处理的异常导致应用崩溃
 * - 隐藏服务器内部错误细节，提升安全性
 * - 为客户端提供一致的错误响应格式
 * - 统一的业务状态码管理
 *
 * 使用场景：
 * - 作为全局异常处理的最后防线
 * - 处理意外的系统错误、数据库异常等
 */

// 定义异常响应的类型验证模式
const ExceptionResponseSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
  businessCode: z.union([z.string(), z.number()]).optional(),
  extraData: z.union([z.object({}), z.array(z.object({}))]).optional(),
})

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * 异常处理方法
   *
   * @param exception 捕获到的任意类型异常
   * @param host 提供请求和响应对象的参数主机
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let httpStatus: HttpStatus
    let businessCode: BusinessCode
    let message = '服务器内部错误'
    let extraData: unknown

    // 处理 Prisma 错误
    if (isPrismaError(exception)) {
      const prismaException = handlePrismaError(exception)
      httpStatus = prismaException.getStatus()
      businessCode = prismaException.businessCode
      message = prismaException.businessMessage
      extraData = prismaException.extraData
    }
    // 处理业务异常
    else if (exception instanceof BusinessException) {
      httpStatus = exception.getStatus()
      businessCode = exception.businessCode
      message = exception.businessMessage
      extraData = exception.extraData
    }
    // 处理 HTTP 异常
    else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus()
      businessCode = mapHttpStatusToBusinessCode(httpStatus)

      const exceptionResponse = exception.getResponse()

      const parseResult = ExceptionResponseSchema.safeParse(exceptionResponse)

      if (parseResult.success) {
        const {
          message: errorMessage,
          businessCode: customBusinessCode,
          extraData: customExtraData,
        } = parseResult.data

        // 如果异常响应中包含自定义业务状态码，使用它
        if (customBusinessCode && typeof customBusinessCode === 'number') {
          businessCode = customBusinessCode as BusinessCode
        }

        message = Array.isArray(errorMessage)
          ? errorMessage[0] // 取数组中的第一条错误消息
          : errorMessage

        extraData = customExtraData
      }
    }
    // 处理普通错误
    else if (exception instanceof Error) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
      businessCode = BUSINESS_CODES.INTERNAL_SERVER_ERROR
      message = exception.message
    }
    // 处理未知异常
    else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
      businessCode = BUSINESS_CODES.INTERNAL_SERVER_ERROR
      message = '未知错误'
    }

    // 发送标准格式的错误响应
    const errorResponse: StandardResponseDto = {
      code: businessCode,
      message,
      data: extraData ?? null,
    }

    response.status(httpStatus).json(errorResponse)
  }
}
