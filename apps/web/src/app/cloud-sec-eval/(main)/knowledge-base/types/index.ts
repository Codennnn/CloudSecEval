/**
 * 文档类型枚举
 */
export enum DocumentType {
  Markdown = 'markdown',
  Text = 'text',
  PDF = 'pdf',
}

/**
 * 文档接口定义
 */
export interface Document {
  /** 文档唯一标识 */
  id: string
  /** 文档名称 */
  name: string
  /** 文档内容 */
  content: string
  /** 文档类型 */
  type: DocumentType
  /** 文档标签 */
  tags: string[]
  /** 文档分类 ID */
  categoryId?: string
  /** 父文档 ID（用于树形结构） */
  parentId?: string
  /** 是否收藏 */
  isFavorite: boolean
  /** 查看次数 */
  viewCount: number
  /** 创建时间戳 */
  createdAt: number
  /** 更新时间戳 */
  updatedAt: number
  /** 最后查看时间戳 */
  lastViewedAt?: number
  /** 文档摘要（用于预览） */
  summary?: string
}

/**
 * 文档分类接口定义
 */
export interface DocumentCategory {
  /** 分类唯一标识 */
  id: string
  /** 分类名称 */
  name: string
  /** 分类描述 */
  description?: string
  /** 分类颜色 */
  color?: string
  /** 分类图标 */
  icon?: string
  /** 父分类 ID */
  parentId?: string
  /** 创建时间戳 */
  createdAt: number
  /** 更新时间戳 */
  updatedAt: number
}

/**
 * 标签接口定义
 */
export interface DocumentTag {
  /** 标签唯一标识 */
  id: string
  /** 标签名称 */
  name: string
  /** 标签颜色 */
  color?: string
  /** 使用次数 */
  count: number
  /** 创建时间戳 */
  createdAt: number
}

/**
 * 搜索历史项接口定义
 */
export interface SearchHistoryItem {
  /** 搜索关键词 */
  term: string
  /** 搜索时间戳 */
  timestamp: number
  /** 搜索结果数量 */
  resultsCount?: number
  /** 是否点击过结果 */
  clicked?: boolean
}

/**
 * 文档树节点接口定义
 */
export interface DocumentTreeNode {
  /** 节点唯一标识 */
  id: string
  /** 节点名称 */
  name: string
  /** 节点类型 */
  type: 'folder' | 'document'
  /** 文档数据（仅当 type 为 'document' 时存在） */
  document?: Document
  /** 子节点 */
  children?: DocumentTreeNode[]
  /** 父节点 ID */
  parentId?: string
  /** 是否展开 */
  expanded?: boolean
}

/**
 * 筛选条件接口定义
 */
export interface DocumentFilter {
  /** 文档类型筛选 */
  types?: DocumentType[]
  /** 标签筛选 */
  tags?: string[]
  /** 分类筛选 */
  categoryIds?: string[]
  /** 是否只显示收藏 */
  onlyFavorites?: boolean
  /** 创建时间范围 */
  createdAtRange?: {
    start?: number
    end?: number
  }
  /** 更新时间范围 */
  updatedAtRange?: {
    start?: number
    end?: number
  }
}

/**
 * 排序方式枚举
 */
export enum SortBy {
  /** 按名称排序 */
  Name = 'name',
  /** 按创建时间排序 */
  CreatedAt = 'createdAt',
  /** 按更新时间排序 */
  UpdatedAt = 'updatedAt',
  /** 按查看次数排序 */
  ViewCount = 'viewCount',
  /** 按最后查看时间排序 */
  LastViewedAt = 'lastViewedAt',
}

/**
 * 排序方向枚举
 */
export enum SortOrder {
  /** 升序 */
  Asc = 'asc',
  /** 降序 */
  Desc = 'desc',
}

/**
 * 文档统计信息接口定义
 */
export interface DocumentStatistics {
  /** 文档总数 */
  totalDocuments: number
  /** 分类总数 */
  totalCategories: number
  /** 标签总数 */
  totalTags: number
  /** 收藏文档数 */
  favoriteDocuments: number
  /** 按类型分组的文档数 */
  documentsByType: Record<DocumentType, number>
  /** 按分类分组的文档数 */
  documentsByCategory: Record<string, number>
  /** 最受欢迎的文档（按查看次数） */
  mostViewedDocuments: Document[]
  /** 最近访问的文档 */
  recentlyViewedDocuments: Document[]
  /** 最近创建的文档 */
  recentlyCreatedDocuments: Document[]
}

/**
 * 批量操作结果接口定义
 */
export interface BatchOperationResult {
  /** 成功数量 */
  successCount: number
  /** 失败数量 */
  failureCount: number
  /** 失败的文档 ID 列表 */
  failedIds: string[]
  /** 错误信息 */
  errors?: string[]
}

/**
 * 文档上传配置接口定义
 */
export interface DocumentUploadConfig {
  /** 文档名称 */
  name: string
  /** 文档内容 */
  content: string
  /** 文档类型 */
  type: DocumentType
  /** 文档标签 */
  tags?: string[]
  /** 文档分类 ID */
  categoryId?: string
  /** 父文档 ID */
  parentId?: string
  /** 文档摘要 */
  summary?: string
}
