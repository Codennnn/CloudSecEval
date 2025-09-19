import { useQuery } from '@tanstack/react-query'
import { consola } from 'consola'

import { uploadsControllerGetStoredFile } from '~api/sdk.gen'
import type { FileUploadResponseDataDto } from '~api/types.gen'

/**
 * 根据附件ID获取文件信息
 */
export function useAttachmentFiles(attachmentIds: string[] = []) {
  return useQuery({
    queryKey: ['attachmentFiles', attachmentIds],
    queryFn: async (): Promise<FileUploadResponseDataDto[]> => {
      if (attachmentIds.length === 0) {
        return []
      }

      const promises = attachmentIds.map(async (id) => {
        try {
          const response = await uploadsControllerGetStoredFile({ path: { id } })

          return response.data?.data
        }
        catch (error) {
          consola.error('获取附件信息失败:', id, error)

          return null
        }
      })

      const results = await Promise.all(promises)

      return results.filter(Boolean) as FileUploadResponseDataDto[]
    },
    enabled: attachmentIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5分钟内数据不过期
  })
}
