// ==================== 通用 API 类型定义 ====================

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  limit?: number
  offset?: number
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 搜索参数
 */
export interface SearchParams {
  q?: string
  keyword?: string
  search?: string
}

/**
 * 过滤参数基础接口
 */
export type FilterParams = Record<string, unknown>

/**
 * 通用查询参数
 */
export interface QueryParams extends
  PaginationParams,
  SortParams,
  SearchParams,
  FilterParams {}

/**
 * 分页响应数据
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * 通用 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  data: T
  success: boolean
  message?: string
  code?: number | string
  timestamp?: string
}

/**
 * API 错误响应格式
 */
export interface ApiErrorResponse {
  success: false
  message: string
  code?: number | string
  errors?: {
    field: string
    message: string
  }[]
  timestamp?: string
}

// ==================== 用户和认证相关类型 ====================

/**
 * 用户信息接口
 */
export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  phone?: string
  createdAt?: string
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
 * 登录请求 DTO
 */
export interface LoginDto {
  email: string
  password: string
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
