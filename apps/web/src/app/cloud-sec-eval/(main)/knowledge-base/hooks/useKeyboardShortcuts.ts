import { useEffect } from 'react'

/**
 * 快捷键配置接口
 */
interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  handler: () => void
  description: string
}

/**
 * 键盘快捷键 Hook
 * @param shortcuts 快捷键配置数组
 * @param enabled 是否启用快捷键
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    /**
     * 处理键盘事件
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果焦点在输入框、文本域或可编辑元素上，不触发快捷键
      const target = event.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      const isEditable = target.isContentEditable

      if (tagName === 'input' || tagName === 'textarea' || isEditable) {
        // 只允许 Escape 键在输入框中触发
        if (event.key !== 'Escape') {
          return
        }
      }

      // 查找匹配的快捷键
      const matchedShortcut = shortcuts.find((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey

        return keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch
      })

      if (matchedShortcut) {
        event.preventDefault()
        matchedShortcut.handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts, enabled])
}

/**
 * 获取快捷键显示文本
 */
export function getShortcutText(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.ctrlKey) {
    parts.push('Ctrl')
  }

  if (shortcut.metaKey) {
    parts.push('⌘')
  }

  if (shortcut.shiftKey) {
    parts.push('Shift')
  }

  if (shortcut.altKey) {
    parts.push('Alt')
  }

  parts.push(shortcut.key.toUpperCase())

  return parts.join(' + ')
}

