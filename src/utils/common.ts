export function getPageTitle(title?: string): string {
  const mainTitle = 'NestJS - 渐进式 Node.js 框架'

  return title ? `${title} | ${mainTitle}` : mainTitle
}
