/**
 * 认证授权相关常量
 *
 * 统一管理认证策略、用户角色、权限操作等认证相关的常量定义
 */

/**
 * 认证策略名称常量
 *
 * 用于统一管理 Passport 策略名称，避免在代码中使用魔法字符串。
 * 这样可以提高代码的可维护性和类型安全性。
 */
export const AUTH_STRATEGIES = {
  /** 本地认证策略（用户名密码登录） */
  LOCAL: 'local',
  /** JWT 认证策略（Token 验证） */
  JWT: 'jwt',
  /** OAuth 认证策略 */
  OAUTH: 'oauth',
} as const

/**
 * JWT Token 类型
 */
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  VERIFY_EMAIL: 'verify_email',
} as const

// 类型定义
export type AuthStrategy = typeof AUTH_STRATEGIES[keyof typeof AUTH_STRATEGIES]
export type TokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES]
