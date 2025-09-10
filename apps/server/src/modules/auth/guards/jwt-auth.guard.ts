import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

import { User } from '#prisma/client'
import { AUTH_STRATEGIES } from '~/common/constants/auth-strategies'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { isPublicRoute } from '~/common/utils/guard.util'

import { AuthError } from '../types/auth.type'

/**
 * JWT 认证守卫
 *
 * 该守卫基于 Passport JWT 策略实现，在应用中以全局方式注册，对所有接口实施自动认证。
 * 主要职责：
 * - 自动验证请求中的 JWT 令牌的有效性
 * - 处理公共路由的访问（通过 @Public 装饰器标记）
 * - 将验证后的用户信息附加到请求对象上，以便在控制器中访问
 *
 * 工作流程：
 * - 收到请求时，检查是否为公共路由
 * - 对非公共路由，调用 passport-jwt 策略验证令牌
 * - JWT 策略从请求头提取令牌，验证签名，并通过 JwtStrategy.validate 方法获取用户信息
 * - handleRequest 方法接收验证结果，处理错误或返回用户数据
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(AUTH_STRATEGIES.JWT) {
  constructor(private reflector: Reflector) {
    super()
  }

  /**
   * 判断当前路由是否允许访问
   *
   * @param context 执行上下文，包含请求信息
   * @returns 如果是公共路由或认证通过则返回 true，否则返回 false
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 检查路由是否标记为公共
    if (isPublicRoute(this.reflector, context)) {
      return true
    }

    return super.canActivate(context)
  }

  /**
   * 处理 Passport 认证结果
   *
   * 该方法在 JWT 令牌验证完成后被调用，负责：
   * - 接收验证过程中的结果（成功的用户数据或错误）
   * - 处理认证失败的情况（抛出未授权异常）
   * - 返回验证成功的用户信息，将被附加到 request.user 上
   *
   * @param err 认证过程中的错误（如令牌无效、过期等）
   * @param user 验证成功后的用户信息，或 false 表示验证失败
   * @returns 返回验证通过的用户对象
   * @throws 当认证失败或出现错误时抛出 BusinessException
   */
  handleRequest<TUser = User>(
    err: AuthError | null,
    user: TUser | false,
  ): TUser {
    if (err) {
      throw err
    }

    if (!user) {
      throw BusinessException.unauthorized(BUSINESS_CODES.UNAUTHORIZED)
    }

    return user
  }
}
