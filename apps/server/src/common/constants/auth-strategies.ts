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
} as const

/** 认证策略名称类型 */
export type AuthStrategy = typeof AUTH_STRATEGIES[keyof typeof AUTH_STRATEGIES]
