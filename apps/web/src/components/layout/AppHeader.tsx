'use client'

import { DocBreadcrumbs } from '~/components/doc/DocBreadcrumbs'
import { SidebarToggleButton } from '~/components/layout/SidebarToggleButton'
import { Button } from '~/components/ui/button'
import { useOpenAuthDialog } from '~/stores/useAuthDialogStore'
import { useHasValidLicense } from '~/stores/useLicenseStore'

export function AppHeader() {
  const hasValidLicense = useHasValidLicense()
  const openAuthDialog = useOpenAuthDialog()

  /**
   * 处理授权按钮点击事件
   */
  const handleAuthClick = () => {
    openAuthDialog({
      title: '输入授权信息',
      description: '请输入你的邮箱和授权码来解锁付费内容',
      onSuccess: () => {
        // 授权成功后，组件会自动重新渲染并隐藏按钮
      },
    })
  }

  return (
    <div className="flex items-center gap-4 h-[var(--header-height)] px-[var(--content-padding)]">
      <SidebarToggleButton />

      {/* 面包屑导航 */}
      <DocBreadcrumbs className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap" />

      {hasValidLicense === false && (
        <Button
          size="sm"
          onClick={() => { handleAuthClick() }}
        >
          立即授权
        </Button>
      )}
    </div>
  )
}
