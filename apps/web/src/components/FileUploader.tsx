import { useCallback, useEffect, useRef, useState } from 'react'

import { XIcon } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { Button } from './ui/button'

import { formDataBodySerializer } from '~api/client'
import { client as apiClient } from '~api/client.gen'
import { uploadsControllerCleanupTempFile, uploadsControllerGetTempFile } from '~api/sdk.gen'

export function FileUploader(props: {
  value: string[]
  onChange: (ids: string[]) => void
  readonly?: boolean
  accept?: string
  multiple?: boolean
  maxFiles?: number
}) {
  const { value, onChange, readonly, accept, multiple = true, maxFiles = 10 } = props

  interface TempFile {
    id: string
    originalName: string
    size: number
    mimeType: string
  }

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

  const pickFiles = useCallback(() => {
    if (readonly) {
      return
    }

    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [readonly])

  const handleFiles = useCallback(async (selected: FileList | File[]) => {
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
  }, [readonly, value, maxFiles, files, onChange])

  const onInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((ev) => {
    const fileList = ev.target.files

    if (fileList && fileList.length > 0) {
      void handleFiles(fileList)
      ev.target.value = ''
    }
  }, [handleFiles])

  const onDrop = useCallback<React.DragEventHandler<HTMLDivElement>>((ev) => {
    ev.preventDefault()
    setIsDragging(false)

    if (ev.dataTransfer?.files?.length) {
      void handleFiles(ev.dataTransfer.files)
    }
  }, [handleFiles])

  const onDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>((ev) => {
    ev.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback<React.DragEventHandler<HTMLDivElement>>(() => {
    setIsDragging(false)
  }, [])

  const removeOne = useCallback(async (id: string) => {
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
  }, [readonly, value, files, onChange])

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback((ev) => {
    if (readonly) {
      return
    }

    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault()
      pickFiles()
    }
  }, [readonly, pickFiles])

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
                          <Button className="size-9 p-0" size="sm" type="button" variant="outline" onClick={() => { void removeOne(f.id) }}>
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
        </div>
      </div>
    </div>
  )
}
