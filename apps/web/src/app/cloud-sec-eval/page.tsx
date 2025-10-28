import { redirect } from 'next/navigation'

import { cloudSecEvalHomeRoute } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

/**
 * 云智评模块根路由
 * 自动重定向到第一个功能页面（法规智能解析）
 */
export default function CloudSecEvalRootPage() {
  redirect(cloudSecEvalHomeRoute)
}

