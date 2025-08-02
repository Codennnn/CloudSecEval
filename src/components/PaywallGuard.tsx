import { type ReactNode } from 'react'

import { usePaidContentMode } from '~/hooks/usePaidContentMode'

// 临时常量：模拟用户付费状态校验
// TODO: 后续需要替换为真实的用户权限校验逻辑
const HAS_PAID_ACCESS = false

interface PaywallGuardProps {
  /**
   * 自定义的 fallback 内容，当用户无访问权限时显示
   */
  fallback?: ReactNode
}

/**
 * 校验用户是否有访问付费内容的权限
 * @returns 是否有访问权限
 */
function checkUserAccess(): boolean {
  // TODO: 实现真实的权限校验逻辑
  // 可能包括：
  // 1. 检查用户登录状态
  // 2. 验证用户订阅状态
  // 3. 检查用户的付费权限
  // 4. 处理试用期、免费内容等特殊情况

  // 当前使用常量模拟
  return HAS_PAID_ACCESS
}

/**
 * 付费墙守卫组件
 * 根据付费模式开关和用户权限校验来控制内容的显示
 */
export function PaywallGuard(props: React.PropsWithChildren<PaywallGuardProps>) {
  const { children, fallback } = props

  const isPaidMode = usePaidContentMode()

  // 如果未启用付费模式，直接显示内容
  if (!isPaidMode) {
    return <>{children}</>
  }

  // 校验用户是否有访问权限
  const hasAccess = checkUserAccess()

  // 如果用户有访问权限，显示内容
  if (hasAccess) {
    return <>{children}</>
  }

  // 用户无访问权限时，显示付费提示或自定义 fallback
  const defaultFallback = (
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

  return <>{fallback ?? defaultFallback}</>
}
