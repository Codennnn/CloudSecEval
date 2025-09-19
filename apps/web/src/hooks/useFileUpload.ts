import { useMutation } from '@tanstack/react-query'

import { uploadsControllerUploadSingleFile } from '~api/sdk.gen'
import type { FileUploadResponseDataDto } from '~api/types.gen'

export interface UseFileUploadOptions {
  /** 上传成功回调 */
  onSuccess?: (data: FileUploadResponseDataDto) => void
  /** 上传失败回调 */
  onError?: (error: Error) => void
}

/**
 * 单文件上传 Hook
 */
export function useFileUpload(options?: UseFileUploadOptions) {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadsControllerUploadSingleFile({
        body: { file },
      })

      if (!response.data?.data) {
        throw new Error('上传失败：服务器未返回有效数据')
      }

      return response.data.data
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}
