import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  type BatchOperationResult,
  type Document,
  type DocumentCategory,
  type DocumentFilter,
  type DocumentTag,
  type DocumentUploadConfig,
  type SearchHistoryItem,
  SortBy,
  SortOrder,
} from '../types'

/**
 * 知识库状态接口定义
 */
interface KnowledgeBaseState {
  // ==================== 数据状态 ====================
  /** 文档列表 */
  documents: Document[]
  /** 分类列表 */
  categories: DocumentCategory[]
  /** 标签列表 */
  tags: DocumentTag[]
  /** 搜索历史 */
  searchHistory: SearchHistoryItem[]

  // ==================== UI 状态 ====================
  /** 当前选中的文档 ID */
  selectedDocumentId: string | null
  /** 搜索关键词 */
  searchKeyword: string
  /** 筛选条件 */
  filter: DocumentFilter
  /** 排序方式 */
  sortBy: SortBy
  /** 排序方向 */
  sortOrder: SortOrder
  /** 展开的文档夹 ID 列表 */
  expandedFolderIds: Set<string>

  // ==================== 文档操作 ====================
  /** 添加文档 */
  addDocument: (config: DocumentUploadConfig) => Document
  /** 批量添加文档 */
  addDocuments: (configs: DocumentUploadConfig[]) => Document[]
  /** 更新文档 */
  updateDocument: (id: string, updates: Partial<Document>) => void
  /** 删除文档 */
  deleteDocument: (id: string) => void
  /** 批量删除文档 */
  deleteDocuments: (ids: string[]) => BatchOperationResult
  /** 获取文档 */
  getDocument: (id: string) => Document | undefined
  /** 切换文档收藏状态 */
  toggleFavorite: (id: string) => void
  /** 增加文档查看次数 */
  incrementViewCount: (id: string) => void

  // ==================== 分类操作 ====================
  /** 添加分类 */
  addCategory: (category: Omit<DocumentCategory, 'id' | 'createdAt' | 'updatedAt'>) => DocumentCategory
  /** 更新分类 */
  updateCategory: (id: string, updates: Partial<DocumentCategory>) => void
  /** 删除分类 */
  deleteCategory: (id: string) => void
  /** 获取分类 */
  getCategory: (id: string) => DocumentCategory | undefined

  // ==================== 标签操作 ====================
  /** 添加标签 */
  addTag: (name: string, color?: string) => DocumentTag
  /** 更新标签 */
  updateTag: (id: string, updates: Partial<DocumentTag>) => void
  /** 删除标签 */
  deleteTag: (id: string) => void
  /** 获取标签 */
  getTag: (id: string) => DocumentTag | undefined
  /** 批量添加标签到文档 */
  addTagsToDocuments: (documentIds: string[], tagNames: string[]) => BatchOperationResult
  /** 批量从文档移除标签 */
  removeTagsFromDocuments: (documentIds: string[], tagNames: string[]) => BatchOperationResult

  // ==================== 搜索操作 ====================
  /** 设置搜索关键词 */
  setSearchKeyword: (keyword: string) => void
  /** 添加搜索历史 */
  addSearchHistory: (term: string, resultsCount?: number) => void
  /** 清除搜索历史 */
  clearSearchHistory: () => void
  /** 删除单条搜索历史 */
  removeSearchHistory: (term: string) => void

  // ==================== 筛选和排序 ====================
  /** 设置筛选条件 */
  setFilter: (filter: Partial<DocumentFilter>) => void
  /** 重置筛选条件 */
  resetFilter: () => void
  /** 设置排序方式 */
  setSortBy: (sortBy: SortBy) => void
  /** 设置排序方向 */
  setSortOrder: (sortOrder: SortOrder) => void

  // ==================== UI 状态操作 ====================
  /** 选择文档 */
  selectDocument: (id: string | null) => void
  /** 切换文档夹展开状态 */
  toggleFolderExpanded: (id: string) => void
  /** 展开所有文档夹 */
  expandAllFolders: () => void
  /** 折叠所有文档夹 */
  collapseAllFolders: () => void

  // ==================== 工具方法 ====================
  /** 重置所有状态 */
  reset: () => void
  /** 导入数据 */
  importData: (data: Partial<Pick<KnowledgeBaseState, 'documents' | 'categories' | 'tags'>>) => void
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 初始状态
 */
const initialState = {
  documents: [],
  categories: [],
  tags: [],
  searchHistory: [],
  selectedDocumentId: null,
  searchKeyword: '',
  filter: {},
  sortBy: SortBy.UpdatedAt,
  sortOrder: SortOrder.Desc,
  expandedFolderIds: new Set<string>(),
}

/**
 * 知识库状态管理 Store
 */
export const useKnowledgeBaseStore = create<KnowledgeBaseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==================== 文档操作 ====================
      addDocument: (config) => {
        const now = Date.now()
        const document: Document = {
          id: generateId(),
          name: config.name,
          content: config.content,
          type: config.type,
          tags: config.tags ?? [],
          categoryId: config.categoryId,
          parentId: config.parentId,
          isFavorite: false,
          viewCount: 0,
          createdAt: now,
          updatedAt: now,
          summary: config.summary,
        }

        set((state) => ({
          documents: [...state.documents, document],
        }))

        // 更新标签计数
        if (config.tags && config.tags.length > 0) {
          config.tags.forEach((tagName) => {
            const existingTag = get().tags.find((t) => t.name === tagName)

            if (existingTag) {
              get().updateTag(existingTag.id, { count: existingTag.count + 1 })
            }
            else {
              get().addTag(tagName)
            }
          })
        }

        return document
      },

      addDocuments: (configs) => {
        const documents = configs.map((config) => get().addDocument(config))

        return documents
      },

      updateDocument: (id, updates) => {
        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id === id) {
              return { ...doc, ...updates, updatedAt: Date.now() }
            }

            return doc
          }),
        }))
      },

      deleteDocument: (id) => {
        const document = get().getDocument(id)

        if (document) {
          // 更新标签计数
          document.tags.forEach((tagName) => {
            const tag = get().tags.find((t) => t.name === tagName)

            if (tag && tag.count > 0) {
              get().updateTag(tag.id, { count: tag.count - 1 })
            }
          })
        }

        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
          selectedDocumentId: state.selectedDocumentId === id ? null : state.selectedDocumentId,
        }))
      },

      deleteDocuments: (ids) => {
        const result: BatchOperationResult = {
          successCount: 0,
          failureCount: 0,
          failedIds: [],
        }

        ids.forEach((id) => {
          try {
            get().deleteDocument(id)
            result.successCount++
          }
          catch {
            result.failureCount++
            result.failedIds.push(id)
          }
        })

        return result
      },

      getDocument: (id) => {
        return get().documents.find((doc) => doc.id === id)
      },

      toggleFavorite: (id) => {
        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id === id) {
              return { ...doc, isFavorite: !doc.isFavorite }
            }

            return doc
          }),
        }))
      },

      incrementViewCount: (id) => {
        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id === id) {
              return {
                ...doc,
                viewCount: doc.viewCount + 1,
                lastViewedAt: Date.now(),
              }
            }

            return doc
          }),
        }))
      },

      // ==================== 分类操作 ====================
      addCategory: (category) => {
        const now = Date.now()
        const newCategory: DocumentCategory = {
          ...category,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          categories: [...state.categories, newCategory],
        }))

        return newCategory
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) => {
            if (cat.id === id) {
              return { ...cat, ...updates, updatedAt: Date.now() }
            }

            return cat
          }),
        }))
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          documents: state.documents.map((doc) => {
            if (doc.categoryId === id) {
              return { ...doc, categoryId: undefined }
            }

            return doc
          }),
        }))
      },

      getCategory: (id) => {
        return get().categories.find((cat) => cat.id === id)
      },

      // ==================== 标签操作 ====================
      addTag: (name, color) => {
        const existingTag = get().tags.find((t) => t.name === name)

        if (existingTag) {
          return existingTag
        }

        const newTag: DocumentTag = {
          id: generateId(),
          name,
          color,
          count: 1,
          createdAt: Date.now(),
        }

        set((state) => ({
          tags: [...state.tags, newTag],
        }))

        return newTag
      },

      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((tag) => {
            if (tag.id === id) {
              return { ...tag, ...updates }
            }

            return tag
          }),
        }))
      },

      deleteTag: (id) => {
        const tag = get().getTag(id)

        if (tag) {
          set((state) => ({
            tags: state.tags.filter((t) => t.id !== id),
            documents: state.documents.map((doc) => ({
              ...doc,
              tags: doc.tags.filter((t) => t !== tag.name),
            })),
          }))
        }
      },

      getTag: (id) => {
        return get().tags.find((tag) => tag.id === id)
      },

      addTagsToDocuments: (documentIds, tagNames) => {
        const result: BatchOperationResult = {
          successCount: 0,
          failureCount: 0,
          failedIds: [],
        }

        documentIds.forEach((id) => {
          try {
            const document = get().getDocument(id)

            if (document) {
              const newTags = [...new Set([...document.tags, ...tagNames])]
              get().updateDocument(id, { tags: newTags })

              // 更新标签计数
              tagNames.forEach((tagName) => {
                if (!document.tags.includes(tagName)) {
                  const existingTag = get().tags.find((t) => t.name === tagName)

                  if (existingTag) {
                    get().updateTag(existingTag.id, { count: existingTag.count + 1 })
                  }
                  else {
                    get().addTag(tagName)
                  }
                }
              })

              result.successCount++
            }
            else {
              result.failureCount++
              result.failedIds.push(id)
            }
          }
          catch {
            result.failureCount++
            result.failedIds.push(id)
          }
        })

        return result
      },

      removeTagsFromDocuments: (documentIds, tagNames) => {
        const result: BatchOperationResult = {
          successCount: 0,
          failureCount: 0,
          failedIds: [],
        }

        documentIds.forEach((id) => {
          try {
            const document = get().getDocument(id)

            if (document) {
              const newTags = document.tags.filter((t) => !tagNames.includes(t))
              get().updateDocument(id, { tags: newTags })

              // 更新标签计数
              tagNames.forEach((tagName) => {
                if (document.tags.includes(tagName)) {
                  const tag = get().tags.find((t) => t.name === tagName)

                  if (tag && tag.count > 0) {
                    get().updateTag(tag.id, { count: tag.count - 1 })
                  }
                }
              })

              result.successCount++
            }
            else {
              result.failureCount++
              result.failedIds.push(id)
            }
          }
          catch {
            result.failureCount++
            result.failedIds.push(id)
          }
        })

        return result
      },

      // ==================== 搜索操作 ====================
      setSearchKeyword: (keyword) => {
        set({ searchKeyword: keyword })
      },

      addSearchHistory: (term, resultsCount) => {
        if (!term.trim()) {
          return
        }

        set((state) => {
          const existingIndex = state.searchHistory.findIndex((item) => item.term === term)
          let newHistory = [...state.searchHistory]

          if (existingIndex !== -1) {
            newHistory.splice(existingIndex, 1)
          }

          newHistory = [
            {
              term,
              timestamp: Date.now(),
              resultsCount,
              clicked: false,
            },
            ...newHistory,
          ].slice(0, 20)

          return { searchHistory: newHistory }
        })
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] })
      },

      removeSearchHistory: (term) => {
        set((state) => ({
          searchHistory: state.searchHistory.filter((item) => item.term !== term),
        }))
      },

      // ==================== 筛选和排序 ====================
      setFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }))
      },

      resetFilter: () => {
        set({ filter: {} })
      },

      setSortBy: (sortBy) => {
        set({ sortBy })
      },

      setSortOrder: (sortOrder) => {
        set({ sortOrder })
      },

      // ==================== UI 状态操作 ====================
      selectDocument: (id) => {
        set({ selectedDocumentId: id })

        if (id) {
          get().incrementViewCount(id)
        }
      },

      toggleFolderExpanded: (id) => {
        set((state) => {
          const newExpandedFolderIds = new Set(state.expandedFolderIds)

          if (newExpandedFolderIds.has(id)) {
            newExpandedFolderIds.delete(id)
          }
          else {
            newExpandedFolderIds.add(id)
          }

          return { expandedFolderIds: newExpandedFolderIds }
        })
      },

      expandAllFolders: () => {
        const allFolderIds = get().categories.map((cat) => cat.id)
        set({ expandedFolderIds: new Set(allFolderIds) })
      },

      collapseAllFolders: () => {
        set({ expandedFolderIds: new Set() })
      },

      // ==================== 工具方法 ====================
      reset: () => {
        set(initialState)
      },

      importData: (data) => {
        set((state) => ({
          documents: data.documents ?? state.documents,
          categories: data.categories ?? state.categories,
          tags: data.tags ?? state.tags,
        }))
      },
    }),
    {
      name: 'knowledge-base-storage',
      partialize: (state) => ({
        documents: state.documents,
        categories: state.categories,
        tags: state.tags,
        searchHistory: state.searchHistory,
        expandedFolderIds: Array.from(state.expandedFolderIds),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.expandedFolderIds)) {
          state.expandedFolderIds = new Set(state.expandedFolderIds as unknown as string[])
        }
      },
    },
  ),
)
