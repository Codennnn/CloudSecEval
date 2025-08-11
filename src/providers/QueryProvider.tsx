'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { API_CONFIG, isDevtoolsEnabled } from '~/lib/api/config'

// React Query 配置
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // 数据保持新鲜的时间
      staleTime: API_CONFIG.staleTime,
      // 缓存时间
      gcTime: API_CONFIG.cacheTime,
      // 重试配置
      retry: (failureCount: number, error: unknown) => {
        // 对于 4xx 错误不重试
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number

          if (status >= 400 && status < 500) {
            return false
          }
        }

        // 最多重试次数基于配置
        return failureCount < API_CONFIG.retries
      },
      // 重试延迟（指数退避）
      retryDelay: (attemptIndex: number) =>
        Math.min(API_CONFIG.retryDelay * 2 ** attemptIndex, API_CONFIG.maxRetryDelay),
      // 窗口重新获得焦点时重新获取数据
      refetchOnWindowFocus: false,
      // 网络重连时重新获取数据
      refetchOnReconnect: true,
      // 组件挂载时重新获取数据
      refetchOnMount: true,
    },
    mutations: {
      // 变更失败时重试配置
      retry: (failureCount: number, error: unknown) => {
        // 对于 4xx 错误不重试
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number

          if (status >= 400 && status < 500) {
            return false
          }
        }

        // 最多重试 1 次
        return failureCount < 1
      },
    },
  },
} as const

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * React Query 提供者组件
 *
 * 功能特性：
 * - 统一的查询状态管理
 * - 自动缓存和数据同步
 * - 智能重试机制
 * - 开发工具支持
 * - 性能优化配置
 *
 * @param props - 组件属性
 * @returns React Query 提供者组件
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // 使用 useState 确保 QueryClient 在客户端渲染时保持稳定
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 根据配置显示 React Query 开发工具 */}
      {isDevtoolsEnabled() && (
        <ReactQueryDevtools
          buttonPosition="bottom-right"
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  )
}

/**
 * 查询键工厂函数示例
 * 您可以在具体的业务 hooks 文件中定义自己的查询键
 */
// export const queryKeys = {
//   // 示例：用户相关查询键
//   users: {
//     all: ['users'] as const,
//     lists: () => [...queryKeys.users.all, 'list'] as const,
//     list: (params?: Record<string, unknown>) =>
//       [...queryKeys.users.lists(), params] as const,
//     details: () => [...queryKeys.users.all, 'detail'] as const,
//     detail: (id: string) => [...queryKeys.users.details(), id] as const,
//   },
// } as const
