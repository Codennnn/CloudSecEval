import mitt from 'mitt'

import { isCrowdTest } from '~/utils/platform'

const SITE_DESCRIPTION = isCrowdTest() ? '网安攻防演练平台，助力网络安全建设。' : 'NestJS 中文文档，高质量的中文翻译版本，精准还原官方内容，助力中文开发者轻松掌握高效、可靠且可扩展的 Node.js 框架。'

// 网站配置常量
export const SITE_CONFIG = {
  // 基础 URL
  baseUrl: 'https://nestjs.leoku.dev',

  // 网站信息
  name: 'NestJS 中文文档',
  title: 'NestJS - 渐进式 Node.js 框架',
  description: SITE_DESCRIPTION,

  adminTitle: isCrowdTest() ? '网安攻防演练平台' : 'NestJS 文档管理后台',

  // 作者和发布者信息
  author: 'NestJS 中文文档团队',
  publisher: 'NestJS 中文文档',

  // 相关链接
  englishDocsUrl: 'https://docs.nestjs.com',
  logoPath: isCrowdTest() ? '/logos/crowd-test/logo.webp' : '/logos/logo-128.png',
  appTouchIconPath: isCrowdTest() ? '/logos/crowd-test/logo.webp' : '/logos/apple-touch-icon.png',
  manifestPath: '/manifest.json',

  og: {
    img: 'https://cdn.jsdelivr.net/gh/Codennnn/assets@main/i/og/nestjs-docs.png',
    description: SITE_DESCRIPTION,
  },

  // 语言配置`
  locale: 'zh-CN',
  language: 'zh_CN',
} as const

export const enum EVENT_KEY {
  REFRESH_TABLE = 'refresh_table',
}

/**
 * 全局事件发射器，用于在组件之间传递事件
 */
export const emitter = mitt()
