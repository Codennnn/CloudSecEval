import { RoutePath } from '~/constants'

/**
 * 判断链接是否为外部链接的函数
 *
 * @param href 链接地址
 * @returns 是否为外部链接
 */
export function isExternalLink(href: string): boolean {
  // 以 / 或 # 或 . 开头的链接一定是内部链接
  if (href.startsWith('/') || href.startsWith('#') || href.startsWith('.')) {
    return false
  }

  // 以 http:// 或 https:// 开头的链接视为外部链接
  return href.startsWith('http://') || href.startsWith('https://')
}

/**
 * 判断链接是否为内部链接的函数
 *
 * @param href 链接地址
 * @returns 是否为内部链接
 */
export function isInternalLink(href: string): boolean {
  return href.startsWith('/') || href.startsWith('#') || href.startsWith('.')
}

/**
 * 判断链接是否为锚点链接的函数
 *
 * @param href 链接地址
 * @returns 是否为锚点链接
 */
export function isHashLink(href: string): boolean {
  return href.startsWith('#')
}

/**
 * 获取文档访问链接的函数
 *
 * 统一处理内部链接和外部链接的逻辑：
 * - 外部链接：直接返回原链接
 * - 锚点链接：直接返回原链接
 * - 以 / 开头的内部链接：直接返回原链接
 * - 以 . 开头的相对链接：添加 docs 前缀
 * - 其他内部链接：添加 docs 前缀
 *
 * @param href 原始链接地址
 * @returns 最终访问链接
 */
export function getDocLinkHref(href: string): string {
  // 外部链接直接返回
  if (isExternalLink(href)) {
    return href
  }

  // 锚点链接直接返回
  if (isHashLink(href)) {
    return href
  }

  // 以 / 开头的内部链接直接返回（已经是完整路径）
  if (href.startsWith('/')) {
    return `${RoutePath.Docs}${href}`
  }

  // 以 . 开头的相对链接或其他内部链接，添加 docs 前缀
  return `${RoutePath.Docs}${href.startsWith('.') ? href : `/${href}`}`
}
