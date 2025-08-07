/**
 * 服务端专用路由常量定义
 * 仅在服务端代码（middleware、API routes、服务端组件）中使用
 * 不会被打包到前端，确保敏感路由路径的安全性
 */

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
