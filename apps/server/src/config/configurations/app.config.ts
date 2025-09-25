import { registerAs } from '@nestjs/config'

import { CONFIG_DEFAULTS } from '../schemas/defaults'

export default registerAs('app', () => ({
  // 基础应用配置
  port: process.env.PORT ? Number(process.env.PORT) : CONFIG_DEFAULTS.PORT,
  env: process.env.NODE_ENV ?? CONFIG_DEFAULTS.NODE_ENV,
  apiPrefix: process.env.API_PREFIX ?? CONFIG_DEFAULTS.API_PREFIX,

  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN === 'false'
        ? false
        : process.env.CORS_ORIGIN === '*'
          ? '*'
          : process.env.CORS_ORIGIN.split(',')
      : false,
    credentials: process.env.CORS_CREDENTIALS ? process.env.CORS_CREDENTIALS === 'true' : CONFIG_DEFAULTS.CORS_CREDENTIALS,
  },

  // 管理员配置
  admin: {
    email: process.env.ADMIN_EMAIL ?? CONFIG_DEFAULTS.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD ?? CONFIG_DEFAULTS.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME ?? CONFIG_DEFAULTS.ADMIN_NAME,
  },

  // 时区配置
  timezone: process.env.TIMEZONE ?? CONFIG_DEFAULTS.TIMEZONE,

  // 临时目录配置
  tempDir: process.env.TEMP_DIR ?? CONFIG_DEFAULTS.TEMP_DIR,
}))
