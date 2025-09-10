import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import type { Response } from 'express'
import { z } from 'zod'

import { BusinessCode } from '../constants/business-codes'
import { StandardResponseDto } from '../dto/standard-response.dto'
import { BusinessException } from '../exceptions/business.exception'
import { mapHttpStatusToBusinessCode } from '../utils/response.util'

/**
 * HTTP 异常过滤器
 *
 * 专门处理系统中抛出的 HttpException 类型异常，将其转换为标准的响应格式。
 *
 * 工作原理：
 * - 捕获控制器或服务中抛出的所有 HttpException 异常
 * - 提取异常中的状态码和错误消息
 * - 将异常信息转换为统一的 JSON 响应格式
 * - 支持处理带有数组形式的验证错误消息
 *
 * 处理流程：
 * - 从异常对象获取 HTTP 状态码
 * - 从异常响应中提取错误消息
 * - 构造标准错误响应并发送给客户端
 *
 * 使用场景：
 * - 请求参数验证失败
 * - 资源未找到
 * - 权限不足
 * - 其他 HTTP 相关错误
 */

// 定义异常响应的类型验证模式
const ExceptionResponseSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
  businessCode: z.union([z.string(), z.number()]).optional(),
  extraData: z.union([z.object({}), z.array(z.object({}))]).optional(),
})

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * 异常处理方法
   *
   * @param exception 捕获到的 HttpException 异常
   * @param host 提供请求和响应对象的参数主机
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const httpStatus = exception.getStatus()
    let businessCode: BusinessCode = mapHttpStatusToBusinessCode(httpStatus)
    let message = '请求错误'
    let extraData: unknown

    // 如果是业务异常，使用业务异常的状态码
    if (exception instanceof BusinessException) {
      businessCode = exception.businessCode
      message = exception.businessMessage
      extraData = exception.extraData
    }
    else {
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

    // 发送标准格式的错误响应
    const errorResponse: StandardResponseDto = {
      code: businessCode,
      message,
      data: extraData ?? null,
    }

    response.status(httpStatus).json(errorResponse)
  }
}
