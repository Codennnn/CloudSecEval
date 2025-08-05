import { toast } from 'sonner'

import { API_CONFIG, isLoggingEnabled } from './config'

// 请求配置接口
export interface FetchConfig extends RequestInit {
  timeout?: number
  retries?: number
  showError?: boolean
}

// API 响应接口
export interface ApiResponse<T = unknown> {
  data: T
  success: boolean
  message?: string
  code?: number
}

// 错误类型定义
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 带超时控制的 fetch 函数
 * @param url 请求地址
 * @param config 请求配置
 * @returns Promise<Response>
 */
async function fetchWithTimeout(
  url: string,
  config: FetchConfig = {},
): Promise<Response> {
  const { timeout = API_CONFIG.timeout, ...fetchConfig } = config

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(url, {
      ...fetchConfig,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    return response
  }
  catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * 带重试机制的 fetch 函数
 * @param url 请求地址
 * @param config 请求配置
 * @returns Promise<Response>
 */
async function fetchWithRetry(
  url: string,
  config: FetchConfig = {},
): Promise<Response> {
  const { retries = API_CONFIG.retries, ...fetchConfig } = config

  let lastError: Error

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, fetchConfig)
    }
    catch (error) {
      lastError = error as Error

      // 如果是最后一次尝试或者是用户主动取消，直接抛出错误
      if (attempt === retries || (error instanceof Error && error.name === 'AbortError')) {
        throw error
      }

      // 指数退避策略
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * 处理响应结果
 * @param response Response 对象
 * @returns 解析后的数据
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // 检查响应状态
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let errorData: unknown

    try {
      const errorResponse = await response.json() as { message?: string }
      errorMessage = errorResponse.message ?? errorMessage
      errorData = errorResponse
    }
    catch {
      // 如果解析错误响应失败，使用默认错误信息
    }

    throw new ApiError(
      errorMessage,
      response.status,
      undefined,
      errorData,
    )
  }

  // 解析响应数据
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    const result: ApiResponse<T> = await response.json()

    // 如果后端返回的是标准格式，检查 success 字段
    if ('success' in result && !result.success) {
      throw new ApiError(
        result.message ?? '请求失败',
        response.status,
        result.code?.toString(),
        result,
      )
    }

    // 返回数据部分或整个响应
    return ('data' in result ? result.data : result)
  }
  else if (contentType?.includes('text/')) {
    return (await response.text()) as T
  }
  else {
    return (await response.blob()) as T
  }
}

/**
 * 创建完整的 URL
 * @param endpoint API 端点
 * @param baseUrl 基础 URL
 * @returns 完整的请求 URL
 */
function createUrl(endpoint: string, baseUrl = API_CONFIG.baseUrl): string {
  // 处理绝对 URL
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }

  // 确保 baseUrl 和 endpoint 正确拼接
  const trimmedBase = baseUrl.replace(/\/+$/, '')
  const trimmedEndpoint = endpoint.replace(/^\/+/, '')

  return `${trimmedBase}/${trimmedEndpoint}`
}

/**
 * 通用的 API 客户端
 */
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl = API_CONFIG.baseUrl) {
    this.baseUrl = baseUrl
  }

  /**
   * 发起 GET 请求
   * @param endpoint API 端点
   * @param config 请求配置
   * @returns Promise<T>
   */
  async get<T>(endpoint: string, config: FetchConfig = {}): Promise<T> {
    const url = createUrl(endpoint, this.baseUrl)

    try {
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers as Record<string, string>),
        },
        ...config,
      })

      return await handleResponse<T>(response)
    }
    catch (error) {
      this.handleError(error, config.showError)
      throw error
    }
  }

  /**
   * 发起 POST 请求
   * @param endpoint API 端点
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<T>
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    config: FetchConfig = {},
  ): Promise<T> {
    const url = createUrl(endpoint, this.baseUrl)

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers as Record<string, string>),
        },
        body: data ? JSON.stringify(data) : undefined,
        ...config,
      })

      return await handleResponse<T>(response)
    }
    catch (error) {
      this.handleError(error, config.showError)
      throw error
    }
  }

  /**
   * 发起 PUT 请求
   * @param endpoint API 端点
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<T>
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    config: FetchConfig = {},
  ): Promise<T> {
    const url = createUrl(endpoint, this.baseUrl)

    try {
      const response = await fetchWithRetry(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers as Record<string, string>),
        },
        body: data ? JSON.stringify(data) : undefined,
        ...config,
      })

      return await handleResponse<T>(response)
    }
    catch (error) {
      this.handleError(error, config.showError)
      throw error
    }
  }

  /**
   * 发起 DELETE 请求
   * @param endpoint API 端点
   * @param config 请求配置
   * @returns Promise<T>
   */
  async delete<T>(endpoint: string, config: FetchConfig = {}): Promise<T> {
    const url = createUrl(endpoint, this.baseUrl)

    try {
      const response = await fetchWithRetry(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers as Record<string, string>),
        },
        ...config,
      })

      return await handleResponse<T>(response)
    }
    catch (error) {
      this.handleError(error, config.showError)
      throw error
    }
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param showError 是否显示错误提示
   */
  private handleError(error: unknown, showError = true): void {
    // 记录错误日志（开发环境）
    if (isLoggingEnabled()) {
      console.error('API Error:', error)
    }

    if (!showError) {
      return
    }

    let message = '请求失败，请稍后重试'

    if (error instanceof ApiError) {
      message = error.message
    }
    else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        message = '请求超时'
      }
      else if (error.name === 'TypeError') {
        message = '网络连接失败'
      }
      else {
        message = error.message
      }
    }

    toast.error(message)
  }
}

// 创建默认的 API 客户端实例
export const apiClient = new ApiClient()

// 导出便捷方法
export const api = {
  get: <T>(endpoint: string, config?: FetchConfig) =>
    apiClient.get<T>(endpoint, config),
  post: <T>(endpoint: string, data?: unknown, config?: FetchConfig) =>
    apiClient.post<T>(endpoint, data, config),
  put: <T>(endpoint: string, data?: unknown, config?: FetchConfig) =>
    apiClient.put<T>(endpoint, data, config),
  delete: <T>(endpoint: string, config?: FetchConfig) =>
    apiClient.delete<T>(endpoint, config),
}
