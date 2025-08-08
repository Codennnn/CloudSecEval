/**
 * API 端点配置
 * 统一管理所有 API 端点，便于维护和更新
 */

// ==================== 具体业务端点定义区域 ====================

/**
 * 认证相关端点
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
} as const

/**
 * 用户相关端点
 */
export const USER_ENDPOINTS = {
  LIST: '/users',
  DETAIL: (id: string) => `/users/${id}`,
  CREATE: '/users',
  UPDATE: (id: string) => `/users/${id}`,
  DELETE: (id: string) => `/users/${id}`,
  CURRENT: '/users/me',
} as const

/**
 * 授权码相关端点
 */
export const LICENSE_ENDPOINTS = {
  LIST: '/license',
  DETAIL: (id: string) => `/license/${id}`,
  CREATE: '/license',
  UPDATE: (id: string) => `/license/${id}`,
  DELETE: (id: string) => `/license/${id}`,
} as const

// 示例：
// export const DOCUMENT_ENDPOINTS = {
//   LIST: '/documents',
//   DETAIL: (id: string) => `/documents/${id}`,
//   BY_SLUG: (slug: string) => `/documents/slug/${slug}`,
//   CREATE: '/documents',
//   UPDATE: (id: string) => `/documents/${id}`,
//   DELETE: (id: string) => `/documents/${id}`,
// } as const

// ==================== 端点集合 ====================
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  LICENSE: LICENSE_ENDPOINTS,
  // ... 其他端点
} as const

// ==================== 类型定义 ====================

/**
 * 端点路径类型
 */
export type EndpointPath = string | ((id: string) => string)

/**
 * 构建完整的 API 端点 URL
 * @param endpoint - 端点路径
 * @param params - 路径参数
 * @returns 完整的 API URL
 */
export function buildApiUrl(
  endpoint: EndpointPath,
  params?: string | Record<string, string>,
): string {
  let path: string

  if (typeof endpoint === 'function') {
    if (typeof params === 'string') {
      path = endpoint(params)
    }
    else {
      throw new Error('Function endpoint requires string parameter')
    }
  }
  else {
    path = endpoint
  }

  // 确保路径以 / 开头
  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  return path
}

// ==================== 端点工具函数 ====================

/**
 * 认证端点工具函数
 */
export const authEndpoints = {
  login: () => buildApiUrl(AUTH_ENDPOINTS.LOGIN),
  logout: () => buildApiUrl(AUTH_ENDPOINTS.LOGOUT),
  profile: () => buildApiUrl(AUTH_ENDPOINTS.PROFILE),
} as const

/**
 * 用户端点工具函数
 */
export const userEndpoints = {
  list: () => buildApiUrl(USER_ENDPOINTS.LIST),
  detail: (id: string) => buildApiUrl(USER_ENDPOINTS.DETAIL, id),
  create: () => buildApiUrl(USER_ENDPOINTS.CREATE),
  update: (id: string) => buildApiUrl(USER_ENDPOINTS.UPDATE, id),
  delete: (id: string) => buildApiUrl(USER_ENDPOINTS.DELETE, id),
  current: () => buildApiUrl(USER_ENDPOINTS.CURRENT),
} as const

/**
 * 授权码端点工具函数
 */
export const licenseEndpoints = {
  list: () => buildApiUrl(LICENSE_ENDPOINTS.LIST),
  detail: (id: string) => buildApiUrl(LICENSE_ENDPOINTS.DETAIL, id),
  create: () => buildApiUrl(LICENSE_ENDPOINTS.CREATE),
  update: (id: string) => buildApiUrl(LICENSE_ENDPOINTS.UPDATE, id),
  delete: (id: string) => buildApiUrl(LICENSE_ENDPOINTS.DELETE, id),
} as const
