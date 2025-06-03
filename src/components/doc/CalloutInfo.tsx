import { useMemo } from 'react'

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

  const borderClass = useMemo(() => {
    switch (type) {
      case 'secondary':
        return 'bg-[var(--color-secondary)] outline-[var(--color-background)]'

      case 'info':
        return 'border-blue-500 bg-blue-500/10 outline-blue-500/30'

      case 'warning':
        return 'border-amber-500 bg-amber-500/10 outline-amber-500/30'

      case 'error':
        return 'border-red-500 bg-red-500/10 outline-red-500/30'

      case 'success':
        return 'border-green-500 bg-green-500/10 outline-green-500/30'
    }
  }, [type])

  const titleTextColor = useMemo(() => {
    switch (type) {
      case 'info':
        return 'text-blue-800 dark:text-blue-500'

      case 'warning':
        return 'text-amber-800 dark:text-amber-500'

      case 'error':
        return 'text-red-800 dark:text-red-500'

      case 'success':
        return 'text-green-800 dark:text-green-500'

      default:
        return 'text-foreground'
    }
  }, [type])

  const contentTextColor = useMemo(() => {
    switch (type) {
      case 'info':
        return 'text-blue-950 dark:text-blue-600'

      case 'warning':
        return 'text-amber-950 dark:text-amber-600'

      case 'error':
        return 'text-red-950 dark:text-red-600'

      case 'success':
        return 'text-green-950 dark:text-green-600'

      default:
        return 'text-foreground'
    }
  }, [type])

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
      case 'warning':
        // fall through

      case 'error':
        return '警告'

      default:
        return '提示'
    }
  }

  return (
    <Alert
      className={cn(
        'prose-strong:text-inherit prose-strong:font-medium prose-p:first:mt-0 prose-p:last:mb-0',
        'not-first:mt-5 outline -outline-offset-4',
        borderClass,
        titleTextColor,
      )}
      data-component="callout-info"
    >
      {getIcon()}

      <AlertTitle>{title ?? getDefaultTitle()}</AlertTitle>

      <AlertDescription className={contentTextColor}>
        {children ?? description}
      </AlertDescription>
    </Alert>
  )
}
