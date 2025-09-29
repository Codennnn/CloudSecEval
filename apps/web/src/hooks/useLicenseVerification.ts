import { useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'

import { licenseControllerCheckLicenseMutation } from '~api/@tanstack/react-query.gen'
import type { CheckLicenseApiResponseDto } from '~api/types.gen'

export interface LicenseCredentials {
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
  /** 验证函数 */
  verify: (credentials: LicenseCredentials) => Promise<CheckLicenseApiResponseDto>
}

/**
 * 统一的授权验证 Hook
 * 支持两种模式：
 * 1. 手动模式：不传参数，返回 verify 函数
 * 2. 自动模式：传入 credentials 和 enabled，自动执行验证
 */
export function useLicenseVerification(
  options?: UseLicenseVerificationOptions,
): LicenseVerificationResult {
  const mutation = useMutation({
    ...licenseControllerCheckLicenseMutation(),
  })

  const {
    data,
    isPending,
    isError,
    error,
    mutateAsync,
  } = mutation

  // 自动验证模式
  const [autoVerificationTriggered, setAutoVerificationTriggered] = useState(false)

  useEffect(() => {
    if (options?.enabled && options.credentials && !autoVerificationTriggered) {
      setAutoVerificationTriggered(true)

      void mutateAsync({
        body: {
          email: options.credentials.email,
          code: options.credentials.code,
        },
      })
    }
  }, [options?.enabled, options?.credentials, mutateAsync, autoVerificationTriggered])

  /**
   * 验证授权凭据
   */
  const verify = async (credentials: LicenseCredentials): Promise<CheckLicenseApiResponseDto> => {
    return mutateAsync({
      body: {
        email: credentials.email,
        code: credentials.code,
      },
    })
  }

  return {
    hasAccess: Boolean(data?.data.authorized),
    isLoading: isPending,
    isError,
    error,
    data,
    verify,
  }
}
