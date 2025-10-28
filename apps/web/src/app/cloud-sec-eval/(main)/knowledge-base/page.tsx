'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { BarChart3Icon, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'

import { DocumentDetail } from './components/DocumentDetail'
import { DocumentToolbar } from './components/DocumentToolbar'
import { DocumentTree } from './components/DocumentTree'
import { StatisticsPanel } from './components/StatisticsPanel'
import { UploadDocumentDialog } from './components/UploadDocumentDialog'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { initialCategories, initialDocuments, initialTags } from './lib/initial-data'
import { filterDocuments, searchDocuments, sortDocuments } from './lib/utils'
import { useKnowledgeBaseStore } from './stores/useKnowledgeBaseStore'

/**
 * 知识库主页面
 */
export default function KnowledgeBasePage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  const [statisticsOpen, setStatisticsOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  const documents = useKnowledgeBaseStore((state) => state.documents)
  const selectedDocumentId = useKnowledgeBaseStore((state) => state.selectedDocumentId)
  const searchKeyword = useKnowledgeBaseStore((state) => state.searchKeyword)
  const filter = useKnowledgeBaseStore((state) => state.filter)
  const sortBy = useKnowledgeBaseStore((state) => state.sortBy)
  const sortOrder = useKnowledgeBaseStore((state) => state.sortOrder)
  const deleteDocument = useKnowledgeBaseStore((state) => state.deleteDocument)
  const importData = useKnowledgeBaseStore((state) => state.importData)
  const getDocument = useKnowledgeBaseStore((state) => state.getDocument)
  const selectDocument = useKnowledgeBaseStore((state) => state.selectDocument)
  const toggleFavorite = useKnowledgeBaseStore((state) => state.toggleFavorite)

  /**
   * 初始化数据
   */
  useEffect(() => {
    if (documents.length === 0) {
      importData({
        documents: initialDocuments,
        categories: initialCategories,
        tags: initialTags,
      })
    }
  }, [documents.length, importData])

  /**
   * 获取筛选和排序后的文档列表
   */
  const filteredAndSortedDocuments = (() => {
    let result = documents

    // 搜索
    if (searchKeyword.trim()) {
      result = searchDocuments(result, searchKeyword)
    }

    // 筛选
    result = filterDocuments(result, filter)

    // 排序
    result = sortDocuments(result, sortBy, sortOrder)

    return result
  })()

  /**
   * 处理删除文档
   */
  const handleDeleteClick = useEvent(() => {
    if (!selectedDocumentId) {
      toast.error('请先选择要删除的文档')

      return
    }

    setDocumentToDelete(selectedDocumentId)
    setDeleteDialogOpen(true)
  })

  /**
   * 确认删除文档
   */
  const handleConfirmDelete = useEvent(() => {
    if (!documentToDelete) {
      return
    }

    deleteDocument(documentToDelete)
    toast.success('文档已删除')
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  })

  /**
   * 取消删除
   */
  const handleCancelDelete = useEvent(() => {
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  })

  /**
   * 聚焦搜索框
   */
  const handleFocusSearch = useEvent(() => {
    const searchInput = document.querySelector('input[placeholder="搜索文档..."]')!

    if (searchInput) {
      searchInput.focus()
    }
  })

  /**
   * 切换收藏
   */
  const handleToggleFavorite = useEvent(() => {
    if (!selectedDocumentId) {
      return
    }

    toggleFavorite(selectedDocumentId)
    const doc = getDocument(selectedDocumentId)

    if (doc) {
      toast.success(doc.isFavorite ? '已取消收藏' : '已添加到收藏')
    }
  })

  /**
   * 导航到下一个文档
   */
  const handleNextDocument = useEvent(() => {
    if (filteredAndSortedDocuments.length === 0) {
      return
    }

    const currentIndex = filteredAndSortedDocuments.findIndex((doc) => doc.id === selectedDocumentId)

    if (currentIndex === -1) {
      selectDocument(filteredAndSortedDocuments[0].id)
    }
    else if (currentIndex < filteredAndSortedDocuments.length - 1) {
      selectDocument(filteredAndSortedDocuments[currentIndex + 1].id)
    }
  })

  /**
   * 导航到上一个文档
   */
  const handlePreviousDocument = useEvent(() => {
    if (filteredAndSortedDocuments.length === 0) {
      return
    }

    const currentIndex = filteredAndSortedDocuments.findIndex((doc) => doc.id === selectedDocumentId)

    if (currentIndex === -1) {
      selectDocument(filteredAndSortedDocuments[0].id)
    }
    else if (currentIndex > 0) {
      selectDocument(filteredAndSortedDocuments[currentIndex - 1].id)
    }
  })

  /**
   * 快捷键配置
   */
  const shortcuts = useMemo(() => [
    {
      key: 'f',
      ctrlKey: true,
      handler: handleFocusSearch,
      description: '聚焦搜索框',
    },
    {
      key: 's',
      ctrlKey: true,
      handler: () => { setStatisticsOpen(true) },
      description: '打开统计面板',
    },
    {
      key: 'u',
      ctrlKey: true,
      handler: () => { setUploadDialogOpen(true) },
      description: '上传文档',
    },
    {
      key: 'd',
      ctrlKey: true,
      handler: handleDeleteClick,
      description: '删除当前文档',
    },
    {
      key: 'b',
      ctrlKey: true,
      handler: handleToggleFavorite,
      description: '切换收藏状态',
    },
    {
      key: 'ArrowDown',
      ctrlKey: true,
      handler: handleNextDocument,
      description: '下一个文档',
    },
    {
      key: 'ArrowUp',
      ctrlKey: true,
      handler: handlePreviousDocument,
      description: '上一个文档',
    },
    {
      key: 'Escape',
      handler: () => {
        setDeleteDialogOpen(false)
        setStatisticsOpen(false)
        setUploadDialogOpen(false)
      },
      description: '关闭对话框',
    },
  ], [
    handleFocusSearch,
    handleDeleteClick,
    handleToggleFavorite,
    handleNextDocument,
    handlePreviousDocument,
  ])

  // 启用快捷键
  useKeyboardShortcuts(shortcuts)

  const selectedDocument = documentToDelete ? getDocument(documentToDelete) : null

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部工具栏 */}
      <div className="shrink-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold">法律法规文档知识库</h1>
            <p className="text-sm text-muted-foreground mt-1">
              管理和查看法律法规相关文档
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* 统计面板 */}
            <Sheet open={statisticsOpen} onOpenChange={setStatisticsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <BarChart3Icon className="size-4" />
                  统计信息
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl overflow-y-auto" side="right">
                <SheetHeader>
                  <SheetTitle>统计信息</SheetTitle>
                  <SheetDescription>
                    查看知识库的统计数据和分析
                  </SheetDescription>
                </SheetHeader>
                <StatisticsPanel />
              </SheetContent>
            </Sheet>

            {/* 删除按钮 */}
            <Button
              disabled={!selectedDocumentId}
              variant="outline"
              onClick={handleDeleteClick}
            >
              <TrashIcon className="size-4" />
              删除文档
            </Button>

            {/* 上传文档 */}
            <UploadDocumentDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
          </div>
        </div>

        {/* 搜索和筛选工具栏 */}
        <DocumentToolbar />
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧文档树 */}
        <div className="w-80 border-r shrink-0">
          <DocumentTree />
        </div>

        {/* 右侧文档详情 */}
        <div className="flex-1 overflow-hidden">
          <DocumentDetail />
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除文档
              {' '}
              <span className="font-medium text-foreground">
                {selectedDocument?.name}
              </span>
              {' '}
              吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
