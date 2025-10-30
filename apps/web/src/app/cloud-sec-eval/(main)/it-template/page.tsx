'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { CloudSecEvalRoutes } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

/**
 * IT 化管理主页面
 * 重定向到任务创建台
 */
export default function ITTemplatePage() {
  const router = useRouter()

  // 页面加载时重定向到任务创建台
  useEffect(() => {
    router.push(CloudSecEvalRoutes.TaskCreation)
  }, [router])

  return null
}

