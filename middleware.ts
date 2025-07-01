import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 只对 /assets 路径下的静态资源进行防盗链检查
  if (request.nextUrl.pathname.startsWith('/assets/')) {
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')
    const userAgent = request.headers.get('user-agent') ?? ''

    // 允许的域名列表（请根据你的实际域名修改）
    const allowedDomains = [
      'localhost',
      '127.0.0.1',
      'nestjs.leoku.dev',

      // 允许主要搜索引擎
      'google.com',
      'bing.com',
      'baidu.com',
      'yandex.com',
      'duckduckgo.com',

      // 允许主要社交媒体（用于分享）
      'facebook.com',
      'twitter.com',
      'linkedin.com',
      'weibo.com',
      'zhihu.com',
    ]

    // 检查是否为受保护的媒体文件
    const isProtectedFile = /\.(jpg|jpeg|png|gif|bmp|ico|svg|webp)$/i.test(request.nextUrl.pathname)

    if (isProtectedFile) {
      // 允许空 referer（直接访问）
      if (!referer) {
        return NextResponse.next()
      }

      // 检查是否为搜索引擎爬虫
      const isSearchBot = /googlebot|bingbot|baiduspider|yandexbot|duckduckbot/i.test(userAgent)

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
        return NextResponse.redirect(new URL('/assets/hotlink-warning.png', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 匹配所有 assets 路径下的文件
    '/assets/:path*',
    // 排除 API 路由和 Next.js 内部路径
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
