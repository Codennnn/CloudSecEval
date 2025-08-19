import { useMutation } from '@tanstack/react-query'

import { useUserStore } from '~admin/stores/useUserStore'
import { authControllerUpdateProfileMutation } from '~api/@tanstack/react-query.gen'

/**
 * 更新用户资料 Hook
 *
 * 功能特性：
 * - 调用 API 更新用户个人资料
 * - 成功后自动同步更新 store 中的用户信息
 */
export function useUpdateProfile() {
  const { updateUser } = useUserStore()

  return useMutation({
    ...authControllerUpdateProfileMutation(),
    onSuccess: (data) => {
      // API 返回更新后的用户信息，同步更新到 store
      const updatedUser = data.data
      updateUser(updatedUser)
    },
  })
}
