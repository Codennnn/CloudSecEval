import { type NextRequest, NextResponse } from 'next/server'

import {
  ADMIN_ROUTES,
  ALLOWED_DOMAINS,
  ASSET_ROUTES,
  PROTECTED_FILE_EXTENSIONS,
  ROUTE_PATTERNS,
  SEARCH_BOT_PATTERN,
} from '~/constants/routes.server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 管理后台路由访问控制
  // 检查是否访问管理后台相关页面
  if (pathname.startsWith(ADMIN_ROUTES.ROOT)) {
    // 从 Cookie 中获取访问令牌
    const token = request.cookies.get('access_token')?.value

    // 如果没有访问令牌，说明用户未登录
    if (!token) {
      const isLoginPage = pathname.startsWith(ADMIN_ROUTES.LOGIN)

      // 如果当前访问的不是登录页面，则重定向到登录页面
      // 避免登录页面本身也被重定向，造成无限循环
      if (!isLoginPage) {
        return NextResponse.redirect(new URL(ADMIN_ROUTES.LOGIN, request.url))
      }
    }
  }

  // 只对 /assets 路径下的静态资源进行防盗链检查
  if (pathname.startsWith(ASSET_ROUTES.ROOT + '/')) {
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')
    const userAgent = request.headers.get('user-agent') ?? ''

    // 使用服务端配置的允许域名列表
    const allowedDomains = ALLOWED_DOMAINS

    // 检查是否为受保护的媒体文件
    const isProtectedFile = PROTECTED_FILE_EXTENSIONS.test(request.nextUrl.pathname)

    if (isProtectedFile) {
      // 允许空 referer（直接访问）
      if (!referer) {
        return NextResponse.next()
      }

      // 检查是否为搜索引擎爬虫
      const isSearchBot = SEARCH_BOT_PATTERN.test(userAgent)

      if (isSearchBot) {
        return NextResponse.next()
      }

      // 检查 referer 是否来自允许的域名
      const isAllowedReferer = allowedDomains.some((domain) => {
        try {
          const refererUrl = new URL(referer)

          return refererUrl.hostname.includes(domain)
            || refererUrl.hostname.endsWith(`.${domain}`)
            || domain.includes(refererUrl.hostname)
        }
        catch {
          return false
        }
      })

      // 检查当前主机是否在允许列表中
      const isAllowedHost = host && allowedDomains.some((domain) =>
        host.includes(domain) || domain.includes(host),
      )

      if (!isAllowedReferer && !isAllowedHost) {
        console.warn('🚫 Blocked hotlink attempt:', {
          path: request.nextUrl.pathname,
          referer,
          userAgent: userAgent.substring(0, 100),
          timestamp: new Date().toISOString(),
        })

        // 返回防盗链警告图片
        return NextResponse.redirect(new URL(ASSET_ROUTES.HOTLINK_WARNING, request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 静态资源路径：匹配 /assets/ 下的所有文件和子目录
    // 例如：/assets/images/logo.png, /assets/css/style.css
    ROUTE_PATTERNS.ASSETS,

    // 应用页面路径：匹配除以下路径外的所有页面请求
    // 排除：API 接口(/api/*)、Next.js 静态资源(_next/*)、网站图标(favicon.ico)
    // 包含：所有文档页面、首页等用户访问的页面路由
    ROUTE_PATTERNS.PAGES,
  ],
}
