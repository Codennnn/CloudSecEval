import { isDevelopment } from '~/utils/platform'

interface ApiConfig {
  /** API 基础 URL */
  baseUrl: string
  /** 请求超时时间（毫秒） */
  timeout: number
  /** 失败重试次数 */
  retries: number
  /** 重试延迟时间（毫秒） */
  retryDelay: number
  /** 最大重试延迟时间（毫秒） */
  maxRetryDelay: number
  /** 是否启用开发工具 */
  enableDevtools: boolean
  /** 是否启用日志 */
  enableLogging: boolean
  /** 是否启用缓存 */
  enableCache: boolean
  /** 缓存时间（毫秒） */
  cacheTime: number
  /** 数据新鲜度时间（毫秒） */
  staleTime: number
}

/**
 * 统一的 API 配置
 * 可通过环境变量进行覆盖
 */
export const API_CONFIG: ApiConfig = {
  baseUrl:
    process.env.NEXT_PUBLIC_API_PROXY_SOURCE
    ?? process.env.NEXT_PUBLIC_API_BASE_URL
    ?? '',
  timeout: 10 * 1000,
  retries: 3,
  retryDelay: 1000,
  maxRetryDelay: 30 * 1000,
  enableDevtools: false,
  // enableDevtools: isDevelopment(),
  enableLogging: isDevelopment(),
  enableCache: true,
  cacheTime: 30 * 60 * 1000,
  staleTime: 5 * 60 * 1000,
}

// ==================== MARK: 配置工具函数 ====================

/**
 * 是否启用开发工具
 */
export const isDevtoolsEnabled = () => API_CONFIG.enableDevtools

/**
 * 是否启用日志
 */
export const isLoggingEnabled = () => API_CONFIG.enableLogging

/**
 * 是否启用缓存
 */
export const isCacheEnabled = () => API_CONFIG.enableCache

// ==================== MARK: 重试策略构造器（按需复用） ====================

/**
 * 构建查询类接口的重试策略（React Query `retry` 回调）
 * 规则：
 * - 4xx 一律不重试（典型为业务/权限错误）
 * - 网络错误与 5xx 可在上限内重试
 * - 默认最多重试 2 次
 */
export function buildQueryRetryPolicy(maxRetries = 2) {
  return function retry(failureCount: number, error: unknown): boolean {
    let shouldRetry = false

    // 提取 HTTP 状态码（兼容含有 status 字段的错误对象，例如自定义 ApiError）
    const hasStatus = typeof error === 'object' && error !== null && 'status' in (error)
    let status = 0

    if (hasStatus) {
      const maybeStatus = (error as { status?: unknown }).status

      if (typeof maybeStatus === 'number') {
        status = maybeStatus
      }
    }

    // 4xx：不重试
    if (status >= 400 && status < 500) {
      shouldRetry = false
    }
    else {
      // 网络错误或 5xx：允许重试
      let isNetworkOrServerError = false

      if (status >= 500) {
        isNetworkOrServerError = true
      }
      else if (error instanceof Error) {
        // fetch/网络相关错误：TypeError 或 AbortError（根据需要可排除 AbortError）
        if (error.name === 'TypeError') {
          isNetworkOrServerError = true
        }
      }

      shouldRetry = isNetworkOrServerError && failureCount < maxRetries
    }

    return shouldRetry
  }
}

/**
 * 构建变更类接口的重试策略（React Query `retry` 回调）
 * 建议仅对幂等操作开启重试；默认不重试。
 */
export function buildMutationRetryPolicy(maxRetries = 0) {
  return function retry(failureCount: number, error: unknown): boolean {
    let shouldRetry = false

    const hasStatus = typeof error === 'object' && error !== null && 'status' in (error)
    let status = 0

    if (hasStatus) {
      const maybeStatus = (error as { status?: unknown }).status

      if (typeof maybeStatus === 'number') {
        status = maybeStatus
      }
    }

    // 4xx：不重试，避免重复提交
    if (status >= 400 && status < 500) {
      shouldRetry = false
    }
    else {
      let isNetworkOrServerError = false

      if (status >= 500) {
        isNetworkOrServerError = true
      }
      else if (error instanceof Error) {
        if (error.name === 'TypeError') {
          isNetworkOrServerError = true
        }
      }

      shouldRetry = isNetworkOrServerError && failureCount < maxRetries
    }

    return shouldRetry
  }
}

/**
 * 指数退避重试延迟构造器（React Query `retryDelay` 回调）
 */
export function buildExponentialRetryDelay(
  baseDelay: number = API_CONFIG.retryDelay,
  maxDelay: number = API_CONFIG.maxRetryDelay,
) {
  return function retryDelay(attemptIndex: number): number {
    const delay = baseDelay * Math.pow(2, attemptIndex)

    return Math.min(delay, maxDelay)
  }
}
