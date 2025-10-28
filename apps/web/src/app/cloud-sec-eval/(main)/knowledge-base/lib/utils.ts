import {
  type Document,
  type DocumentCategory,
  type DocumentFilter,
  type DocumentStatistics,
  type DocumentTag,
  type DocumentTreeNode,
  DocumentType, type SortBy,
  type SortOrder } from '../types'

/**
 * 搜索文档
 * @param documents 文档列表
 * @param keyword 搜索关键词
 * @returns 匹配的文档列表
 */
export function searchDocuments(documents: Document[], keyword: string): Document[] {
  if (!keyword.trim()) {
    return documents
  }

  const lowerKeyword = keyword.toLowerCase()

  return documents.filter((doc) => {
    return (
      doc.name.toLowerCase().includes(lowerKeyword)
      || doc.content.toLowerCase().includes(lowerKeyword)
      || doc.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
      || doc.summary?.toLowerCase().includes(lowerKeyword)
    )
  })
}

/**
 * 筛选文档
 * @param documents 文档列表
 * @param filter 筛选条件
 * @returns 筛选后的文档列表
 */
export function filterDocuments(documents: Document[], filter: DocumentFilter): Document[] {
  let result = [...documents]

  // 按类型筛选
  if (filter.types && filter.types.length > 0) {
    result = result.filter((doc) => filter.types!.includes(doc.type))
  }

  // 按标签筛选
  if (filter.tags && filter.tags.length > 0) {
    result = result.filter((doc) => {
      return filter.tags!.some((tag) => doc.tags.includes(tag))
    })
  }

  // 按分类筛选
  if (filter.categoryIds && filter.categoryIds.length > 0) {
    result = result.filter((doc) => {
      return doc.categoryId && filter.categoryIds!.includes(doc.categoryId)
    })
  }

  // 只显示收藏
  if (filter.onlyFavorites) {
    result = result.filter((doc) => doc.isFavorite)
  }

  // 按创建时间范围筛选
  if (filter.createdAtRange) {
    const { start, end } = filter.createdAtRange

    if (start) {
      result = result.filter((doc) => doc.createdAt >= start)
    }

    if (end) {
      result = result.filter((doc) => doc.createdAt <= end)
    }
  }

  // 按更新时间范围筛选
  if (filter.updatedAtRange) {
    const { start, end } = filter.updatedAtRange

    if (start) {
      result = result.filter((doc) => doc.updatedAt >= start)
    }

    if (end) {
      result = result.filter((doc) => doc.updatedAt <= end)
    }
  }

  return result
}

/**
 * 排序文档
 * @param documents 文档列表
 * @param sortBy 排序字段
 * @param sortOrder 排序方向
 * @returns 排序后的文档列表
 */
export function sortDocuments(
  documents: Document[],
  sortBy: SortBy,
  sortOrder: SortOrder,
): Document[] {
  const result = [...documents]

  result.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'zh-CN')
        break

      case 'createdAt':
        comparison = a.createdAt - b.createdAt
        break

      case 'updatedAt':
        comparison = a.updatedAt - b.updatedAt
        break

      case 'viewCount':
        comparison = a.viewCount - b.viewCount
        break

      case 'lastViewedAt':
        comparison = (a.lastViewedAt ?? 0) - (b.lastViewedAt ?? 0)
        break

      default:
        comparison = 0
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  return result
}

/**
 * 构建文档树
 * @param documents 文档列表
 * @param categories 分类列表
 * @returns 文档树节点列表
 */
export function buildDocumentTree(
  documents: Document[],
  categories: DocumentCategory[],
): DocumentTreeNode[] {
  const tree: DocumentTreeNode[] = []

  // 创建分类节点映射
  const categoryMap = new Map<string, DocumentTreeNode>()

  // 创建分类节点
  categories.forEach((category) => {
    const node: DocumentTreeNode = {
      id: category.id,
      name: category.name,
      type: 'folder',
      children: [],
      parentId: category.parentId,
    }
    categoryMap.set(category.id, node)
  })

  // 构建分类树结构
  categoryMap.forEach((node) => {
    if (node.parentId) {
      const parent = categoryMap.get(node.parentId)

      if (parent) {
        parent.children = parent.children ?? []
        parent.children.push(node)
      }
      else {
        tree.push(node)
      }
    }
    else {
      tree.push(node)
    }
  })

  // 添加文档到对应分类
  documents.forEach((doc) => {
    const docNode: DocumentTreeNode = {
      id: doc.id,
      name: doc.name,
      type: 'document',
      document: doc,
      parentId: doc.categoryId,
    }

    if (doc.categoryId) {
      const category = categoryMap.get(doc.categoryId)

      if (category) {
        category.children = category.children ?? []
        category.children.push(docNode)
      }
      else {
        tree.push(docNode)
      }
    }
    else {
      tree.push(docNode)
    }
  })

  return tree
}

/**
 * 计算文档统计信息
 * @param documents 文档列表
 * @param categories 分类列表
 * @param tags 标签列表
 * @returns 统计信息
 */
export function calculateStatistics(
  documents: Document[],
  categories: DocumentCategory[],
  tags: DocumentTag[],
): DocumentStatistics {
  const documentsByType: Record<DocumentType, number> = {
    [DocumentType.Markdown]: 0,
    [DocumentType.Text]: 0,
    [DocumentType.PDF]: 0,
  }

  const documentsByCategory: Record<string, number> = {}

  documents.forEach((doc) => {
    documentsByType[doc.type]++

    if (doc.categoryId) {
      documentsByCategory[doc.categoryId] = (documentsByCategory[doc.categoryId] ?? 0) + 1
    }
  })

  const favoriteDocuments = documents.filter((doc) => doc.isFavorite).length

  const mostViewedDocuments = [...documents]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5)

  const recentlyViewedDocuments = [...documents]
    .filter((doc) => doc.lastViewedAt)
    .sort((a, b) => (b.lastViewedAt ?? 0) - (a.lastViewedAt ?? 0))
    .slice(0, 5)

  const recentlyCreatedDocuments = [...documents]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  return {
    totalDocuments: documents.length,
    totalCategories: categories.length,
    totalTags: tags.length,
    favoriteDocuments,
    documentsByType,
    documentsByCategory,
    mostViewedDocuments,
    recentlyViewedDocuments,
    recentlyCreatedDocuments,
  }
}

/**
 * 高亮搜索关键词
 * @param text 原始文本
 * @param keyword 搜索关键词
 * @returns 高亮后的 HTML 字符串
 */
export function highlightKeyword(text: string, keyword: string): string {
  if (!keyword.trim()) {
    return text
  }

  const regex = new RegExp(`(${keyword})`, 'gi')

  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}

/**
 * 提取文档摘要
 * @param content 文档内容
 * @param maxLength 最大长度
 * @returns 摘要文本
 */
export function extractSummary(content: string, maxLength = 200): string {
  // 移除 Markdown 标记
  const plainText = content
    .replace(/^#+\s+/gm, '') // 移除标题标记
    .replace(/\*\*(.+?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.+?)\*/g, '$1') // 移除斜体标记
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 移除链接标记
    .replace(/`(.+?)`/g, '$1') // 移除代码标记
    .replace(/\n+/g, ' ') // 替换换行为空格
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return `${plainText.substring(0, maxLength)}...`
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B'
  }

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化日期
 * @param timestamp 时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于 1 分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 小于 1 小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))

    return `${minutes} 分钟前`
  }

  // 小于 1 天
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))

    return `${hours} 小时前`
  }

  // 小于 7 天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))

    return `${days} 天前`
  }

  // 格式化为日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * 生成智能标签建议
 * @param documentName 文档名称
 * @param existingTags 已有标签列表
 * @returns 建议的标签列表
 */
export function suggestTags(documentName: string, existingTags: DocumentTag[]): string[] {
  const suggestions: string[] = []

  const keywords = [
    { pattern: /网络安全|网安|cybersecurity/i, tag: '网络安全' },
    { pattern: /数据保护|数据安全|data protection/i, tag: '数据保护' },
    { pattern: /隐私|privacy|个人信息/i, tag: '隐私合规' },
    { pattern: /等级保护|等保/i, tag: '等级保护' },
    { pattern: /ISO.*27001|信息安全管理/i, tag: 'ISO27001' },
    { pattern: /GDPR|通用数据保护/i, tag: 'GDPR' },
    { pattern: /云计算|云安全|cloud/i, tag: '云安全' },
    { pattern: /合规|compliance/i, tag: '合规管理' },
    { pattern: /风险|risk/i, tag: '风险管理' },
    { pattern: /审计|audit/i, tag: '安全审计' },
  ]

  keywords.forEach(({ pattern, tag }) => {
    if (pattern.test(documentName) && !suggestions.includes(tag)) {
      suggestions.push(tag)
    }
  })

  return suggestions
}
