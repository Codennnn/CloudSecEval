import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  XCircleIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { cn } from '~/lib/utils'

interface CalloutInfoProps {
  type?: 'secondary' | 'info' | 'warning' | 'error' | 'success'
  title?: React.ReactNode
  description?: string
}

export function CalloutInfo(props: React.PropsWithChildren<CalloutInfoProps>) {
  const { children, type = 'secondary', title, description } = props

  const getColor = () => {
    switch (type) {
      case 'secondary':
        return 'text-foreground bg-[var(--color-secondary)] outline-[var(--color-background)]'

      case 'info':
        return 'text-blue-500 border-blue-500 bg-blue-500/10 outline-blue-500/30'

      case 'warning':
        return 'text-amber-500 border-amber-500 bg-amber-500/10 outline-amber-500/30'

      case 'error':
        return 'text-red-500 border-red-500 bg-red-500/10 outline-red-500/30'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <InfoIcon />

      case 'warning':
        return <AlertTriangleIcon />

      case 'error':
        return <XCircleIcon />

      case 'success':
        return <CheckCircleIcon />

      default:
        return <InfoIcon />
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'info':
        return '提示'

      case 'warning':
        return '注意'

      case 'error':
        return '警告'

      case 'success':
        return '成功'

      default:
        return '提示'
    }
  }

  const getVariant = () => {
    return type === 'error' ? 'destructive' : 'default'
  }

  return (
    <Alert
      className={cn(
        'not-first:mt-5 prose-p:first:mt-0 prose-p:last:mb-0 outline -outline-offset-4',
        getColor(),
      )}
      variant={getVariant()}
    >
      {getIcon()}

      <AlertTitle>{title ?? getDefaultTitle()}</AlertTitle>

      <AlertDescription className="text-foreground">
        {children ?? description}
      </AlertDescription>
    </Alert>
  )
}
