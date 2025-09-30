import { Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'
import type { Request } from 'express'

/**
 * 自定义频率限制守卫
 * 扩展 NestJS 官方 ThrottlerGuard，支持基于用户 ID 和 IP 地址的限流
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * 生成限流键
   * - 已认证用户：基于用户 ID
   * - 未认证用户：基于 IP 地址
   *
   * @param req - Express 请求对象
   * @returns 限流键
   */
  protected getTracker(req: Request): Promise<string> {
    const request = req

    // 尝试从请求中获取用户信息（由 JwtAuthGuard 注入）
    const user = request.user

    // 如果用户已认证，使用用户 ID 作为限流键
    if (user && 'id' in user) {
      return Promise.resolve(`user-${user.id as string}`)
    }

    // 否则使用 IP 地址作为限流键
    const ip = this.getClientIp(request)

    return Promise.resolve(`ip-${ip}`)
  }

  /**
   * 获取客户端 IP 地址
   * 支持从代理头中获取真实 IP
   *
   * @param request - Express 请求对象
   * @returns 客户端 IP 地址
   */
  private getClientIp(request: Request): string {
    // 尝试从常见的代理头中获取真实 IP
    const forwardedFor = request.headers['x-forwarded-for']

    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor

      return ips.split(',')[0].trim()
    }

    const realIp = request.headers['x-real-ip']

    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp
    }

    // 回退到 socket 地址
    return request.ip ?? request.socket.remoteAddress ?? 'unknown'
  }
}
