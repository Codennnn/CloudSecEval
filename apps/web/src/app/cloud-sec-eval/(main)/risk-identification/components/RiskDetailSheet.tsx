import { useState } from 'react'

import { AlertTriangleIcon, CalendarIcon, ClockIcon, FileTextIcon, ServerIcon, ShieldIcon, TagIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

import type { RiskItem } from '../lib/types'
import { RISK_LEVEL_CONFIG, RISK_STATUS_CONFIG, RISK_TYPE_CONFIG } from '../lib/types'
import { formatDateTime } from '../lib/utils'

interface RiskDetailSheetProps {
  risk: RiskItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * 风险详情侧栏组件
 * 展示风险的详细信息，包括描述、影响资产、攻击路径、修复建议等
 */
export function RiskDetailSheet(props: RiskDetailSheetProps) {
  const { risk, open, onOpenChange } = props
  const [notes, setNotes] = useState('')

  if (!risk) {
    return null
  }

  const levelConfig = RISK_LEVEL_CONFIG[risk.level]
  const statusConfig = RISK_STATUS_CONFIG[risk.status]
  const typeConfig = RISK_TYPE_CONFIG[risk.type]

  /**
   * 保存备注
   */
  const handleSaveNotes = () => {
    toast.success('备注已保存')
    setNotes('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-2xl">{typeConfig.icon}</span>
            <span className="flex-1">{risk.name}</span>
          </SheetTitle>
          <SheetDescription>
            风险详细信息和修复建议
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileTextIcon className="size-4" />
              基本信息
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">风险等级</div>
                <Badge
                  className={cn(
                    'font-medium',
                    levelConfig.bgClass,
                    levelConfig.textClass,
                    levelConfig.borderClass,
                  )}
                  variant="outline"
                >
                  {levelConfig.label}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">当前状态</div>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <TagIcon className="size-3" />
                  风险类型
                </div>
                <div className="text-sm font-medium">{typeConfig.label}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldIcon className="size-3" />
                  来源
                </div>
                <div className="text-sm font-medium">{risk.source}</div>
              </div>

              {risk.cvssScore && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">CVSS 评分</div>
                  <div className="text-sm font-medium">
                    {risk.cvssScore.toFixed(1)}
                    {' '}
                    / 10.0
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  发现时间
                </div>
                <div className="text-sm font-medium">
                  {formatDateTime(risk.discoveredAt)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 风险描述 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangleIcon className="size-4" />
              风险描述
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {risk.description}
            </p>
          </div>

          <Separator />

          {/* 影响资产 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ServerIcon className="size-4" />
              影响资产
              {' '}
              <span className="text-xs font-normal text-muted-foreground">
                (
                {risk.affectedAssets.length}
                {' '}
                个)
              </span>
            </h3>
            <div className="space-y-2">
              {risk.affectedAssets.map((asset, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-muted/50 px-3 py-2 text-sm font-mono"
                >
                  {asset}
                </div>
              ))}
            </div>
          </div>

          {/* 攻击路径（如果有） */}
          {risk.attackPath && risk.attackPath.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <ClockIcon className="size-4" />
                  攻击路径
                </h3>
                <div className="space-y-2">
                  {risk.attackPath.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* 修复建议 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ShieldIcon className="size-4" />
              修复建议
            </h3>
            <div className="rounded-lg border bg-muted/50 p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {risk.remediation}
              </pre>
            </div>
          </div>

          {/* 备注区域 */}
          {risk.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">已有备注</h3>
                <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                  {risk.notes}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* 添加备注 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">添加备注</h3>
            <Textarea
              className="min-h-[100px]"
              placeholder="输入备注信息..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <Button
              className="w-full"
              disabled={!notes.trim()}
              onClick={handleSaveNotes}
            >
              保存备注
            </Button>
          </div>

          {/* 时间信息 */}
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>发现时间：{risk.discoveredAt}</span>
              <span>更新时间：{risk.updatedAt}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

