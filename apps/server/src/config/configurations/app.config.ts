import { registerAs } from '@nestjs/config'

import { CONFIG_DEFAULTS } from '../schemas/defaults'

export default registerAs('app', () => ({
  // 基础应用配置
  port: process.env.PORT ? Number(process.env.PORT) : CONFIG_DEFAULTS.PORT,
  env: process.env.NODE_ENV ?? CONFIG_DEFAULTS.NODE_ENV,
  apiPrefix: process.env.API_PREFIX ?? CONFIG_DEFAULTS.API_PREFIX,

  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN?.split(','),
    credentials: process.env.CORS_CREDENTIALS ? process.env.CORS_CREDENTIALS === 'true' : CONFIG_DEFAULTS.CORS_CREDENTIALS,
  },

  // 管理员配置
  admin: {
    email: process.env.ADMIN_EMAIL ?? CONFIG_DEFAULTS.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD ?? CONFIG_DEFAULTS.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME ?? CONFIG_DEFAULTS.ADMIN_NAME,
  },

  // Redis 配置
  redis: {
    host: process.env.REDIS_HOST ?? CONFIG_DEFAULTS.REDIS_HOST,
    port: process.env.REDIS_PORT
      ? Number(process.env.REDIS_PORT)
      : CONFIG_DEFAULTS.REDIS_PORT,
  },

  // 时区配置
  timezone: process.env.TIMEZONE ?? CONFIG_DEFAULTS.TIMEZONE,
}))
