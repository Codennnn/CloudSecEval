import { useMutation, useQueryClient } from '@tanstack/react-query'

import { usersControllerCreate, usersControllerRemoveUser, usersControllerUpdate } from '~/lib/api/generated/sdk.gen'

// ==================== 查询键定义 ====================

/**
 * 用户相关查询键
 */
export const userQueryKeys = {
  all: ['user'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [
    ...userQueryKeys.lists(),
    params,
  ] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
} as const

// ==================== Hook 函数 ====================

/**
 * 删除用户
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await usersControllerRemoveUser({
        url: `/api/users/${userId}` as '/api/users/{id}',
      })
    },
    onSuccess: () => {
      // 删除成功后刷新用户列表
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
    },
  })
}

/**
 * 创建用户
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    ...usersControllerCreateMutation(),
    onSuccess: () => {
      // 创建成功后刷新用户列表
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
    },
  })
}

/**
 * 更新用户
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    ...usersControllerUpdateMutation(),
    onSuccess: () => {
      // 更新成功后刷新用户列表
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
    },
  })
}
