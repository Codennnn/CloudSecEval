'use client'

import { useState } from 'react'

import { QueryClient, type QueryClientConfig, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { API_CONFIG, isDevtoolsEnabled } from '~/lib/api/config'

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // 数据保持新鲜的时间
      staleTime: API_CONFIG.staleTime,
      // 缓存时间
      gcTime: API_CONFIG.cacheTime,
      // 全局不进行失败重试；在具体查询中按需设置 retry
      retry: false,
      // 窗口重新获得焦点时重新获取数据
      refetchOnWindowFocus: false,
      // 网络重连时重新获取数据
      refetchOnReconnect: true,
      // 组件挂载时重新获取数据
      refetchOnMount: true,
    },
    mutations: {
      // 全局不进行失败重试；在具体变更中按需设置 retry
      retry: false,
    },
  },
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
 */
export function QueryProvider(props: React.PropsWithChildren) {
  const { children } = props

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
