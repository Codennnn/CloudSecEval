import { XIcon } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { Button } from '../ui/button'

export interface UploadedFileItem {
  id: string
  originalName: string
  size: number
  mimeType: string
}

interface UploadedFileListProps {
  /** 已上传的文件 */
  files: UploadedFileItem[]
  /** 是否只读，控制是否展示删除按钮 */
  readonly?: boolean
  /** 删除回调，传入文件 id */
  onRemove?: (id: string) => void | Promise<void>
}

/**
 * 已上传文件列表展示组件。
 * - 负责展示文件名与大小；
 * - 在非只读模式下提供删除交互。
 */
export function UploadedFileList(props: UploadedFileListProps) {
  const { files, readonly, onRemove } = props

  return (
    <ul className="space-y-2 text-sm">
      {files.length > 0
        ? files.map((f) => (
            <li key={f.id} className="flex items-center justify-between rounded-md border p-2">
              <div className="min-w-0 flex-1">
                <span className="truncate block" title={f.originalName}>{f.originalName}</span>
                <span className="text-muted-foreground text-xs">{(f.size / 1024).toFixed(1)} KB</span>
              </div>
              {!readonly && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="size-9 p-0"
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => { void onRemove?.(f.id) }}
                    >
                      <XIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>删除附件</TooltipContent>
                </Tooltip>
              )}
            </li>
          ))
        : (
            <li className="flex items-center justify-between rounded-md border p-2 text-muted-foreground">暂无附件</li>
          )}
    </ul>
  )
}
