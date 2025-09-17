import { useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

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
      alert(`最多只能上传 ${maxFiles} 个附件`)

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
    <div className="space-y-2">
      <div className="text-sm font-medium leading-none">附件</div>
      <div
        className={[
          'rounded-md border border-dashed p-4 transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30',
        ].join(' ')}
        role="button"
        tabIndex={0}
        onClick={pickFiles}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <p>将文件拖拽到此处，或点击下方按钮选择文件</p>
          <p className="text-xs">支持图片、视频、日志、PDF 等</p>
          {loading && <p className="text-xs text-primary">正在处理...</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {!readonly && (
            <>
              <input
                ref={inputRef}
                accept={accept}
                className="hidden"
                multiple={multiple}
                type="file"
                onChange={onInputChange}
              />
            </>
          )}
        </div>

        <div className="mt-3">
          <UploadedFileList
            files={value}
            readonly={readonly}
            onRemove={removeOne}
          />
        </div>
      </div>
    </div>
  )
}
