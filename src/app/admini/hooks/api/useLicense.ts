import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '~/lib/api/client'
import { licenseEndpoints } from '~/lib/api/endpoints'
import type {
  CreateLicenseDto,
  License,
  LicenseListResponse,
  LicenseQueryParams,
  UpdateLicenseDto,
} from '~/lib/api/types'

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
 * 获取授权码列表
 * @param params 查询参数
 * @returns 授权码列表查询结果
 */
export function useLicenses(params?: LicenseQueryParams) {
  return useQuery({
    queryKey: licenseQueryKeys.list(params),
    queryFn: async (): Promise<LicenseListResponse> => {
      const searchParams = new URLSearchParams()

      if (params?.page) {
        searchParams.append('page', params.page.toString())
      }

      if (params?.pageSize || params?.limit) {
        searchParams.append('limit', (params.pageSize ?? params.limit)!.toString())
      }

      if (params?.status) {
        searchParams.append('status', params.status)
      }

      if (params?.type) {
        searchParams.append('type', params.type)
      }

      if (params?.userId) {
        searchParams.append('userId', params.userId)
      }

      if (params?.q || params?.keyword || params?.search) {
        const searchTerm = params.q ?? params.keyword ?? params.search

        if (searchTerm) {
          searchParams.append('search', searchTerm)
        }
      }

      const url = searchParams.toString()
        ? `${licenseEndpoints.list()}?${searchParams.toString()}`
        : licenseEndpoints.list()

      return await api.get<LicenseListResponse>(url, { raw: true })
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

/**
 * 获取单个授权码详情
 * @param id 授权码ID
 * @returns 授权码详情查询结果
 */
export function useLicense(id: string) {
  return useQuery({
    queryKey: licenseQueryKeys.detail(id),
    queryFn: async (): Promise<License> => {
      if (!id) {
        throw new Error('License ID is required')
      }

      return await api.get<License>(licenseEndpoints.detail(id))
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

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
export function useDeleteLicense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(licenseEndpoints.delete(id))
    },
    onSuccess: async (_, id) => {
      // 删除成功后，使相关查询失效
      await queryClient.invalidateQueries({
        queryKey: licenseQueryKeys.detail(id),
      })
      await queryClient.invalidateQueries({
        queryKey: licenseQueryKeys.lists(),
      })
    },
  })
}
