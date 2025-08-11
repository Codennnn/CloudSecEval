/**
 * Toast Hook
 * 使用 sonner 提供 toast 通知功能
 */

import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration }: ToastOptions) => {
    const message = title || description || ''
    const desc = title && description ? description : undefined

    if (variant === 'destructive') {
      return sonnerToast.error(message, {
        description: desc,
        duration,
      })
    }

    return sonnerToast.success(message, {
      description: desc,
      duration,
    })
  }

  return { toast }
}
