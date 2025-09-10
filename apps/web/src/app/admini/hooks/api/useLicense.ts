import { useMutation } from '@tanstack/react-query'

import { licenseControllerCreateLicenseMutation, licenseControllerDeleteLicenseMutation, licenseControllerUpdateLicenseMutation } from '~api/@tanstack/react-query.gen'

// ==================== 查询键定义 ====================

// ==================== Hook 函数 ====================

/**
 * 创建授权码
 * @returns 创建授权码的mutation
 */
export function useCreateLicense(
  options?: ReturnType<typeof licenseControllerCreateLicenseMutation>,
) {
  return useMutation({
    ...licenseControllerCreateLicenseMutation(),
    ...options,
  })
}

/**
 * 更新授权码
 * @returns 更新授权码的mutation
 */
export function useUpdateLicense(
  options?: ReturnType<typeof licenseControllerUpdateLicenseMutation>,
) {
  return useMutation({
    ...licenseControllerUpdateLicenseMutation(),
    ...options,
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
