/**
 * API 端点配置
 * 统一管理所有 API 端点，便于维护和更新
 */

// ==================== 基础配置 ====================

/**
 * API 版本
 */
export const API_VERSION = 'v1'

/**
 * API 基础路径
 */
export const API_BASE_PATH = `/api/${API_VERSION}`

// ==================== 具体业务端点定义区域 ====================
// 在这里定义您的具体业务端点

// 示例：
// export const USER_ENDPOINTS = {
//   LIST: '/users',
//   DETAIL: (id: string) => `/users/${id}`,
//   CREATE: '/users',
//   UPDATE: (id: string) => `/users/${id}`,
//   DELETE: (id: string) => `/users/${id}`,
// } as const

// export const DOCUMENT_ENDPOINTS = {
//   LIST: '/documents',
//   DETAIL: (id: string) => `/documents/${id}`,
//   BY_SLUG: (slug: string) => `/documents/slug/${slug}`,
//   CREATE: '/documents',
//   UPDATE: (id: string) => `/documents/${id}`,
//   DELETE: (id: string) => `/documents/${id}`,
// } as const

// ==================== 端点集合 ====================
// export const API_ENDPOINTS = {
//   USER: USER_ENDPOINTS,
//   DOCUMENT: DOCUMENT_ENDPOINTS,
//   // ... 其他端点
// } as const

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
// 在这里定义您的端点工具函数

// 示例：
// export const getUserEndpoint = {
//   list: () => buildApiUrl(USER_ENDPOINTS.LIST),
//   detail: (id: string) => buildApiUrl(USER_ENDPOINTS.DETAIL, id),
// }
