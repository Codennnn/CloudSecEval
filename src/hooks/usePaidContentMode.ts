import { useMemo } from 'react'

import { isPaidContentModeEnabled } from '~/lib/paid-content-flag'

/**
 * 知识付费模式功能开关 Hook
 * 注意：这是一个临时性实验功能，开发完成后将被移除
 *
 * @returns {boolean} 是否启用知识付费模式
 */
export function usePaidContentMode(): boolean {
  return useMemo(() => isPaidContentModeEnabled(), [])
}
