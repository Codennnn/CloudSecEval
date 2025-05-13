export function getPageTitle(title?: string): string {
  const mainTitle = 'NestJS - 渐进式 Node.js 框架'

  return title ? `${title} | ${mainTitle}` : mainTitle
}

/**
 * 判断链接是否为外部链接的函数
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
