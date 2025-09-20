import { z } from 'zod'

import { CONFIG_DEFAULTS, VALID_ENVIRONMENTS } from './defaults'

export const validationSchema = z.object({
  NODE_ENV: z.enum(VALID_ENVIRONMENTS).default(CONFIG_DEFAULTS.NODE_ENV),
  PORT: z.coerce.number().default(CONFIG_DEFAULTS.PORT),
  API_PREFIX: z.string().default(CONFIG_DEFAULTS.API_PREFIX),

  // CORS 配置
  CORS_ORIGIN: z.string().optional(),
  CORS_CREDENTIALS: z.string().optional(),

  // 数据库配置
  DATABASE_URL: z.string().min(1, '数据库连接字符串不能为空'),

  // JWT 配置
  JWT_SECRET: z.string().min(1, 'JWT密钥不能为空'),
  JWT_EXPIRES_IN: z.string().default(CONFIG_DEFAULTS.JWT_EXPIRES_IN),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default(CONFIG_DEFAULTS.JWT_REFRESH_EXPIRES_IN),

  // 管理员配置
  ADMIN_EMAIL: z.email('管理员邮箱格式不正确').default(CONFIG_DEFAULTS.ADMIN_EMAIL),
  ADMIN_PASSWORD: z.string().min(6, '管理员密码至少需要6个字符').default(CONFIG_DEFAULTS.ADMIN_PASSWORD),
  ADMIN_NAME: z.string().default(CONFIG_DEFAULTS.ADMIN_NAME),

  // 时区配置（可选）
  TIMEZONE: z.string().default(CONFIG_DEFAULTS.TIMEZONE),
})

export type ValidationSchema = z.infer<typeof validationSchema>
