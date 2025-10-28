'use client'

import { useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { PlusIcon, UploadIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

import { extractSummary, suggestTags } from '../lib/utils'
import { useKnowledgeBaseStore } from '../stores/useKnowledgeBaseStore'
import { DocumentType } from '../types'

/**
 * 上传文档对话框组件属性
 */
interface UploadDocumentDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * 上传文档对话框组件
 */
export function UploadDocumentDialog({ open: controlledOpen, onOpenChange }: UploadDocumentDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<DocumentType>(DocumentType.Markdown)
  const [categoryId, setCategoryId] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const categories = useKnowledgeBaseStore((state) => state.categories)
  const existingTags = useKnowledgeBaseStore((state) => state.tags)
  const addDocument = useKnowledgeBaseStore((state) => state.addDocument)

  /**
   * 重置表单
   */
  const resetForm = useEvent(() => {
    setName('')
    setContent('')
    setType(DocumentType.Markdown)
    setCategoryId('')
    setTags([])
    setTagInput('')
  })

  /**
   * 添加标签
   */
  const handleAddTag = useEvent(() => {
    const trimmedTag = tagInput.trim()

    if (!trimmedTag) {
      return
    }

    if (tags.includes(trimmedTag)) {
      toast.error('标签已存在')

      return
    }

    setTags([...tags, trimmedTag])
    setTagInput('')
  })

  /**
   * 移除标签
   */
  const handleRemoveTag = useEvent((tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  })

  /**
   * 智能标签建议
   */
  const handleSuggestTags = useEvent(() => {
    const suggestions = suggestTags(name, existingTags)

    if (suggestions.length === 0) {
      toast.info('未找到合适的标签建议')

      return
    }

    const newTags = [...new Set([...tags, ...suggestions])]
    setTags(newTags)
    toast.success(`已添加 ${suggestions.length} 个建议标签`)
  })

  /**
   * 处理提交
   */
  const handleSubmit = useEvent(() => {
    if (!name.trim()) {
      toast.error('请输入文档名称')

      return
    }

    if (!content.trim()) {
      toast.error('请输入文档内容')

      return
    }

    try {
      const summary = extractSummary(content, 200)

      addDocument({
        name: name.trim(),
        content: content.trim(),
        type,
        categoryId: categoryId || undefined,
        tags,
        summary,
      })

      toast.success('文档上传成功')
      setOpen(false)
      resetForm()
    }
    catch (error) {
      toast.error('文档上传失败')
      console.error(error)
    }
  })

  /**
   * 处理对话框关闭
   */
  const handleOpenChange = useEvent((newOpen: boolean) => {
    setOpen(newOpen)

    if (!newOpen) {
      resetForm()
    }
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UploadIcon className="size-4" />
          上传文档
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>上传文档</DialogTitle>
          <DialogDescription>
            填写文档信息并上传到知识库
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 文档名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">文档名称 *</Label>
            <Input
              id="name"
              placeholder="请输入文档名称"
              value={name}
              onChange={(e) => { setName(e.target.value) }}
            />
          </div>

          {/* 文档类型 */}
          <div className="space-y-2">
            <Label htmlFor="type">文档类型</Label>
            <Select value={type} onValueChange={(value) => { setType(value as DocumentType) }}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DocumentType.Markdown}>Markdown</SelectItem>
                <SelectItem value={DocumentType.Text}>纯文本</SelectItem>
                <SelectItem value={DocumentType.PDF}>PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 文档分类 */}
          <div className="space-y-2">
            <Label htmlFor="category">文档分类</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="选择分类（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">无分类</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 文档标签 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tags">文档标签</Label>
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={handleSuggestTags}
              >
                <PlusIcon className="size-4" />
                智能建议
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="输入标签后按回车添加"
                value={tagInput}
                onChange={(e) => { setTagInput(e.target.value) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      className="ml-1 hover:text-destructive"
                      type="button"
                      onClick={() => { handleRemoveTag(tag) }}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 文档内容 */}
          <div className="space-y-2">
            <Label htmlFor="content">文档内容 *</Label>
            <Textarea
              className="min-h-[300px] font-mono text-sm"
              id="content"
              placeholder="请输入文档内容（支持 Markdown 格式）"
              value={content}
              onChange={(e) => { setContent(e.target.value) }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setOpen(false) }}>
            取消
          </Button>
          <Button type="button" onClick={handleSubmit}>
            上传
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
