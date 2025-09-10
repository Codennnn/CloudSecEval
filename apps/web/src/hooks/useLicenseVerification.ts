import { useMutation } from '@tanstack/react-query'

import { licenseControllerCheckLicenseMutation } from '~api/@tanstack/react-query.gen'
import type { CheckLicenseApiResponseDto } from '~api/types.gen'

interface LicenseCredentials {
  email: string
  code: string
}

interface UseLicenseVerificationOptions {
  /** 授权凭据 */
  credentials?: LicenseCredentials | null
  /** 是否启用验证 */
  enabled?: boolean
  /** 是否重试失败的请求 */
  retry?: boolean
  /** 数据保持新鲜的时间（毫秒） */
  staleTime?: number
}

interface LicenseVerificationResult {
  /** 是否有访问权限 */
  hasAccess: boolean
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否发生错误 */
  isError: boolean
  /** 错误信息 */
  error: unknown
  /** 原始响应数据 */
  data: CheckLicenseApiResponseDto | undefined
  /** 是否已启用验证 */
  isEnabled: boolean
}

/**
 * 统一的授权验证 Hook
 * 封装了授权验证的通用逻辑，可在不同组件中复用
 *
 * @param options 验证选项
 * @returns 验证结果和状态
 */
export function useLicenseVerification({
  credentials,
  enabled = true,
}: UseLicenseVerificationOptions = {}): LicenseVerificationResult {
  const shouldVerify = enabled && credentials !== null && credentials !== undefined

  const {
    data,
    status,
    isError,
    error,
  } = useMutation({
    ...licenseControllerCheckLicenseMutation({
      body: {
        email: credentials?.email ?? '',
        code: credentials?.code ?? '',
      },
    }),
  })

  return {
    hasAccess: Boolean(data?.data.authorized),
    isLoading: shouldVerify && status === 'pending',
    isError,
    error,
    data,
    isEnabled: shouldVerify,
  }
}
