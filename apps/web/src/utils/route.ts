/**
 * 检查给定路径是否匹配路由模式
 * 支持动态路由参数（如 [id]）
 */
export function isRouteMatch(pathname: string, routePattern: string): boolean {
  // 如果路由模式不包含动态参数，使用简单的 startsWith 匹配
  if (!routePattern.includes('[')) {
    return pathname.startsWith(routePattern)
  }

  // 将路由模式转换为正则表达式
  // 将 [param] 替换为 ([^/]+) 来匹配任意非斜杠字符
  const regexPattern = routePattern
    .replace(/\[([^\]]+)\]/g, '([^/]+)')
    .replace(/\//g, '\\/')

  // 创建正则表达式，确保匹配完整路径或路径前缀
  const regex = new RegExp(`^${regexPattern}(?:/.*)?$`)

  return regex.test(pathname)
}
