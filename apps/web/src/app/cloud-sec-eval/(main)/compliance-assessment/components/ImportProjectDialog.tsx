'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { FileUpIcon, UploadIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface ImportProjectDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 导入成功回调 */
  onSuccess?: () => void
}

/**
 * 导入项目对话框
 */
export function ImportProjectDialog(props: ImportProjectDialogProps) {
  const { open, onClose, onSuccess } = props
  const router = useRouter()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  /**
   * 处理文件选择
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  /**
   * 处理导入
   */
  const handleImport = async () => {
    if (!selectedFile) {
      return
    }

    setIsImporting(true)

    // 模拟导入延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 生成新项目ID
    const newProjectId = `project-${Date.now()}`

    setIsImporting(false)

    // 重置表单
    setSelectedFile(null)

    // 调用成功回调
    onSuccess?.()

    // 跳转到项目详情页
    router.push(`/cloud-sec-eval/compliance-assessment/${newProjectId}`)
  }

  /**
   * 处理关闭
   */
  const handleClose = () => {
    if (!isImporting) {
      setSelectedFile(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>导入历史项目</DialogTitle>
          <DialogDescription>
            上传之前导出的项目文件，快速恢复评估项目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 文件上传区域 */}
          <div className="space-y-2">
            <Label htmlFor="import-file">选择项目文件 *</Label>
            <div className="flex items-center gap-2">
              <Input
                accept=".json,.zip"
                id="import-file"
                type="file"
                onChange={handleFileChange}
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                已选择：{selectedFile.name}
              </p>
            )}
          </div>

          {/* 拖拽上传区域 */}
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <FileUpIcon className="size-6 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-medium">
                拖拽文件到此处上传
              </p>
              <p className="text-xs text-muted-foreground">
                支持 .json 和 .zip 格式
              </p>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p className="font-medium">提示：</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>仅支持从本系统导出的项目文件</li>
              <li>导入后将自动创建新项目</li>
              <li>原有项目数据不会被覆盖</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={isImporting}
            variant="outline"
            onClick={handleClose}
          >
            取消
          </Button>
          <Button
            disabled={!selectedFile || isImporting}
            onClick={handleImport}
          >
            {isImporting
              ? (
                  <>
                    <UploadIcon className="mr-2 size-4 animate-pulse" />
                    导入中...
                  </>
                )
              : (
                  '开始导入'
                )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

