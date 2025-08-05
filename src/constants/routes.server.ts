/**
 * 服务端专用路由常量定义
 * 仅在服务端代码（middleware、API routes、服务端组件）中使用
 * 不会被打包到前端，确保敏感路由路径的安全性
 */

/**
 * 管理后台相关路由（敏感信息）
 * 这些路径不应暴露到前端代码中
 */
export const ADMIN_ROUTES = {
  /** 管理后台根路径 */
  ROOT: '/admini',
  /** 管理后台登录页面 */
  LOGIN: '/admini/login',
  /** 管理后台仪表板 */
  DASHBOARD: '/admini/dashboard',
  /** 用户管理 */
  USERS: '/admini/users',
} as const

/**
 * 静态资源相关路由（服务端处理）
 */
export const ASSET_ROUTES = {
  /** 静态资源根路径 */
  ROOT: '/assets',
  /** 防盗链警告图片 */
  HOTLINK_WARNING: '/assets/hotlink-warning.png',
} as const

/**
 * API 相关路由
 */
export const API_ROUTES = {
  /** API 根路径 */
  ROOT: '/api',
} as const

/**
 * Next.js 系统路由
 */
export const SYSTEM_ROUTES = {
  /** Next.js 静态资源 */
  NEXT_STATIC: '/_next/static',
  /** Next.js 图片优化 */
  NEXT_IMAGE: '/_next/image',
  /** 网站图标 */
  FAVICON: '/favicon.ico',
} as const

/**
 * 路由匹配模式（用于 middleware 配置）
 */
export const ROUTE_PATTERNS = {
  /** 管理后台路径模式 */
  ADMIN: '/admini/:path*',
  /** 静态资源路径模式 */
  ASSETS: '/assets/:path*',
  /** 排除系统路由的页面路径模式 */
  PAGES: '/((?!api|_next/static|_next/image|favicon.ico).*)',
} as const

/**
 * 受保护的文件扩展名匹配模式
 */
export const PROTECTED_FILE_EXTENSIONS = /\.(jpg|jpeg|png|gif|bmp|ico|svg|webp)$/i

/**
 * 搜索引擎爬虫用户代理匹配模式
 */
export const SEARCH_BOT_PATTERN = /googlebot|bingbot|baiduspider|yandexbot|duckduckbot/i

/**
 * 允许的域名列表（防盗链配置）
 */
export const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'nestjs.leoku.dev',

  // 搜索引擎
  'google.com',
  'bing.com',
  'baidu.com',
  'yandex.com',
  'duckduckgo.com',

  // 社交媒体
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'weibo.com',
  'zhihu.com',
] as const
