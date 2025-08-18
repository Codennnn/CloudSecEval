'use client'

import { ShieldOffIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { useLicenseInfo, useLicenseStore } from '~/stores/useLicenseStore'

/**
 * 授权信息弹出框组件
 * 显示当前用户的授权信息，并提供注销授权功能
 */
export function LicenseInfoPopover() {
  const { clearLicenseInfo } = useLicenseStore()
  const licenseInfo = useLicenseInfo()

  const handleClearLicense = () => {
    clearLicenseInfo()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="flex items-center gap-2"
          size="sm"
          variant="outline"
          onClick={() => { handleClearLicense() }}
        >
          <ShieldOffIcon className="size-4" />
          注销授权
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64">
        <div className="space-y-2">
          <h4 className="font-medium">授权信息</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">邮箱：</span>
              {licenseInfo?.email ?? '--'}
            </div>
            <div>
              <span className="font-medium">授权码：</span>
              {licenseInfo?.code ? `${licenseInfo.code.slice(0, 8)}...` : '--'}
            </div>
            {licenseInfo?.licenseId && (
              <div>
                <span className="font-medium">许可ID：</span>
                {licenseInfo.licenseId}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
