import type { LicenseControllerGetLicenseListResponses, PaginationMetaDto, StandardResponseDto, UserResponseDto } from '~/lib/api/generated/types.gen'

// ==================== 通用 API 类型定义 ====================

/**
 * 标准的 API 响应格式
 */
export interface ApiResponse<T = unknown> extends Omit<StandardResponseDto, 'data'> {
  data: T
}

// ==================== 用户和认证相关类型 ====================

/**
 * 用户信息接口
 */
export type User = UserResponseDto

/**
 * 用户列表数据类型
 */
export interface UserData {
  id: string
  email: string
  name?: string
  phone?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

/**
 * 创建用户 DTO
 */
export interface CreateUserDto {
  /**
   * 头像URL
   */
  avatarUrl?: string
  /**
   * 邮箱地址
   */
  email: string
  /**
   * 用户名
   */
  name?: string
  /**
   * 密码
   */
  password: string
  /**
   * 手机号
   */
  phone?: string
  [property: string]: unknown
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

/**
 * JWT Token 载荷
 */
export interface JwtPayload {
  sub: string
  email: string
  iat: number
  exp: number
}

// ==================== 授权码相关类型 ====================

export type LicenseData = NonNullable<LicenseControllerGetLicenseListResponses['200']['data']>[number]
export type LicenseFormData = Pick<LicenseData, 'id' | 'remark' | 'expiresAt' | 'email' | 'purchaseAmount'>

/**
 * 通用列表响应接口
 */
export interface ListResponse<T = unknown> {
  code: number
  message: string
  data: T[]
  pagination: PaginationMetaDto
}
