import { BUSINESS_CODES } from '@mono/constants'
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common'
import { ThrottlerException } from '@nestjs/throttler'
import type { Request, Response } from 'express'

/**
 * 频率限制异常过滤器
 * 捕获 ThrottlerException 并返回友好的错误响应
 */
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // 计算重置时间（从响应头中获取）
    const resetTime = this.getResetTime(response)

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      code: HttpStatus.TOO_MANY_REQUESTS,
      message: '请求过于频繁，请稍后再试',
      businessCode: BUSINESS_CODES.RATE_LIMIT_EXCEEDED,
      timestamp: new Date().toISOString(),
      path: request.url,
      extraData: {
        resetAt: resetTime,
      },
    })
  }

  /**
   * 从响应头中获取限流重置时间
   *
   * @param response - Express 响应对象
   * @returns ISO 格式的重置时间字符串
   */
  private getResetTime(response: Response): string {
    const retryAfter = response.getHeader('Retry-After')

    if (retryAfter) {
      const seconds = typeof retryAfter === 'string' ? parseInt(retryAfter, 10) : retryAfter
      const resetDate = new Date(Date.now() + (seconds as number) * 1000)

      return resetDate.toISOString()
    }

    // 如果没有 Retry-After 头，返回 1 分钟后
    const resetDate = new Date(Date.now() + 60_000)

    return resetDate.toISOString()
  }
}
