'use client'

import { useEffect, useState } from 'react'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app'
import { AlertTriangle, ArrowLeft, LogIn } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

import { useLogout } from '~admin/hooks/api/useAuth'
import { adminHomeRoute, getPageNameByRoute } from '~admin/lib/admin-nav'

/**
 * 无权限访问页面
 *
 * 功能特性：
 * - 显示友好的无权限提示
 * - 支持返回操作和重定向
 * - 显示尝试访问的页面信息
 * - 提供刷新重试功能
 */
export function UnauthorizedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const logout = useLogout()
  const [attemptedPath, setAttemptedPath] = useState<string>('')
  const [attemptedPageName, setAttemptedPageName] = useState<string>('')

  // 从 URL 参数获取用户尝试访问的路径
  useEffect(() => {
    const from = searchParams.get('from')

    if (from) {
      setAttemptedPath(from)
      setAttemptedPageName(getPageNameByRoute(from))
    }
  }, [searchParams])

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    }
    else {
      router.push(adminHomeRoute)
    }
  }

  const handleReLogin = () => {
    logout.mutate({})
  }

  return (
    <div className="relative flex h-full min-h-screen items-center justify-center p-panel">
      {/* 背景渐变效果 */}
      <div className="color-bg">
        <div className="noise-bg" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* 主要内容卡片 */}
        <Card className="border-border/50 bg-card/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-6 text-center pb-4">
            {/* 警告图标 */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warning-background border border-warning/20">
              <AlertTriangle className="h-10 w-10 text-warning" />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-foreground">
                访问被拒绝
              </CardTitle>
              <p className="text-base text-muted-foreground">
                很抱歉，您没有权限访问此页面
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-card-box-content">
            {/* 尝试访问的页面信息 */}
            {attemptedPageName && (
              <div className="rounded-lg bg-warning-background border border-warning/10 p-card-box-content">
                <p className="text-sm text-warning-foreground">
                  <span className="font-medium">尝试访问：</span>
                  {attemptedPageName}
                </p>
              </div>
            )}

            {/* 原因说明 */}
            <div className="rounded-lg bg-muted/50 border border-border/50 p-card-box-content">
              <p className="font-medium text-sm text-foreground mb-3">可能的原因：</p>
              <ul className="space-y-list-item text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/60 mt-0.5">•</span>
                  你的账户权限不足
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/60 mt-0.5">•</span>
                  权限配置已发生变更
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/60 mt-0.5">•</span>
                  会话可能已过期
                </li>
              </ul>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGoBack}
                >
                  <ArrowLeft />
                  返回上页
                </Button>

                <Button
                  disabled={logout.isPending}
                  size="sm"
                  variant="default"
                  onClick={handleReLogin}
                >
                  <LogIn />
                  {logout.isPending ? '登出中...' : '重新登录'}
                </Button>
              </div>
            </div>

            {/* 帮助信息 */}
            <div className="text-center space-y-2 pt-4 border-t border-border/30">
              {attemptedPath && (
                <p className="text-xs font-mono text-muted-foreground/80 bg-muted/30 rounded px-2 py-1 inline-block">
                  {attemptedPath}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                如需帮助，请联系系统管理员
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
