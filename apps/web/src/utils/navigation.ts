'use client'

import { useEffect } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useRouter } from 'nextjs-toploader/app'

import { getDocsUrl, getFullUrl, isExternalLink } from '~/utils/link'
import { isClient } from '~/utils/platform'

type AppRouterInstance = ReturnType<typeof useRouter>

/**
 * 预加载选项接口
 */
export interface PrefetchOptions {
  /** 要预加载的路径 */
  href: string
}

/**
 * 导航选项接口
 */
export interface NavigateToOptions {
  /** 是否替换当前历史记录而不是推入新记录 */
  replace?: boolean
  /** 查询参数 */
  query?: Record<string, string | number | boolean>
  /** 锚点 */
  hash?: string
  /** 是否在新窗口/标签页中打开 */
  external?: boolean
  /** 滚动行为 */
  scroll?: boolean
}

/**
 * 构建完整的 URL 地址
 * @param path - 路径
 * @param options - 导航选项
 * @returns 完整的 URL 字符串
 */
function buildUrl(path: string, options: NavigateToOptions = {}): string {
  const { query, hash } = options
  let url = path

  // 处理查询参数
  if (query && Object.keys(query).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    const queryString = searchParams.toString()
    url += (url.includes('?') ? '&' : '?') + queryString
  }

  // 处理锚点
  if (hash) {
    url += (hash.startsWith('#') ? '' : '#') + hash
  }

  return url
}

/**
 * 编程式路由导航函数（类似 Nuxt 的 navigateTo）
 * @param router - Next.js 路由实例
 * @param to - 目标路径或 URL
 * @param options - 导航选项
 */
export function navigateTo(
  router: AppRouterInstance,
  to: string,
  options: NavigateToOptions = {},
): void {
  const { replace = false, external = false, scroll = true } = options

  // 构建完整 URL
  const fullUrl = buildUrl(to, options)

  // 处理外部链接
  if (external || isExternalLink(fullUrl)) {
    if (isClient()) {
      if (external) {
        window.open(fullUrl, '_blank', 'noopener,noreferrer')
      }
      else {
        window.location.href = fullUrl
      }
    }

    return
  }

  const routerPamams = [fullUrl, { scroll }] as const

  // 处理内部路由导航
  if (replace) {
    router.replace(...routerPamams)
  }
  else {
    router.push(...routerPamams)
  }
}

/**
 * 导航到文档页面的便捷函数
 * @param router - Next.js 路由实例
 * @param docPath - 文档路径
 * @param options - 导航选项
 */
export function navigateToDoc(
  router: AppRouterInstance,
  docPath: string,
  options: NavigateToOptions = {},
): void {
  const docUrl = getDocsUrl(docPath)

  if (docUrl) {
    // 移除完整 URL 的基础部分，只保留路径
    const path = docUrl.replace(getFullUrl(), '')
    navigateTo(router, path, options)
  }
  else {
    console.warn(`无效的文档路径: ${docPath}`)
  }
}

/**
 * 导航到首页的便捷函数
 * @param router - Next.js 路由实例
 * @param options - 导航选项
 */
export function navigateToHome(
  router: AppRouterInstance,
  options: NavigateToOptions = {},
): void {
  navigateTo(router, '/', options)
}

/**
 * 返回上一页的便捷函数
 * @param router - Next.js 路由实例
 */
export function navigateBack(router: AppRouterInstance): void {
  if (isClient() && window.history.length > 1) {
    router.back()
  }
  else {
    // 如果没有历史记录，导航到首页
    navigateToHome(router)
  }
}

/**
 * 刷新当前页面的便捷函数
 * @param router - Next.js 路由实例
 */
export function navigateRefresh(router: AppRouterInstance): void {
  router.refresh()
}

/**
 * 使用导航功能的 React Hook
 * @returns 导航函数集合
 */
export function useNavigation() {
  const router = useRouter()

  const navigate = useEvent(
    (to: string, options?: NavigateToOptions) => {
      navigateTo(router, to, options)
    },
  )

  const navigateDoc = useEvent(
    (docPath: string, options?: NavigateToOptions) => {
      navigateToDoc(router, docPath, options)
    },
  )

  const navigateHome = useEvent(
    (options?: NavigateToOptions) => {
      navigateToHome(router, options)
    },
  )

  const navigateBack = useEvent(() => {
    if (isClient() && window.history.length > 1) {
      router.back()
    }
    else {
      navigateToHome(router)
    }
  })

  const navigateRefresh = useEvent(() => {
    router.refresh()
  })

  return {
    navigate,
    navigateDoc,
    navigateHome,
    navigateBack,
    navigateRefresh,
    router,
  }
}

/**
 * 预加载路由的函数
 * @param router - Next.js 路由实例
 * @param href - 要预加载的路径
 */
export function prefetchRoute(router: AppRouterInstance, href: string): void {
  if (!isExternalLink(href)) {
    router.prefetch(href)
  }
}

/**
 * 使用预加载功能的 React Hook
 * @param options - 可选的预加载选项，包含要自动预加载的路径
 * @returns 预加载函数
 */
export function usePrefetch(options?: PrefetchOptions) {
  const router = useRouter()

  const prefetch = useEvent(
    (href: string) => {
      prefetchRoute(router, href)
    },
  )

  // 如果传入了 options 且包含 href，自动执行 prefetch
  useEffect(() => {
    if (options?.href) {
      prefetch(options.href)
    }
  }, [options?.href, prefetch])

  return { prefetch }
}
