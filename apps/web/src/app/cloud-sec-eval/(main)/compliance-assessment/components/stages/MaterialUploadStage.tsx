'use client'

import { useState } from 'react'

import { CheckCircleIcon, FileIcon, Trash2Icon, UploadIcon, XCircleIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'

import { formatFileSize } from '../../lib/process-simulator'
import type { AssessmentProject, UploadedFile } from '../../types/assessment'

interface MaterialUploadStageProps {
  /** 评估项目 */
  project: AssessmentProject
  /** 刷新回调 */
  onRefresh?: () => void
}

/**
 * 材料上传阶段组件
 */
export function MaterialUploadStage(props: MaterialUploadStageProps) {
  const { project } = props
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map())

  /**
   * 处理文件选择
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    for (const file of files) {
      const fileId = `${file.name}-${Date.now()}`
      setUploadingFiles(prev => new Map(prev).set(fileId, 0))

      // 模拟上传进度
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadingFiles(prev => new Map(prev).set(fileId, progress))
      }

      // 上传完成，移除进度
      setUploadingFiles((prev) => {
        const next = new Map(prev)
        next.delete(fileId)
        return next
      })
    }

    // 清空文件输入
    event.target.value = ''
  }

  /**
   * 处理开始审核
   */
  const handleStartReview = () => {
    // 这里应该触发进入下一阶段的逻辑
    console.log('开始审核')
  }

  const hasFiles = project.uploadedFiles.length > 0
  const allFilesValid = project.uploadedFiles.every(f => f.validationStatus === 'passed')

  return (
    <div className="space-y-6">
      {/* 文件上传区域 */}
      <div className="rounded-lg border-2 border-dashed p-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <UploadIcon className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-semibold">上传评估材料</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          拖拽文件到此处或点击按钮选择文件
        </p>
        <Button asChild>
          <label className="cursor-pointer">
            <input
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              multiple
              type="file"
              onChange={handleFileSelect}
            />
            选择文件
          </label>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          支持 PDF、Word、Excel 格式
        </p>
      </div>

      {/* 上传进度 */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          {Array.from(uploadingFiles.entries()).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">上传中...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          ))}
        </div>
      )}

      {/* 已上传文件列表 */}
      {hasFiles && (
        <div className="space-y-2">
          <h4 className="font-semibold">已上传文件</h4>
          <div className="space-y-2">
            {project.uploadedFiles.map(file => (
              <FileItem key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {hasFiles && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
          <div className="space-y-1">
            <p className="font-medium">
              {allFilesValid ? '✓ 所有文件校验通过' : '⚠ 部分文件需要检查'}
            </p>
            <p className="text-sm text-muted-foreground">
              已上传 {project.uploadedFiles.length} 个文件
            </p>
          </div>
          <Button
            disabled={!allFilesValid}
            size="lg"
            onClick={handleStartReview}
          >
            开始审核
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * 文件项组件
 */
function FileItem(props: { file: UploadedFile }) {
  const { file } = props

  const statusIcons = {
    pending: <div className="size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />,
    passed: <CheckCircleIcon className="size-5 text-green-600" />,
    failed: <XCircleIcon className="size-5 text-red-600" />,
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <FileIcon className="size-8 text-muted-foreground" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{file.name}</span>
          {statusIcons[file.validationStatus]}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          {file.validationMessage && (
            <span>{file.validationMessage}</span>
          )}
        </div>
      </div>
      <Button size="icon" variant="ghost">
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  )
}

