'use client'

import { type RefObject, useImperativeHandle, useState } from 'react'

import { cn } from '~/lib/utils'

import { CKRichEditor } from './CKRichEditor'

interface RichTextEditorRef {
  /** 获取编辑器当前值 */
  getValue: () => string
  /** 设置编辑器值 */
  setValue: (value: string) => void
  /** 清空编辑器内容 */
  clear: () => void
}

export interface RichTextEditorProps {
  /** 编辑器的值 */
  value?: string
  /** 值变化时的回调函数 */
  onChange?: (value: string) => void
  /** 初始值（仅在非受控模式下使用） */
  defaultValue?: string
  /** 是否禁用编辑器 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 编辑器引用 */
  editorRef?: RefObject<RichTextEditorRef>
  /** 编辑器类 */
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
    editorRef,
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

  const getValue = () => currentValue

  const setValue = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
  }

  const clear = () => {
    const emptyValue = ''

    if (!isControlled) {
      setInternalValue(emptyValue)
    }

    if (onChange) {
      onChange(emptyValue)
    }
  }

  useImperativeHandle<RichTextEditorRef, RichTextEditorRef>(editorRef, () => ({
    getValue,
    setValue,
    clear,
  }))

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <CKRichEditor
        disabled={disabled}
        placeholder={placeholder}
        value={currentValue}
        onChange={handleEditorChange}
      />
    </div>
  )
}
