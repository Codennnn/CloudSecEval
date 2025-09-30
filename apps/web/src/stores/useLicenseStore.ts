import { useEffect, useState } from 'react'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { LOCAL_STORAGE_KEYS } from '~/constants/storage'

/**
 * 用户授权信息接口
 */
interface UserLicenseInfo {
  email: string
  code: string
  licenseId?: string
}

interface LicenseState {
  licenseInfo: UserLicenseInfo | null

  /** 设置授权信息 */
  setLicenseInfo: (info: UserLicenseInfo | null) => void
  /** 更新授权信息（部分更新） */
  updateLicenseInfo: (updates: Partial<UserLicenseInfo>) => void
  /** 清除授权信息 */
  clearLicenseInfo: () => void
  /** 检查是否有有效的授权信息 */
  hasValidLicenseInfo: () => boolean
}

/**
 * 用户授权信息状态管理 Store
 * 支持页面刷新后状态恢复和跨标签页同步
 */
export const useLicenseStore = create<LicenseState>()(
  persist(
    (set, get) => ({
      licenseInfo: null,

      setLicenseInfo: (info) => {
        set({ licenseInfo: info })
      },

      updateLicenseInfo: (updates) => {
        const currentInfo = get().licenseInfo

        if (currentInfo) {
          set({ licenseInfo: { ...currentInfo, ...updates } })
        }
      },

      clearLicenseInfo: () => {
        set({ licenseInfo: null })
      },

      hasValidLicenseInfo: () => {
        const info = get().licenseInfo

        if (info) {
          return Boolean(info.email) && Boolean(info.code)
        }

        return false
      },
    }),
    {
      name: LOCAL_STORAGE_KEYS.USER_LICENSE_INFO, // 使用常量替代硬编码字符串
      partialize: (state) => ({ licenseInfo: state.licenseInfo }), // 只持久化授权信息
    },
  ),
)

// ==================== 便捷的选择器 hooks ====================

/**
 * 检查是否有有效的授权信息
 * @returns 是否有有效授权信息的布尔值
 */
export function useHasValidLicense(): boolean | null {
  const hasValidLicense = useLicenseStore((state) => state.hasValidLicenseInfo())

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (isClient) {
    return hasValidLicense
  }

  return null
}
