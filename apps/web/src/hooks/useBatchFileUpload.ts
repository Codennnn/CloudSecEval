import { useState } from 'react'

import { useFileUpload } from './useFileUpload'

import type { FileUploadResponseDataDto } from '~api/types.gen'

export interface UseBatchFileUploadResult {
  /** 批量上传文件 */
  uploadFiles: (files: File[]) => Promise<FileUploadResponseDataDto[]>
  /** 是否正在上传 */
  isUploading: boolean
  /** 上传进度 */
  progress: { total: number, completed: number, failed: number }
}

/**
 * 批量文件上传 Hook
 */
export function useBatchFileUpload(): UseBatchFileUploadResult {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState({ total: 0, completed: 0, failed: 0 })

  const { mutateAsync: uploadSingleFile } = useFileUpload()

  const uploadFiles = async (files: File[]): Promise<FileUploadResponseDataDto[]> => {
    if (files.length === 0) {
      return []
    }

    setIsUploading(true)
    setProgress({ total: files.length, completed: 0, failed: 0 })

    const results: FileUploadResponseDataDto[] = []
    let completed = 0
    let failed = 0

    // 并发上传，但限制并发数量避免过度占用资源
    const concurrency = 3
    const chunks = []

    for (let i = 0; i < files.length; i += concurrency) {
      chunks.push(files.slice(i, i + concurrency))
    }

    try {
      for (const chunk of chunks) {
        const promises = chunk.map(async (file) => {
          try {
            const result = await uploadSingleFile(file)
            completed++
            setProgress({ total: files.length, completed, failed })

            return result
          }
          catch (error) {
            failed++
            setProgress({ total: files.length, completed, failed })
            console.error('文件上传失败:', file.name, error)
            throw error
          }
        })

        const chunkResults = await Promise.allSettled(promises)
        chunkResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          }
        })
      }
    }
    finally {
      setIsUploading(false)
    }

    return results
  }

  return { uploadFiles, isUploading, progress }
}
