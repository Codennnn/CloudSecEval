import { FileIcon, FileTextIcon, ImageIcon, VideoIcon, XIcon } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { Button } from '../ui/button'

import type { FileUploadResponseDataDto } from '~api/types.gen'

export type UploadedFileItem = FileUploadResponseDataDto

interface UploadedFileListProps {
  /** 已上传的文件 */
  files?: UploadedFileItem[]
  /** 是否只读，控制是否展示删除按钮 */
  readonly?: boolean
  /** 删除回调，传入文件对象 */
  onRemove?: (file: UploadedFileItem) => void | Promise<void>
}

// 获取文件类型图标
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return ImageIcon
  }

  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
    return VideoIcon
  }

  if (['txt', 'md', 'log', 'json', 'xml', 'csv'].includes(ext)) {
    return FileTextIcon
  }

  return FileIcon
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B'
  }

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * 已上传文件列表展示组件。
 * - 负责展示文件名与大小；
 * - 在非只读模式下提供删除交互。
 */
export function UploadedFileList(props: UploadedFileListProps) {
  const { files, readonly, onRemove } = props

  if (!Array.isArray(files) || files.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20">
        <p className="text-sm text-muted-foreground">暂无附件</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => {
        const FileIconComponent = getFileIcon(file.originalName)

        return (
          <div
            key={file.id}
            className="group relative overflow-hidden rounded-lg border bg-card shadow-xs hover:shadow-sm transition-all duration-200 hover:scale-[1.02]"
          >
            {/* 删除按钮 */}
            {!readonly && (
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="size-7 p-0 shadow-md hover:bg-destructive hover:text-destructive-foreground"
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => { void onRemove?.(file) }}
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">删除附件</TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* 文件内容 */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* 文件图标 */}
                <div className="flex-shrink-0 size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileIconComponent className="size-5 text-primary" />
                </div>

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-1">
                    <h4
                      className="font-medium text-sm leading-tight truncate text-foreground"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* 文件扩展名标签 */}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {file.originalName.split('.').pop()?.toUpperCase() ?? 'FILE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部状态条 */}
            <div className="h-1 bg-gradient-to-r from-primary/20 to-primary/40" />
          </div>
        )
      })}
    </div>
  )
}
