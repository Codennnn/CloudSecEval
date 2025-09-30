'use client'

import { formatDate } from '@mono/utils'
import { useQuery } from '@tanstack/react-query'
import { CalendarIcon, CreditCard, Mail, User } from 'lucide-react'

import { CopyButton } from '~/components/CopyButton'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '~/components/ui/drawer'
import { Skeleton } from '~/components/ui/skeleton'

import { licenseControllerGetLicenseByIdOptions } from '~api/@tanstack/react-query.gen'

interface LicenseDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  licenseId: string | null
}

/**
 * 授权码详情抽屉组件
 */
export function LicenseDetailDrawer({
  open,
  onOpenChange,
  licenseId,
}: LicenseDetailDrawerProps) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    ...licenseControllerGetLicenseByIdOptions({
      path: { id: licenseId! },
    }),
    enabled: !!licenseId && open,
  })
  const license = data?.data

  const renderDetailRow = (
    icon: React.ReactNode,
    label: string,
    value: string | number | null | undefined,
    copyable?: boolean,
  ) => (
    <div className="flex items-start gap-3 py-3">
      <div className="text-muted-foreground flex size-5 items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-muted-foreground text-sm font-medium">{label}</div>
        <div className="flex items-center gap-2">
          {value
            ? (
                <>
                  <span className="text-sm">{value}</span>
                  {copyable && <CopyButton text={String(value)} />}
                </>
              )
            : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
        </div>
      </div>
    </div>
  )

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>授权码详情</DrawerTitle>
          <DrawerDescription>
            查看授权码的详细信息和使用统计
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-auto px-4 pb-6">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {license && !isLoading && !error && (
            <div className="space-y-1">
              {/* 基本信息 */}
              <div className="pb-2">
                <h3 className="text-base font-semibold">基本信息</h3>
              </div>

              {renderDetailRow(
                <CreditCard className="size-4" />,
                '授权码',
                license.code,
                true,
              )}

              {renderDetailRow(
                <Mail className="size-4" />,
                '邮箱',
                license.email,
              )}

              {license.remark && renderDetailRow(
                <User className="size-4" />,
                '备注',
                license.remark,
              )}

              {/* 购买信息 */}
              {license.purchaseAmount && (
                <>
                  <div className="pb-2 pt-6">
                    <h3 className="text-base font-semibold">购买信息</h3>
                  </div>

                  {renderDetailRow(
                    <CreditCard className="size-4" />,
                    '购买金额',
                    `¥${license.purchaseAmount}`,
                  )}
                </>
              )}

              {/* 时间信息 */}
              <div className="pb-2 pt-6">
                <h3 className="text-base font-semibold">时间信息</h3>
              </div>

              {license.expiresAt && renderDetailRow(
                <CalendarIcon className="size-4" />,
                '过期时间',
                formatDate(license.expiresAt),
              )}

              {license.createdAt && renderDetailRow(
                <CalendarIcon className="size-4" />,
                '创建时间',
                formatDate(license.createdAt),
              )}

              {license.updatedAt && renderDetailRow(
                <CalendarIcon className="size-4" />,
                '更新时间',
                formatDate(license.updatedAt),
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
