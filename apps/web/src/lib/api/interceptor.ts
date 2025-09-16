'use client'

import { consola } from 'consola'
import { toast } from 'sonner'

import { isLoggingEnabled } from './config'
import type { ApiResponse } from './types'

import { AdminRoutes } from '~admin/lib/admin-nav'
import { client } from '~api/client.gen'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: unknown,
  ) {
    super(message, { cause: data })

    this.name = 'ApiError'
  }
}

function redirectToLogin(): void {
  // 检查是否在客户端环境
  if (typeof window !== 'undefined') {
    const loginUrl = AdminRoutes.Login

    window.location.href = loginUrl
  }
}

function handleError(error: unknown, showError = true): void {
  // 记录错误日志（开发环境）
  if (isLoggingEnabled()) {
    consola.error('API Error:', error)
  }

  // 处理认证相关错误，重定向到登录页面
  if (error instanceof ApiError) {
    // 自定义业务码 20100（未经授权的访问）
    if (error.code === '20100') {
      redirectToLogin()

      return
    }
  }

  if (showError) {
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

async function handleResponse(response: Response) {
  const clonedResponse = response.clone()

  if (!clonedResponse.ok) {
    let errorMessage = `HTTP ${clonedResponse.status}: ${clonedResponse.statusText}`
    let errorData: unknown

    try {
      const errorResponse = await clonedResponse.json() as { message?: string }
      errorMessage = errorResponse.message ?? errorMessage
      errorData = errorResponse
    }
    catch {
      // 如果解析错误响应失败，使用默认错误信息
    }

    handleError(new ApiError(errorMessage, clonedResponse.status, undefined, errorData))
  }
  else {
    const contentType = clonedResponse.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const result = await clonedResponse.json() as ApiResponse

      // 检查自定义响应码：小于 20000 表示成功，否则为业务异常
      if (typeof result.code === 'number' && result.code >= 20000) {
        const errorMessage = result.message ?? '业务处理异常'

        handleError(
          new ApiError(errorMessage, clonedResponse.status, result.code.toString(), result),
        )
      }
    }
  }

  return response
}

client.interceptors.response.use(
  (response) => {
    return handleResponse(response)
  },
)
