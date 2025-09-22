import { isCookieEnabled } from '~/utils/platform'

import { tokenManager } from '../auth/token'

import type { Config, CreateClientConfig } from './generated/client/types.gen'

/**
 * 创建 API 客户端配置
 * 根据环境变量决定是否使用 Header Token 认证
 */
export const createClientConfig: CreateClientConfig = (config) => {
  // 基础配置
  const baseConfig = {
    ...config,
    baseUrl: process.env.NEXT_PUBLIC_API_BASE,
    credentials: isCookieEnabled() ? 'include' : 'omit',
  } satisfies Config

  // 如果 Cookie 被禁用，则添加 Authorization header
  if (!isCookieEnabled()) {
    const token = tokenManager.getAccessToken()

    if (token) {
      baseConfig.headers = Object.assign({}, baseConfig.headers, {
        Authorization: `Bearer ${token}`,
      })
    }
  }

  return baseConfig
}
