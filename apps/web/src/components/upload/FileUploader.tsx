import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { UploadedFileList } from './UploadedFileList'

import { formDataBodySerializer } from '~api/client'
import { client as apiClient } from '~api/client.gen'
import { uploadsControllerCleanupTempFile, uploadsControllerGetTempFile } from '~api/sdk.gen'

interface TempFile {
  id: string
  originalName: string
  size: number
  mimeType: string
}

interface FileUploaderProps {
  /** 已上传的文件 ID 列表 */
  value: string[]
  /** 文件变更回调 */
  onChange: (ids: string[]) => void
  /** 是否只读 */
  readonly?: boolean
  /** 接受的文件类型 */
  accept?: string
  /** 是否允许多选 */
  multiple?: boolean
  /** 最大上传文件数量 */
  maxFiles?: number
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value,
    onChange,
    readonly,
    accept,
    multiple = true,
    maxFiles = 10,
  } = props

  const [files, setFiles] = useState<TempFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    async function fetchTempFiles() {
      if (!value || value.length === 0) {
        setFiles([])
      }
      else {
        const results: TempFile[] = []

        for (const id of value) {
          try {
            const res = await uploadsControllerGetTempFile({ path: { id } })
            const payload = (res as unknown as { data?: unknown })?.data ?? res
            const data = (payload as unknown as { data?: unknown })?.data ?? payload

            if (data && typeof data === 'object') {
              results.push({
                id: (data as Record<string, unknown>).id as string,
                originalName: (data as Record<string, unknown>).originalName as string,
                size: (data as Record<string, unknown>).size as number,
                mimeType: (data as Record<string, unknown>).mimeType as string,
              })
            }
          }
          catch {
            // ignore
          }
        }

        setFiles(results)
      }
    }

    void fetchTempFiles()
  }, [value])

  const pickFiles = useEvent(() => {
    if (readonly) {
      return
    }

    if (inputRef.current) {
      inputRef.current.click()
    }
  })

  const handleFiles = useEvent(async (selected: FileList | File[]) => {
    if (readonly) {
      return
    }

    const currentCount = value?.length ?? 0
    const incomingCount = Array.isArray(selected) ? selected.length : selected.length
    const totalCount = currentCount + incomingCount

    if (totalCount > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 个附件`)
    }
    else {
      setIsUploading(true)
      const newIds: string[] = []
      const newFiles: TempFile[] = []

      for (const file of Array.from(selected)) {
        try {
          const res = await apiClient.post({
            ...formDataBodySerializer,
            url: '/api/uploads/single',
            headers: { 'Content-Type': null },
            body: { file },
          })

          const payloadObj = res as unknown as { data?: unknown }
          const payload = payloadObj && payloadObj.data !== undefined ? payloadObj.data : res
          const dataObj = payload as unknown as { data?: unknown }
          const data = dataObj && dataObj.data !== undefined ? dataObj.data : payload

          if (data && typeof data === 'object') {
            const raw = data as Record<string, unknown>
            const id = raw.id as string

            if (id) {
              newIds.push(id)
              newFiles.push({
                id,
                originalName: (raw.originalName as string) ?? file.name,
                size: (raw.size as number) ?? file.size,
                mimeType: (raw.mimeType as string) ?? file.type,
              })
            }
          }
        }
        catch {
          // ignore
        }
      }

      if (newIds.length > 0) {
        const prevIds = value ?? []
        const mergedIds = [...prevIds, ...newIds]
        const mergedFiles = [...files, ...newFiles]
        setFiles(mergedFiles)
        onChange(mergedIds)
      }

      setIsUploading(false)
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

    if (ev.dataTransfer?.files?.length) {
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

  const removeOne = useEvent(async (id: string) => {
    if (readonly) {
      return
    }

    try {
      await uploadsControllerCleanupTempFile({ path: { id } })
    }
    catch {}

    const nextIds = (value ?? []).filter((x) => x !== id)
    const nextFiles = files.filter((f) => f.id !== id)
    setFiles(nextFiles)
    onChange(nextIds)
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
          {isUploading && <p className="text-xs text-primary">正在上传...</p>}
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
            files={files}
            readonly={readonly}
            onRemove={(id) => { void removeOne(id) }}
          />
        </div>
      </div>
    </div>
  )
}
