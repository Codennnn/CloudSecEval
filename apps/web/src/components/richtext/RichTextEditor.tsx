'use client'

import { useState } from 'react'

import { cn } from '../../lib/utils'

import { CKRichEditor } from './CKRichEditor'

export interface RichTextEditorProps {
  /**
   * 编辑器的值（受控组件）
   */
  value?: string
  /**
   * 值变化时的回调函数
   */
  onChange?: (value: string) => void
  /**
   * 初始值（仅在非受控模式下使用）
   */
  defaultValue?: string
  /**
   * 是否禁用编辑器
   */
  disabled?: boolean
  /**
   * 占位符文本
   */
  placeholder?: string
  /**
   * 编辑器类名
   */
  className?: string
}

/**
 * 富文本编辑器组件
 * 支持受控和非受控两种模式，提供完整的表单组件功能
 */
export function RichTextEditor(props: RichTextEditorProps) {
  const {
    value,
    onChange,
    defaultValue = '',
    disabled = false,
    placeholder,
    className,
  } = props

  // 内部状态管理（非受控模式）
  const [internalValue, setInternalValue] = useState(defaultValue)

  // 判断是否为受控组件
  const isControlled = value !== undefined

  // 获取当前值
  const currentValue = isControlled ? value : internalValue

  /**
   * 处理编辑器内容变化
   */
  const handleEditorChange = (newValue: string) => {
    // 如果是非受控组件，更新内部状态
    if (!isControlled) {
      setInternalValue(newValue)
    }

    // 调用外部 onChange 回调
    if (onChange) {
      onChange(newValue)
    }
  }

  /**
   * 获取编辑器当前值（供外部调用）
   */
  const getValue = () => currentValue

  /**
   * 设置编辑器值（供外部调用，仅在非受控模式下有效）
   */
  const setValue = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
  }

  /**
   * 清空编辑器内容
   */
  const clear = () => {
    const emptyValue = ''

    if (!isControlled) {
      setInternalValue(emptyValue)
    }

    if (onChange) {
      onChange(emptyValue)
    }
  }

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <CKRichEditor
        value={currentValue}
        onChange={handleEditorChange}
      />
    </div>
  )
}
