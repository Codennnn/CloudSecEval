import { type NextRequest, NextResponse } from 'next/server'
import { consola } from 'consola'

import {
  ALLOWED_DOMAINS,
  ASSET_ROUTES,
  PROTECTED_FILE_EXTENSIONS,
  SEARCH_BOT_PATTERN,
} from '~/constants/routes.server'

import { AdminRoutes } from '~admin/lib/admin-nav'

/**
   * 处理管理后台路由的访问控制逻辑
   * @param request - Next.js 请求对象
   * @param pathname - 当前访问路径
   * @returns 重定向响应或 undefined（继续处理）
   */
function handleAdminRoutes(request: NextRequest, pathname: string) {
  const token = request.cookies.get('access_token')?.value
  const hasLogin = !!token
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  const isRootPath = pathname === AdminRoutes.Root

  // 情况1：访问管理后台根路径，根据登录状态重定向
  if (isRootPath) {
    const targetRoute = hasLogin ? AdminRoutes.Dashboard : AdminRoutes.Login

    return NextResponse.redirect(new URL(targetRoute, request.url))
  }

  const isLoginPage = pathname.startsWith(AdminRoutes.Login)

  // 情况2：已登录用户访问登录页，重定向到仪表板
  if (hasLogin && isLoginPage) {
    return NextResponse.redirect(new URL(AdminRoutes.Dashboard, request.url))
  }

  // 情况3：未登录用户访问非登录页面，重定向到登录页
  if (!hasLogin && !isLoginPage) {
    return NextResponse.redirect(new URL(AdminRoutes.Login, request.url))
  }

  // 其他情况：允许继续访问（已登录访问其他页面，或未登录访问登录页）
  return NextResponse.next()
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 管理后台路由访问控制
  if (pathname.startsWith(AdminRoutes.Root)) {
    return handleAdminRoutes(request, pathname)
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
        consola.warn('🚫 Blocked hotlink attempt:', {
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
    '/assets/:path*',

    // 应用页面路径：匹配除以下路径外的所有页面请求
    // 排除：API 接口(/api/*)、Next.js 静态资源(_next/*)、网站图标(favicon.ico)
    // 包含：所有文档页面、首页等用户访问的页面路由
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
