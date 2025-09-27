'use client'

import { type ReactElement, useEffect, useState } from 'react'

import { CalloutInfo } from '~/components/doc/CalloutInfo'

const publicEnvKeys: { key: string, value: string | undefined }[] = [
  {
    key: 'NODE_ENV', value: process.env.NODE_ENV,
  },
  {
    key: 'NEXT_PUBLIC_ORAMA_API_KEY',
    value: process.env.NEXT_PUBLIC_ORAMA_API_KEY,
  },
  {
    key: 'NEXT_PUBLIC_ORAMA_ENDPOINT',
    value: process.env.NEXT_PUBLIC_ORAMA_ENDPOINT,
  },
  {
    key: 'NEXT_PUBLIC_API_BASE',
    value: process.env.NEXT_PUBLIC_API_BASE,
  },
  {
    key: 'NEXT_PUBLIC_API_PROXY_SOURCE',
    value: process.env.NEXT_PUBLIC_API_PROXY_SOURCE,
  },
  {
    key: 'NEXT_PUBLIC_API_PROXY_DESTINATION',
    value: process.env.NEXT_PUBLIC_API_PROXY_DESTINATION,
  },
  {
    key: 'NEXT_PUBLIC_JWT_USE_COOKIE',
    value: process.env.NEXT_PUBLIC_JWT_USE_COOKIE,
  },
  {
    key: 'NEXT_PUBLIC_PROJECT_FLAG',
    value: process.env.NEXT_PUBLIC_PROJECT_FLAG,
  },
]

/**
 * 环境变量调试页。
 * - 统一采用卡片式布局与设计令牌（bg-card、text-card-foreground 等）。
 * - 避免早返回：在单一 JSX 树中条件渲染可访问或受限内容。
 */
export default function EnvDebugPage(): ReactElement {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // 访问控制：开发环境或特定项目标识允许访问
  const isAccessible
    = process.env.NODE_ENV === 'development'
      || process.env.NEXT_PUBLIC_PROJECT_FLAG === 'crowd-test'

  /**
   * 复制指定环境变量的值到剪贴板。
   */
  const handleCopy = async (key: string, value: string | undefined): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value ?? '')
      setCopiedKey(key)
    }
    catch {
      // 忽略异常：部分环境可能不支持 Clipboard API
    }
  }

  useEffect(() => {
    if (copiedKey === null) {
      return
    }

    const timer = setTimeout(() => {
      setCopiedKey(null)
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [copiedKey])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">环境变量调试</h1>
              <p className="text-muted-foreground mt-1">查看当前应用的环境变量配置</p>
            </div>
          </div>
        </div>

        {/* 受限或内容区域（统一 JSX 树内条件渲染） */}
        {!isAccessible
          ? (
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                <CalloutInfo title="访问受限" type="error">
                  <div className="space-y-3">
                    <p>此页面仅在开发环境或测试环境中可用。</p>

                    <div className="rounded-lg p-4 space-y-2 text-sm bg-accent text-accent-foreground/90">
                      <div>
                        <strong>当前环境:</strong>
                        {' '}
                        {publicEnvKeys.find((env) => env.key === 'NODE_ENV')?.value}
                      </div>
                      <div>
                        <strong>项目标识:</strong>
                        {' '}
                        {publicEnvKeys.find((env) => env.key === 'NEXT_PUBLIC_PROJECT_FLAG')?.value ?? '未设置'}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">要访问此页面，请确保：</p>
                    <ul className="text-sm space-y-1 ml-4 text-muted-foreground">
                      <li>• 在开发环境中运行 (NODE_ENV=development)</li>
                      <li>• 或设置项目标识为 crowd-test (NEXT_PUBLIC_PROJECT_FLAG=crowd-test)</li>
                    </ul>
                  </div>
                </CalloutInfo>
              </div>
            )
          : (
              <>
                {/* 环境变量列表 */}
                <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">环境变量列表</h2>
                    <p className="text-muted-foreground text-sm">
                      共找到 {publicEnvKeys.length} 个公开环境变量
                    </p>
                  </div>

                  <div className="space-y-3">
                    {publicEnvKeys.map((envVar) => (
                      <div
                        key={envVar.key}
                        className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-accent/40"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-medium">{envVar.key}</span>
                            <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                              公开
                            </span>
                            {envVar.value
                              ? (
                                  <span className="px-2 py-0.5 text-xs rounded bg-success-background text-success-foreground">已设置</span>
                                )
                              : (
                                  <span className="px-2 py-0.5 text-xs rounded bg-warning-background text-warning-foreground">未设置</span>
                                )}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono break-all">
                            {envVar.value ?? '(空)'}
                          </div>
                        </div>

                        <div aria-live="polite" className="shrink-0 flex items-center gap-2">
                          <button
                            aria-label={`复制 ${envVar.key} 值`}
                            className="px-2 py-1 rounded-md border text-xs hover:bg-accent hover:text-accent-foreground"
                            type="button"
                            onClick={() => { void handleCopy(envVar.key, envVar.value) }}
                          >
                            复制
                          </button>
                          {copiedKey === envVar.key
                            ? (
                                <span className="text-xs text-success">已复制</span>
                              )
                            : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 使用说明 */}
                <div className="space-y-4">
                  <CalloutInfo title="环境变量说明" type="info">
                    <p>
                      此页面仅显示以
                      <code className="px-1 py-0.5 rounded text-xs bg-accent text-accent-foreground">NEXT_PUBLIC_</code>
                      {' '}
                      开头的公开环境变量，这些变量可以在客户端安全访问。
                    </p>
                  </CalloutInfo>

                  <CalloutInfo title="安全提醒" type="warning">
                    请确保不要在生产环境中暴露敏感信息。此页面仅在开发和测试环境中可用。
                  </CalloutInfo>
                </div>
              </>
            )}
      </div>
    </div>
  )
}
