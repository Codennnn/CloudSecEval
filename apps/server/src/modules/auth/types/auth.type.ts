/**
 * JWT 载荷基础信息接口
 * 用于创建 JWT token 时的数据结构
 */
export interface JwtPayloadData {
  /** 用户ID (subject) */
  sub: string
  /** 用户邮箱 */
  email: string
}

/**
 * 完整的 JWT 载荷接口
 * 包含 JWT 标准字段和自定义字段
 */
export interface JwtPayload extends JwtPayloadData {
  /** 签发时间 (issued at) */
  iat: number
  /** 过期时间 (expiration time) */
  exp: number
}

/**
 * Passport 验证错误类型
 *
 * 用于在认证守卫中处理 Passport 策略返回的错误信息
 */
export interface AuthError extends Error {
  /** 错误状态码 */
  status?: number
  /** 错误消息 */
  message: string
}
