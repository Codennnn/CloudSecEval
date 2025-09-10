import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { AUTH_STRATEGIES } from '~/common/constants/auth-strategies'
import { CreateUserDto } from '~/modules/users/dto/create-user.dto'

import { AuthService } from '../auth.service'

/**
 * 本地认证策略
 *
 * 实现基于用户名和密码的本地认证，主要用于登录接口。
 *
 * 工作原理：
 * - 继承自 Passport 的本地策略（passport-local）
 * - 配置为使用 email 作为用户标识（替代默认的 username）
 * - 在验证过程中调用 AuthService 进行用户凭据校验
 * - 验证成功后返回用户信息（不含密码）
 * - 验证失败时抛出未授权异常
 *
 * 使用场景：
 * - 登录接口 (@Post('login'))，通过 @UseGuards(AuthGuard('local')) 启用
 * - 验证成功后的用户信息会被附加到 request.user 对象上
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, AUTH_STRATEGIES.LOCAL) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // 配置使用 email 字段作为用户名
      passwordField: 'password', // 配置使用 password 字段作为密码
    })
  }

  /**
   * 验证用户凭据
   *
   * 当收到登录请求时，Passport 会自动调用此方法进行用户验证。
   *
   * 注意：AuthService.validateUser 方法会在验证失败时直接抛出异常，
   * 因此此方法只需要直接返回验证成功的用户信息即可。
   *
   * @param email 用户邮箱
   * @param password 用户密码（明文）
   * @returns 验证成功的用户信息（不含密码）
   * @throws 当验证失败时由 AuthService.validateUser 抛出相应异常
   */
  async validate(email: CreateUserDto['email'], password: CreateUserDto['password']) {
    return await this.authService.validateUser(email, password)
  }
}
