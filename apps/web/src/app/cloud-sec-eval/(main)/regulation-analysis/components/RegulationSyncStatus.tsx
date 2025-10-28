'use client'

import { useEffect, useState } from 'react'

import { ClockIcon, DatabaseIcon, RefreshCwIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { toast } from 'sonner'

/**
 * 法规库状态组件
 * 显示法规总数、最后更新时间、同步倒计时
 */
export function RegulationSyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(new Date(Date.now() - 2 * 60 * 60 * 1000)) // 2小时前
  const [nextSyncCountdown, setNextSyncCountdown] = useState(22 * 60 * 60) // 22小时（秒）

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setNextSyncCountdown((prev) => {
        return Math.max(0, prev - 1)
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  /**
   * 格式化倒计时
   */
  const formatCountdown = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }

  /**
   * 格式化时间
   */
  const formatTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    }
    if (hours < 24) {
      return `${hours}小时前`
    }
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }

  /**
   * 处理手动同步
   */
  const handleManualSync = async () => {
    setIsSyncing(true)

    // 模拟同步过程
    await new Promise((resolve) => {
      setTimeout(resolve, 2000)
    })

    setIsSyncing(false)
    setLastSyncTime(new Date())
    setNextSyncCountdown(24 * 60 * 60) // 重置为24小时

    toast.success('同步完成', {
      description: '新增 3 条法规，更新 5 条评估项',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>法规库状态</CardTitle>
        <CardDescription>
          法规数据自动同步，确保合规要求实时更新
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* 法规总数 */}
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/30">
              <DatabaseIcon className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">法规总数</div>
            </div>
          </div>

          {/* 最后更新时间 */}
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
              <ClockIcon className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatTime(lastSyncTime)}</div>
              <div className="text-sm text-muted-foreground">最后更新</div>
            </div>
          </div>

          {/* 下次同步倒计时 */}
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/30">
              <RefreshCwIcon className="size-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCountdown(nextSyncCountdown)}</div>
              <div className="text-sm text-muted-foreground">下次同步</div>
            </div>
          </div>
        </div>

        {/* 手动同步按钮 */}
        <div className="mt-4">
          <Button
            className="w-full"
            disabled={isSyncing}
            variant="outline"
            onClick={handleManualSync}
          >
            <RefreshCwIcon className={`mr-2 size-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? '同步中...' : '立即同步'}
          </Button>
        </div>

        {/* 说明文字 */}
        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/20 dark:text-blue-200">
          <p className="font-medium">💡 智能同步机制</p>
          <p className="mt-1 text-xs opacity-80">
            系统每24小时自动同步最新法规要求，确保合规评估标准与国家政策保持一致。
            法规同步周期从原15天缩短至1天，新增法规可在24小时内自动生效。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

