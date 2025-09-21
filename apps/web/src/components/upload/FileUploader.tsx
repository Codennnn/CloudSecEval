import { useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { CloudUploadIcon, FolderOpenIcon } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyContent } from '~/components/EmptyContent'
import { Button } from '~/components/ui/button'

import { UploadedFileList } from './UploadedFileList'

import type { FileUploadResponseDataDto } from '~api/types.gen'

export type FileInfo = FileUploadResponseDataDto

interface FileUploaderProps {
  /** 已上传的文件列表 */
  value?: FileInfo[]
  /** 文件变更回调 */
  onChange?: (files: FileInfo[]) => void
  /** 文件选择回调，用于处理新选择的文件 */
  onFilesSelected?: (files: File[]) => Promise<void>
  /** 文件删除回调 */
  onFileRemove?: (file: FileInfo) => Promise<void>
  /** 是否只读 */
  readonly?: boolean
  /** 接受的文件类型 */
  accept?: string
  /** 是否允许多选 */
  multiple?: boolean
  /** 最大上传文件数量 */
  maxFiles?: number
  /** 是否正在处理文件 */
  loading?: boolean
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value,
    onChange,
    onFilesSelected,
    onFileRemove,
    readonly,
    accept,
    multiple = true,
    maxFiles = 10,
    loading = false,
  } = props

  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const pickFiles = useEvent(() => {
    if (readonly) {
      return
    }

    if (inputRef.current) {
      inputRef.current.click()
    }
  })

  const handleFiles = useEvent(async (selected: FileList | File[]) => {
    if (readonly || loading) {
      return
    }

    const currentCount = value?.length ?? 0
    const incomingCount = Array.isArray(selected) ? selected.length : selected.length
    const totalCount = currentCount + incomingCount

    if (totalCount > maxFiles) {
      toast.warning(`最多只能上传 ${maxFiles} 个附件`)

      return
    }

    const filesArray = Array.from(selected)

    if (onFilesSelected) {
      await onFilesSelected(filesArray)
    }
  })

  const onInputChange = useEvent<React.ChangeEventHandler<HTMLInputElement>>((ev) => {
    const fileList = ev.target.files

    if (fileList && fileList.length > 0) {
      void handleFiles(fileList)
      ev.target.value = ''
    }
  })

  const onDrop = useEvent<React.DragEventHandler<HTMLDivElement>>((ev) => {
    ev.preventDefault()
    setIsDragging(false)

    if (ev.dataTransfer.files.length > 0) {
      void handleFiles(ev.dataTransfer.files)
    }
  })

  const onDragOver = useEvent<React.DragEventHandler<HTMLDivElement>>((ev) => {
    ev.preventDefault()
    setIsDragging(true)
  })

  const onDragLeave = useEvent<React.DragEventHandler<HTMLDivElement>>(() => {
    setIsDragging(false)
  })

  const removeOne = useEvent(async (file: FileInfo) => {
    if (readonly || loading) {
      return
    }

    if (onFileRemove) {
      await onFileRemove(file)
    }
    else {
      // 如果没有提供删除回调，则默认从列表中移除
      const nextFiles = value?.filter((f) => f.id !== file.id) ?? []
      onChange?.(nextFiles)
    }
  })

  const handleKeyDown = useEvent<React.KeyboardEventHandler<HTMLDivElement>>((ev) => {
    if (readonly) {
      return
    }

    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault()
      pickFiles()
    }
  })

  return (
    <div className="space-y-4">
      <div className="group relative">
        {/* 主上传区域 */}
        {!readonly && (
          <div
            className={[
              'relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ease-out',
              'bg-gradient-to-br from-muted/30 to-background',
              'hover:from-muted/50 hover:to-muted/10 hover:shadow-sm cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
                : 'border-muted-foreground/40',
              loading && 'pointer-events-none opacity-75',
            ].join(' ')}
            role="button"
            tabIndex={0}
            onClick={pickFiles}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onKeyDown={handleKeyDown}
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-grid-small opacity-[0.02] pointer-events-none" />

            <div className="relative px-8 py-12">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                {/* 图标区域 */}
                <div
                  className={[
                    'relative flex items-center justify-center size-16 rounded-2xl transition-all duration-300',
                    'bg-gradient-to-br from-primary/10 to-primary/5',
                    isDragging && 'scale-110 from-primary/20 to-primary/10',
                  ].join(' ')}
                >
                  {loading
                    ? (
                        <div className="animate-spin size-8 rounded-full border-2 border-muted-foreground/20 border-t-primary" />
                      )
                    : (
                        <CloudUploadIcon
                          className={[
                            'size-8 transition-all duration-300',
                            isDragging ? 'text-primary scale-110' : 'text-muted-foreground',
                          ].join(' ')}
                        />
                      )}
                </div>

                {/* 文字内容 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {loading ? '正在处理...' : '上传附件'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {isDragging
                      ? '释放文件以开始上传'
                      : '将文件拖拽到此处，或点击下方按钮选择文件'}
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    支持图片、视频、日志、PDF 等格式
                  </p>
                </div>

                {/* 操作按钮 */}
                {!loading && (
                  <Button
                    className="mt-2 gap-2"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      pickFiles()
                    }}
                  >
                    <FolderOpenIcon />
                    选择文件
                  </Button>
                )}

                {/* 文件数量提示 */}
                {value && value.length > 0 && (
                  <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    已选择 {value.length}/{maxFiles} 个文件
                  </div>
                )}
              </div>
            </div>

            {/* 隐藏的文件输入 */}
            <input
              ref={inputRef}
              accept={accept}
              className="hidden"
              multiple={multiple}
              type="file"
              onChange={onInputChange}
            />
          </div>
        )}

        {/* MARK: 文件列表 */}
        {
          Array.isArray(value) && value.length > 0
            ? (
                <div className="mt-6">
                  <UploadedFileList
                    files={value}
                    readonly={readonly}
                    onRemove={removeOne}
                  />
                </div>
              )
            : readonly
              ? <EmptyContent />
              : null
        }
      </div>
    </div>
  )
}
