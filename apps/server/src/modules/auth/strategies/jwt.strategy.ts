import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import type { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AUTH_STRATEGIES } from '~/common/constants/auth-strategies'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import jwtConfig from '~/config/configurations/jwt.config'
import { UsersService } from '~/modules/users/users.service'

import { JwtPayload } from '../types/auth.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AUTH_STRATEGIES.JWT) {
  constructor(
    @Inject(jwtConfig.KEY) private config: ConfigType<typeof jwtConfig>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: JwtStrategy.createJwtExtractor(config),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    })
  }

  /**
   * 创建 JWT 提取器，支持从 Cookie 和 Authorization Header 中提取
   * 优先级：Cookie > Authorization Header
   */
  private static createJwtExtractor(config: ConfigType<typeof jwtConfig>) {
    return (request: Request): string | null => {
      let token: string | null = null

      // 1. 首先尝试从 Cookie 中提取 (如果启用了 Cookie)
      if (config.cookie.enabled) {
        const tokenCookie = request.cookies[config.cookie.name] as unknown

        if (typeof tokenCookie === 'string') {
          token = tokenCookie
        }
      }

      // 2. 如果 Cookie 中没有找到，则从 Authorization Header 中提取
      token ??= ExtractJwt.fromAuthHeaderAsBearerToken()(request)

      return token
    }
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub)

    if (!user.isActive) {
      throw BusinessException.unauthorized(
        BUSINESS_CODES.ACCOUNT_DISABLED,
        '用户已禁用',
      )
    }

    return user
  }
}
