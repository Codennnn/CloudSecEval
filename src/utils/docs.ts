import { readdir, stat } from 'fs/promises'
import { join } from 'path'

import { navMainData } from '~/lib/data/nav'
import type { NavMenuItem } from '~/types/nav'

/**
 * 递归获取所有 MDX 文件路径
 */
async function getAllMdxFiles(dirPath: string, basePath = ''): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await readdir(dirPath)

    for (const entry of entries) {
      if (entry.startsWith('.')) {
        continue // 跳过隐藏文件
      }

      const fullPath = join(dirPath, entry)
      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        // 递归处理子目录
        const subFiles = await getAllMdxFiles(fullPath, join(basePath, entry))
        files.push(...subFiles)
      }
      else if (entry.endsWith('.mdx')) {
        // 移除 .mdx 扩展名，构建路径
        const fileName = entry.replace('.mdx', '')
        const filePath = basePath ? join(basePath, fileName) : fileName
        files.push(filePath)
      }
    }
  }
  catch (error) {
    console.warn(`无法读取目录 ${dirPath}:`, error)
  }

  return files
}

/**
 * 获取所有文档路径，用于静态生成
 */
export async function getAllDocPaths(): Promise<string[]> {
  // 在构建时，使用项目根目录的相对路径
  const docsDir = join(process.cwd(), 'src/content/docs')

  try {
    const paths = await getAllMdxFiles(docsDir)

    // 过滤掉空路径和特殊文件
    return paths.filter((path) => path && !path.includes('test') && !path.includes('.DS_Store'))
  }
  catch (error) {
    console.error('获取文档路径失败:', error)

    // 如果获取失败，返回一些基本路径
    return [
      'introduction',
      'first-steps',
      'controllers',
      'providers',
      'modules',
    ]
  }
}

/**
 * 扁平化导航数据，获取所有文档的有序列表
 */
function flattenNavItems(items: NavMenuItem[]): { title: string, url: string }[] {
  const result: { title: string, url: string }[] = []

  for (const item of items) {
    if (item.url) {
      result.push({
        title: item.title ?? '',
        url: item.url,
      })
    }

    if (item.items) {
      result.push(...flattenNavItems(item.items))
    }
  }

  return result
}

/**
 * 获取文档导航信息（上一篇和下一篇）
 */
export function getDocNavigation(currentPath: string): {
  prev: { title: string, url: string } | null
  next: { title: string, url: string } | null
} {
  const allDocs = flattenNavItems(navMainData)

  // 确保路径以 / 开头
  const normalizedPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`

  const currentIndex = allDocs.findIndex((doc) => doc.url === normalizedPath)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  const prev = currentIndex > 0 ? allDocs[currentIndex - 1] : null
  const next = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null

  return { prev, next }
}

/**
 * 根据 URL 路径从导航数据中获取中文标题
 */
export function getDocTitleFromNav(docPath: string): string | null {
  // 确保路径以 / 开头
  const normalizedPath = docPath.startsWith('/') ? docPath : `/${docPath}`

  // 递归搜索导航项
  function findTitleInNavItems(items: NavMenuItem[]): string | null {
    for (const item of items) {
      // 检查当前项是否匹配
      if (item.url === normalizedPath) {
        return item.title ?? null
      }

      // 递归检查子项
      if (item.items) {
        const foundTitle = findTitleInNavItems(item.items)

        if (foundTitle) {
          return foundTitle
        }
      }
    }

    return null
  }

  return findTitleInNavItems(navMainData)
}

/**
 * 统一获取文档标题
 * 优先从导航数据中获取中文标题，如果找不到则使用默认格式化逻辑
 */
export function getDocTitle(docPath: string, fallbackSegments?: string[]): string {
  // 首先尝试从导航数据中获取中文标题
  const titleFromNav = getDocTitleFromNav(docPath)

  if (titleFromNav) {
    return titleFromNav
  }

  // 如果没有找到，使用默认格式化逻辑
  // 如果提供了 fallbackSegments，使用最后一个段；否则从 docPath 中提取
  const segment = fallbackSegments?.at(-1) ?? docPath.split('/').at(-1) ?? ''

  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
