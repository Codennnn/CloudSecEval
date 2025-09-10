'use client'

import { useEffect, useState } from 'react'

import { AlertCircleIcon, CheckCircleIcon, LoaderIcon } from 'lucide-react'

interface SaveStatusIndicatorProps {
  status: 'saving' | 'saved' | 'error' | 'idle'
  className?: string
}

export function SaveStatusIndicator(props: SaveStatusIndicatorProps) {
  const { status, className = '' } = props

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'saving' || status === 'saved' || status === 'error') {
      setVisible(true)

      // 保存成功后 2 秒隐藏
      if (status === 'saved') {
        const timer = setTimeout(() => {
          setVisible(false)
        }, 2000)

        return () => {
          clearTimeout(timer)
        }
      }
    }
    else {
      setVisible(false)
    }
  }, [status])

  if (!visible) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      {status === 'saving' && (
        <>
          <LoaderIcon className="size-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">保存中...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <CheckCircleIcon className="size-3 text-success" />
          <span className="text-success">已保存</span>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircleIcon className="size-3 text-error" />
          <span className="text-error">保存失败</span>
        </>
      )}
    </div>
  )
}
