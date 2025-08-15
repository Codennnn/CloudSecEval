import { type ReactNode } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useLocalStorage } from '~/hooks/useLocalStorage'
import { usePaidContentMode } from '~/hooks/usePaidContentMode'
import { licenseControllerCheckLicenseOptions } from '~/lib/api/generated/@tanstack/react-query.gen'

interface PaywallGuardProps {
  /**
   * 自定义的 fallback 内容，当用户无访问权限时显示
   */
  fallback?: ReactNode
}

/**
 * 用户授权信息
 */
interface UserLicenseInfo {
  email: string
  code: string
  licenseId?: string
}

/**
 * 使用授权信息校验用户访问权限的 Hook
 * @returns 权限校验结果和状态
 */
function useUserAccessCheck() {
  // 从本地存储获取用户授权信息
  const [licenseInfo] = useLocalStorage<UserLicenseInfo>('user-license-info')

  // 当有邮箱和授权码信息时才进行授权验证
  const shouldCheck = Boolean(licenseInfo?.email) && Boolean(licenseInfo?.code)

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...licenseControllerCheckLicenseOptions({
      body: {
        email: licenseInfo?.email ?? '',
        code: licenseInfo?.code ?? '',
      },
    }),
    enabled: shouldCheck,
    retry: false, // 不自动重试，避免频繁请求
    staleTime: 5 * 60 * 1000, // 5分钟内不重新验证
  })

  return {
    hasAccess: Boolean(data?.data?.authorized),
    isLoading: shouldCheck && isLoading,
    isError,
    error,
    hasLicenseInfo: shouldCheck,
  }
}

/**
 * 付费墙守卫组件
 * 根据付费模式开关和用户权限校验来控制内容的显示
 */
export function PaywallGuard(props: React.PropsWithChildren<PaywallGuardProps>) {
  const { children, fallback } = props

  const isPaidMode = usePaidContentMode()
  // 获取用户访问权限校验结果（Hook 必须在顶层调用）
  const { hasAccess, isLoading, isError, hasLicenseInfo } = useUserAccessCheck()

  // 如果未启用付费模式，直接显示内容
  if (!isPaidMode) {
    return <>{children}</>
  }

  // 如果正在校验权限，显示加载状态
  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-2xl mb-3">⏳</div>
        <p className="text-gray-600">正在验证授权信息...</p>
      </div>
    )
  }

  // 如果用户有访问权限，显示内容
  if (hasAccess) {
    return <>{children}</>
  }

  // 根据不同状态显示不同的提示信息
  const getDefaultFallback = () => {
    // 如果没有授权信息，提示用户输入
    if (!hasLicenseInfo) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl mb-3">🔐</div>
          <h3 className="font-bold text-xl mb-3 text-blue-800">付费内容</h3>
          <p className="text-blue-700 mb-4 leading-relaxed">
            此内容为付费专享，请输入您的邮箱和授权码来解锁内容。
            <br />
            支持我们继续提供高质量的中文技术文档。
          </p>
          <div className="space-y-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium">
              输入授权码
            </button>
            <p className="text-sm text-blue-600">
              还没有授权码？
              {' '}
              <button className="underline hover:text-blue-800">立即购买</button>
            </p>
          </div>
        </div>
      )
    }

    // 如果校验失败，提示授权码无效或过期
    if (isError) {
      return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl mb-3">❌</div>
          <h3 className="font-bold text-xl mb-3 text-red-800">授权验证失败</h3>
          <p className="text-red-700 mb-4 leading-relaxed">
            您的授权码可能已过期或无效，请检查您的授权信息。
            <br />
            如有问题请联系客服。
          </p>
          <div className="space-y-3">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors font-medium">
              更新授权码
            </button>
            <p className="text-sm text-red-600">
              需要帮助？
              {' '}
              <button className="underline hover:text-red-800">联系客服</button>
            </p>
          </div>
        </div>
      )
    }

    // 默认的付费提示
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center shadow-sm">
        <div className="text-3xl mb-3">🔐</div>
        <h3 className="font-bold text-xl mb-3 text-blue-800">付费内容</h3>
        <p className="text-blue-700 mb-4 leading-relaxed">
          此内容为付费专享，解锁后可查看完整内容。
          <br />
          支持我们继续提供高质量的中文技术文档。
        </p>
        <div className="space-y-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium">
            立即解锁
          </button>
          <p className="text-sm text-blue-600">
            已购买？
            {' '}
            <button className="underline hover:text-blue-800">点击登录</button>
          </p>
        </div>
      </div>
    )
  }

  return <>{fallback ?? getDefaultFallback()}</>
}
