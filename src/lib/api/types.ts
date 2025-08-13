import type { LicenseControllerGetLicenseListResponses, PaginationMetaDto, StandardResponseDto, UsersControllerCreateResponses } from '~api/types.gen'

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
export type User = NonNullable<UsersControllerCreateResponses['200']>['data']

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
 * 授权码信息接口
 */
export interface License {
  id: string
  code: string
  email: string
  purchaseAmount: number
  remark?: string
  status: 'active' | 'inactive' | 'expired'
  type?: string
  description?: string
  expiresAt?: string
  createdAt?: string
  updatedAt?: string
  userId?: string
}

/**
 * 授权码查询参数
 */
export interface LicenseQueryParams {
  page: number
  pageSize: number
  status?: 'active' | 'inactive' | 'expired'
  type?: string
  userId?: string
}

/**
 * 创建授权码请求 DTO（用于表单提交）
 */
export type CreateLicenseDto = Pick<License, 'email' | 'purchaseAmount' | 'remark' | 'expiresAt'>

/**
 * 更新授权码 DTO
 */
export type UpdateLicenseDto = Pick<License, 'status' | 'description' | 'expiresAt'>

/**
 * 通用列表响应接口
 */
export interface ListResponse<T = unknown> {
  code: number
  message: string
  data: T[]
  pagination: PaginationMetaDto
}
