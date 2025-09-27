import { AUTH_STRATEGIES, BUSINESS_CODES } from '@mono/constants'
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { IVerifyOptions } from 'passport-local'

import { User } from '#prisma/client'
import { BusinessException } from '~/common/exceptions/business.exception'

import { AuthError } from '../types/auth.type'

/**
 * 本地认证守卫
 *
 * 该守卫用于保护需要用户名密码认证的路由，主要用于登录接口。
 *
 * 工作原理：
 * - 基于 passport-local 策略实现
 * - 自动从请求体中提取 email 和 password 字段
 * - 调用 LocalStrategy.validate() 方法进行用户验证
 * - 验证成功后将用户信息附加到 request.user 对象上
 *
 * 使用场景：
 * - 登录接口：@UseGuards(LocalAuthGuard)
 * - 任何需要用户名密码验证的接口
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard(AUTH_STRATEGIES.LOCAL) {
  /**
   * 处理 Passport 认证结果
   *
   * 该方法在本地策略验证完成后被调用，负责：
   * - 接收验证过程中的结果（成功的用户数据或错误）
   * - 处理认证失败的情况（抛出适当的业务异常）
   * - 返回验证成功的用户信息，将被附加到 request.user 上
   *
   * @param err 认证过程中的错误
   * @param user 验证成功后的用户信息，或 false 表示验证失败
   * @param info 额外的认证信息
   * @returns 返回验证通过的用户对象
   * @throws 当认证失败或出现错误时抛出 BusinessException
   */
  handleRequest<TUser = User>(
    err: AuthError | null,
    user: TUser | false,
    info?: IVerifyOptions,
  ): TUser {
    // 如果存在错误，优先处理错误
    if (err) {
      // 如果是业务异常，直接抛出
      if (err instanceof BusinessException) {
        throw err
      }

      // 其他类型的错误，包装为业务异常
      throw BusinessException.unauthorized(
        BUSINESS_CODES.INVALID_CREDENTIALS,
        '认证失败',
      )
    }

    // 如果没有错误但用户验证失败
    if (!user) {
      // 根据 info 信息判断具体的错误类型
      if (info?.message === 'Missing credentials') {
        throw BusinessException.badRequest(
          BUSINESS_CODES.MISSING_PARAMETER,
          '请提供邮箱和密码',
        )
      }

      // 其他验证失败情况
      throw new BusinessException(
        BUSINESS_CODES.INVALID_CREDENTIALS,
        '邮箱或密码错误',
      )
    }

    return user
  }
}
