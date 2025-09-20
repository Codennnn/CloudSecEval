/**
 * 配置默认值常量
 * 统一管理所有配置项的默认值，确保 validation schema 和 config 文件中的默认值保持同步
 */
export const CONFIG_DEFAULTS = {
  // 应用配置
  NODE_ENV: 'development',
  PORT: 8000,
  API_PREFIX: 'api',

  // CORS 配置
  CORS_CREDENTIALS: true,

  // 管理员配置
  ADMIN_EMAIL: 'admin@example.com',
  ADMIN_PASSWORD: 'Admin@123',
  ADMIN_NAME: '系统管理员',

  // JWT 配置
  JWT_EXPIRES_IN: '1w',
  JWT_REFRESH_EXPIRES_IN: '7d',
  JWT_SECRET_FALLBACK: 'fallback-secret-key',
  JWT_REFRESH_SECRET_FALLBACK: 'fallback-refresh-secret',

  // JWT Cookie 配置
  JWT_COOKIE_NAME: 'access_token',
  JWT_COOKIE_DOMAIN: 'localhost',
  JWT_COOKIE_SECURE: false,
  JWT_COOKIE_SAME_SITE: 'lax',

  // 时区配置
  TIMEZONE: 'Asia/Shanghai',
} as const

/**
 * 环境变量有效值枚举
 */
export const VALID_ENVIRONMENTS = ['development', 'test', 'production'] as const

/**
 * 类型定义
 */
export type Environment = typeof VALID_ENVIRONMENTS[number]
