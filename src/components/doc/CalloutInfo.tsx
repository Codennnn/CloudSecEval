import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  XCircleIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

interface CalloutInfoProps {
  type?: 'info' | 'warning' | 'error' | 'success'
  title?: React.ReactNode
  description?: string
}

export function CalloutInfo(props: React.PropsWithChildren<CalloutInfoProps>) {
  const { children, type = 'info', title, description } = props

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
        return '错误'

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
    <Alert className="not-first:mt-5 prose-p:m-0" variant={getVariant()}>
      {getIcon()}

      <AlertTitle>{title ?? getDefaultTitle()}</AlertTitle>

      <AlertDescription>
        {children ?? description}
      </AlertDescription>
    </Alert>
  )
}
