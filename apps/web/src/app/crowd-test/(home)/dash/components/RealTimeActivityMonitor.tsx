'use client'

import { ActivityIcon, AlertTriangleIcon, InfoIcon, ShieldCheckIcon } from 'lucide-react'

interface ActivityLog {
  id: number
  time: string
  action: string
  user: string
  target: string
  severity: 'high' | 'medium' | 'low' | 'info'
}

// 活动日志数据
const activityLogs: ActivityLog[] = [
  { id: 1, time: '14:32', action: '发现高危漏洞', user: '李明', target: 'Web服务器', severity: 'high' },
  { id: 2, time: '14:28', action: '提交测试报告', user: '王芳', target: '数据库服务', severity: 'medium' },
  { id: 3, time: '14:25', action: '开始渗透测试', user: '陈强', target: '邮件系统', severity: 'info' },
  { id: 4, time: '14:20', action: '发现中危漏洞', user: '刘丽', target: '文件服务器', severity: 'medium' },
  { id: 5, time: '14:15', action: '完成端口扫描', user: '赵伟', target: '网络设备', severity: 'info' },
  { id: 6, time: '14:10', action: '发现低危漏洞', user: '李明', target: '应用服务', severity: 'low' },
]

// 根据严重程度返回图标和颜色
const getSeverityConfig = (severity: ActivityLog['severity']) => {
  switch (severity) {
    case 'high':
      return {
        icon: <AlertTriangleIcon size={12} />,
        iconColor: 'text-red-400',
        pulseColor: 'bg-red-400/10',
        bgColor: 'bg-red-400/5',
      }

    case 'medium':
      return {
        icon: <ShieldCheckIcon size={12} />,
        iconColor: 'text-orange-400',
        pulseColor: 'bg-orange-400/10',
        bgColor: 'bg-orange-400/5',
      }

    case 'low':
      return {
        icon: <InfoIcon size={12} />,
        iconColor: 'text-yellow-400',
        pulseColor: 'bg-yellow-400/10',
        bgColor: 'bg-yellow-400/5',
      }

    case 'info':
      return {
        icon: <ActivityIcon size={12} />,
        iconColor: 'text-blue-400',
        pulseColor: 'bg-blue-400/10',
        bgColor: 'bg-blue-400/5',
      }

    default:
      return {
        icon: <InfoIcon size={12} />,
        iconColor: 'text-gray-400',
        pulseColor: 'bg-gray-400/10',
        bgColor: 'bg-gray-400/5',
      }
  }
}

// 获取严重程度徽标样式
const getSeverityBadge = (severity: ActivityLog['severity']) => {
  switch (severity) {
    case 'high':
      return { text: '高危', className: 'bg-red-500/10 text-red-400 border-red-400/20' }

    case 'medium':
      return { text: '中危', className: 'bg-orange-500/10 text-orange-400 border-orange-400/20' }

    case 'low':
      return { text: '低危', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20' }

    case 'info':
      return { text: '信息', className: 'bg-blue-500/10 text-blue-400 border-blue-400/20' }

    default:
      return { text: '未知', className: 'bg-gray-500/10 text-gray-400 border-gray-400/20' }
  }
}

export function RealTimeActivityMonitor() {
  return (
    <div className="space-y-3">
      {/* 实时状态指示器 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
        </div>
        <span className="text-xs text-green-400 font-medium">实时监测中</span>
      </div>

      {/* 活动列表 */}
      <div className="space-y-2">
        {activityLogs.map((log, index) => {
          const config = getSeverityConfig(log.severity)
          const badge = getSeverityBadge(log.severity)

          return (
            <div
              key={log.id}
              className={`
                relative p-3 rounded-lg
                ${config.bgColor}
                ${index === 0 ? 'bg-cyan-400/5' : ''}
              `}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* 状态图标 */}
                    <div className={`flex-shrink-0 p-1.5 rounded-full ${config.pulseColor} ${config.iconColor} mt-0.5`}>
                      {config.icon}
                    </div>

                    {/* 活动信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white/90 truncate">
                          {log.action}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span className="font-medium text-cyan-400">{log.user}</span>
                        <span>→</span>
                        <span className="truncate">{log.target}</span>
                      </div>
                    </div>
                  </div>

                  {/* 时间戳 */}
                  <div className="flex-shrink-0 text-xs text-white/50 font-mono">
                    {log.time}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
