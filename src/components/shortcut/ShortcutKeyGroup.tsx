import { useKeyboardShortcut } from '~/hooks/useKeyboardShortcut'

interface ShortcutKeyGroupProps {
  /** 快捷键配置数组 */
  shortcuts: {
    /** 快捷键的主键 */
    key: string
    /** 是否使用修饰键，默认为 true */
    useModifier?: boolean
    /** 快捷键触发时的回调函数 */
    onShortcut?: () => void
  }[]
  /** 是否启用快捷键监听，默认为 true */
  enableListener?: boolean
}

/**
 * 快捷键组合组件 - 用于管理多个快捷键的监听和显示
 *
 * 功能：
 * 1. 统一管理多个快捷键的事件监听
 * 2. 避免重复的事件监听器
 * 3. 提供批量快捷键配置
 *
 * @example
 * ```tsx
 * <ShortcutKeyGroup
 *   shortcuts={[
 *     { key: 'k', onShortcut: () => openSearch() },
 *     { key: 'i', onShortcut: () => openAnswer() },
 *     { key: 'Enter', useModifier: false, onShortcut: () => submit() }
 *   ]}
 * />
 * ```
 */
export function ShortcutKeyGroup(props: ShortcutKeyGroupProps) {
  const { shortcuts, enableListener = true } = props

  // 使用封装的键盘快捷键 Hook
  useKeyboardShortcut(shortcuts, { enableListener })

  // 这个组件主要用于事件监听，不需要渲染任何内容
  return null
}
