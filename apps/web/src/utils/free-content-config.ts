/**
 * 免费内容配置
 * 定义哪些文档路径可以免费访问，其他所有路径都需要付费
 */

import { isDevelopment } from './platform'

/**
 * 免费访问的文档路径列表
 * 这些路径不需要付费即可访问
 */
const FREE_CONTENT_PATHS = [
  // 基础入门内容
  'introduction',
  'first-steps',

  // 核心概念（部分免费）
  'controllers',
  'providers',
  'modules',

  // 社区帮助
  'support',

  // 发现页面
  'discover/companies',
]

/**
 * 检查当前文档路径是否为免费内容
 * @param docPath 文档路径，如 'controllers' 或 'fundamentals/dependency-injection'
 * @returns true 表示免费内容，false 表示需要付费
 */
export function isFreeContent(docPath: string): boolean {
  if (isDevelopment()) {
    return true
  }

  return FREE_CONTENT_PATHS.some((freePath) => {
    // 精确匹配
    if (docPath === freePath) {
      return true
    }

    // 前缀匹配（支持目录级别的免费内容）
    if (docPath.startsWith(`/${freePath}`)) {
      return true
    }

    return false
  })
}

/**
 * 检查当前文档路径是否需要付费
 * @param docPath 文档路径
 * @returns true 表示需要付费，false 表示免费
 */
export function isPaidContent(docPath: string): boolean {
  return !isFreeContent(docPath)
}

/**
 * 获取所有免费内容路径（用于调试或管理）
 */
export function getFreeContentPaths(): readonly string[] {
  return FREE_CONTENT_PATHS
}
