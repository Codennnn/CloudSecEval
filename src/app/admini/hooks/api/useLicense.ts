import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '~/lib/api/client'
import { licenseEndpoints } from '~/lib/api/endpoints'
import type {
  CreateLicenseDto,
  License,
  LicenseQueryParams,
  UpdateLicenseDto,
} from '~/lib/api/types'

import { licenseControllerDeleteLicenseMutation } from '~api/@tanstack/react-query.gen'

// ==================== 查询键定义 ====================

/**
 * 授权码相关查询键
 */
export const licenseQueryKeys = {
  all: ['license'] as const,
  lists: () => [...licenseQueryKeys.all, 'list'] as const,
  list: (params?: LicenseQueryParams) => [
    ...licenseQueryKeys.lists(),
    params,
  ] as const,
  details: () => [...licenseQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...licenseQueryKeys.details(), id] as const,
} as const

// ==================== Hook 函数 ====================

/**
 * 创建授权码
 * @returns 创建授权码的mutation
 */
export function useCreateLicense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateLicenseDto): Promise<License> => {
      return await api.post<License>(licenseEndpoints.create(), {
        email: data.email.trim(),
        remark: data.remark?.trim(),
      })
    },
    onSuccess: async () => {
      // 创建成功后，使所有授权码列表查询失效
      await queryClient.invalidateQueries({
        queryKey: licenseQueryKeys.lists(),
      })
    },
  })
}

/**
 * 更新授权码
 * @returns 更新授权码的mutation
 */
export function useUpdateLicense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateLicenseDto
    }): Promise<License> => {
      return await api.put<License>(licenseEndpoints.update(id), data)
    },
    onSuccess: async (_, { id }) => {
      // 更新成功后，使相关查询失效
      await queryClient.invalidateQueries({
        queryKey: licenseQueryKeys.detail(id),
      })
      await queryClient.invalidateQueries({
        queryKey: licenseQueryKeys.lists(),
      })
    },
  })
}

/**
 * 删除授权码
 * @returns 删除授权码的mutation
 */
export function useDeleteLicense(
  options?: ReturnType<typeof licenseControllerDeleteLicenseMutation>,
) {
  return useMutation({
    ...licenseControllerDeleteLicenseMutation(),
    ...options,
  })
}
