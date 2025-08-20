import { useMutation } from '@tanstack/react-query'

import { departmentsControllerCreateMutation, departmentsControllerUpdateMutation } from '~/lib/api/generated/@tanstack/react-query.gen'

// ==================== Hook 函数 ====================

/**
 * 创建部门
 * @returns 创建部门的 mutation
 */
export function useCreateDepartment() {
  return useMutation({
    ...departmentsControllerCreateMutation(),
  })
}

/**
 * 更新部门
 * @returns 更新部门的 mutation
 */
export function useUpdateDepartment() {
  return useMutation({
    ...departmentsControllerUpdateMutation(),
  })
}
