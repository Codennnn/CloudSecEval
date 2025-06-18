export const enum RoutePath {
  Docs = '/docs',
}

// 网站配置常量
export const SITE_CONFIG = {
  // 基础 URL - 这是唯一需要修改的地方
  baseUrl: 'https://nestjs-docs-cn.leoku.dev',

  // 网站信息
  name: 'NestJS 中文文档',
  title: 'NestJS 中文文档 - 渐进式 Node.js 框架',
  description: 'NestJS 中文文档 - 用于构建高效、可靠和可扩展的服务端应用程序的渐进式 Node.js 框架',

  // 作者和发布者信息
  author: 'NestJS 中文文档团队',
  publisher: 'NestJS 中文文档',

  // 相关链接
  englishDocsUrl: 'https://docs.nestjs.com',
  logoPath: '/logos/logo-128.png',
  manifestPath: '/manifest.json',

  // 语言配置
  locale: 'zh-CN',
  language: 'zh_CN',
} as const

// 辅助函数：生成完整 URL
export const getFullUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${SITE_CONFIG.baseUrl}${cleanPath}`
}

// 辅助函数：生成文档 URL
export const getDocsUrl = (docPath = '') => {
  const cleanPath = docPath.startsWith('/') ? docPath.slice(1) : docPath

  return getFullUrl(`/docs${cleanPath ? `/${cleanPath}` : ''}`)
}
