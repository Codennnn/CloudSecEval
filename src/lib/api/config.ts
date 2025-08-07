/**
 * API 配置管理
 * 统一的 API 配置，支持环境变量覆盖
 */

import { isDevelopment } from '~/utils/platform'

/**
 * API 配置接口
 */
export interface ApiConfig {
  baseUrl: string
  timeout: number
  retries: number
  retryDelay: number
  maxRetryDelay: number
  enableDevtools: boolean
  enableLogging: boolean
  enableCache: boolean
  cacheTime: number
  staleTime: number
}

/**
 * 统一的 API 配置
 * 可通过环境变量进行覆盖
 */
export const API_CONFIG: ApiConfig = {
  // API 基础 URL，支持环境变量覆盖
  baseUrl: process.env.NEXT_PUBLIC_API_PROXY_SOURCE ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '',

  // 请求超时时间（毫秒）
  timeout: 10 * 1000,

  // 失败重试次数
  retries: 3,

  // 重试基础延迟时间（毫秒）
  retryDelay: 1000,

  // 最大重试延迟时间（毫秒）
  maxRetryDelay: 30 * 1000,

  // 是否启用开发工具
  enableDevtools: isDevelopment(),

  // 是否启用 API 日志
  enableLogging: isDevelopment(),

  // 是否启用缓存
  enableCache: true,

  // 缓存时间（毫秒，默认 30 分钟）
  cacheTime: 30 * 60 * 1000,

  // 数据新鲜度时间（毫秒，默认 5 分钟）
  staleTime: 5 * 60 * 1000,
}

// ==================== 配置验证 ====================

/**
 * 验证 API 配置
 * @param config - API 配置对象
 * @returns 验证结果
 */
export function validateApiConfig(config: ApiConfig): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 验证 baseUrl
  if (!config.baseUrl) {
    errors.push('baseUrl 不能为空')
  }
  else if (!config.baseUrl.startsWith('http') && !config.baseUrl.startsWith('/')) {
    errors.push('baseUrl 必须是有效的 URL 或路径')
  }

  // 验证 timeout
  if (config.timeout <= 0) {
    errors.push('timeout 必须大于 0')
  }

  // 验证 retries
  if (config.retries < 0) {
    errors.push('retries 不能小于 0')
  }

  // 验证 retryDelay
  if (config.retryDelay <= 0) {
    errors.push('retryDelay 必须大于 0')
  }

  // 验证 maxRetryDelay
  if (config.maxRetryDelay < config.retryDelay) {
    errors.push('maxRetryDelay 不能小于 retryDelay')
  }

  // 验证缓存时间
  if (config.cacheTime <= 0) {
    errors.push('cacheTime 必须大于 0')
  }

  if (config.staleTime < 0) {
    errors.push('staleTime 不能小于 0')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ==================== 配置工具函数 ====================

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
