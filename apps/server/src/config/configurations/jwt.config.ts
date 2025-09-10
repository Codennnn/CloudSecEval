import { registerAs } from '@nestjs/config'

import { CONFIG_DEFAULTS } from '../schemas/defaults'

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? CONFIG_DEFAULTS.JWT_SECRET_FALLBACK,
  expiresIn: process.env.JWT_EXPIRES_IN ?? CONFIG_DEFAULTS.JWT_EXPIRES_IN,
  refreshSecret: process.env.JWT_REFRESH_SECRET
    ?? process.env.JWT_SECRET
    ?? CONFIG_DEFAULTS.JWT_REFRESH_SECRET_FALLBACK,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? CONFIG_DEFAULTS.JWT_REFRESH_EXPIRES_IN,

  // Cookie 配置
  cookie: {
    enabled: process.env.JWT_USE_COOKIE === 'true',
    name: process.env.JWT_COOKIE_NAME ?? CONFIG_DEFAULTS.JWT_COOKIE_NAME,
    domain: process.env.JWT_COOKIE_DOMAIN ?? CONFIG_DEFAULTS.JWT_COOKIE_DOMAIN,
    secure: process.env.JWT_COOKIE_SECURE === 'true' || CONFIG_DEFAULTS.JWT_COOKIE_SECURE,
    sameSite: (process.env.JWT_COOKIE_SAME_SITE ?? CONFIG_DEFAULTS.JWT_COOKIE_SAME_SITE) as 'lax' | 'strict' | 'none',
  },
}))
