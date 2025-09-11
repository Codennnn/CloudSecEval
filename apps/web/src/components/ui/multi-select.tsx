import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { cva, type VariantProps } from 'class-variance-authority'
import { consola } from 'consola'
import { ChevronDownIcon, XIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Separator } from '~/components/ui/separator'
import { cn } from '~/lib/utils'

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva('m-1', {
  variants: {
    variant: {
      default: 'border-foreground/10 text-foreground bg-card hover:bg-card/80',
      secondary:
        'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive:
        'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      inverted: 'inverted',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

/**
 * Option interface for MultiSelect component
 */
interface MultiSelectOption {
  /** The text to display for the option. */
  label: string
  /** The unique value associated with the option. */
  value: string
  /** Optional icon component to display alongside the option. */
  icon?: React.ComponentType<{ className?: string }>
  /** Whether this option is disabled */
  disabled?: boolean
  /** Custom styling for the option */
  style?: {
    /** Custom badge color */
    badgeColor?: string
    /** Custom icon color */
    iconColor?: string
    /** Gradient background for badge */
    gradient?: string
  }
}

/**
 * Group interface for organizing options
 */
interface MultiSelectGroup {
  /** Group heading */
  heading: string
  /** Options in this group */
  options: MultiSelectOption[]
}

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects or groups to be displayed in the multi-select component.
   */
  options: MultiSelectOption[] | MultiSelectGroup[]
  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void

  /** The default selected values when the component mounts. */
  defaultValue?: string[]

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string

  /**
   * 视觉效果的动画持续时间（秒），例如徽章的弹跳动画
   * 可选，默认为 0（无动画）
   */
  animation?: number

  // animationConfig prop removed

  /**
   * 显示的最大项目数。超出的已选项目将被汇总显示
   * 可选，默认为 3
   */
  maxCount?: number

  /**
   * 弹出框的模态性。设置为 true 时，将禁用与外部元素的交互，
   * 只有弹出框内容对屏幕阅读器可见
   * 可选，默认为 false
   */
  modalPopover?: boolean

  /**
   * 如果为 true，则将多选组件渲染为另一个组件的子元素
   * 可选，默认为 false
   */
  asChild?: boolean

  /**
   * 应用自定义样式的额外类名
   * 可选，可用于添加自定义样式
   */
  className?: string

  /**
   * 如果为 true，则禁用全选功能
   * 可选，默认为 false
   */
  hideSelectAll?: boolean

  /**
   * 如果为 true，则在弹出框中显示搜索功能
   * 如果为 false，则完全隐藏搜索输入框
   * 可选，默认为 true
   */
  searchable?: boolean

  /**
   * 搜索无匹配结果时的自定义空状态消息
   * 可选，默认为"未找到结果"
   */
  emptyIndicator?: React.ReactNode

  /**
   * 如果为 true，则允许组件根据内容自动增长和收缩
   * 如果为 false，则使用固定宽度行为
   * 可选，默认为 false
   */
  autoSize?: boolean

  /**
   * 如果为 true，则在单行中显示徽章并支持水平滚动
   * 如果为 false，则徽章换行到多行
   * 可选，默认为 false
   */
  singleLine?: boolean

  /**
   * 弹出框内容的自定义 CSS 类
   * 可选，可用于自定义弹出框外观
   */
  popoverClassName?: string

  /**
   * 如果为 true，则完全禁用组件
   * 可选，默认为 false
   */
  disabled?: boolean

  /**
   * 不同屏幕尺寸的响应式配置
   * 允许根据视口自定义 maxCount 和其他属性
   * 可以是布尔值 true（使用默认响应式行为）或自定义配置对象
   */
  responsive?:
    | boolean
    | {
      /** 移动设备配置（< 640px） */
      mobile?: {
        maxCount?: number
        hideIcons?: boolean
        compactMode?: boolean
      }
      /** 平板设备配置（640px - 1024px） */
      tablet?: {
        maxCount?: number
        hideIcons?: boolean
        compactMode?: boolean
      }
      /** 桌面设备配置（> 1024px） */
      desktop?: {
        maxCount?: number
        hideIcons?: boolean
        compactMode?: boolean
      }
    }

  /**
   * 组件的最小宽度
   * 可选，默认根据内容自动调整大小
   * 设置后，组件不会收缩到此宽度以下
   */
  minWidth?: string

  /**
   * 组件的最大宽度
   * 可选，默认为容器的 100%
   * 组件不会超出容器边界
   */
  maxWidth?: string

  /**
   * 如果为 true，则自动根据选项值移除重复选项
   * 可选，默认为 false（在开发模式下显示警告）
   */
  deduplicateOptions?: boolean

  /**
   * 如果为 true，当 defaultValue 更改时组件将重置其内部状态
   * 对 React Hook Form 集成和表单重置功能很有用
   * 可选，默认为 true
   */
  resetOnDefaultValueChange?: boolean

  /**
   * 如果为 true，则在选择选项后自动关闭弹出框
   * 对单选类行为或移动端用户体验很有用
   * 可选，默认为 false
   */
  closeOnSelect?: boolean

  /**
   * 自定义搜索回调：仅通知外层搜索词变化（防抖后）。
   * 外层负责据此更新 options（本组件不再内部管理远程结果）。
   */
  onSearch?: (
    term: string,
  ) => void | Promise<void>

  /**
   * 外部控制的搜索加载状态。为 true 时在弹出层中展示“正在搜索…”。
   */
  isSearching?: boolean

  /**
   * 触发 onSearch 的最小字符数，默认 2。
   */
  minSearchChars?: number

  /**
   * 搜索防抖毫秒数，默认 300ms。
   */
  searchDebounceMs?: number

  /** 自定义“正在搜索…”指示 UI。 */
  renderSearchingIndicator?: React.ReactNode
}

/**
 * 通过 ref 暴露的命令式方法
 */
export interface MultiSelectRef {
  /**
   * 以编程方式将组件重置为默认值
   */
  reset: () => void
  /**
   * 获取当前选中的值
   */
  getSelectedValues: () => string[]
  /**
   * 以编程方式设置选中的值
   */
  setSelectedValues: (values: string[]) => void
  /**
   * 清除所有选中的值
   */
  clear: () => void
  /**
   * 聚焦组件
   */
  focus: () => void
}

export const MultiSelect = forwardRef<MultiSelectRef, MultiSelectProps>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = '选择选项',
      maxCount = 3,
      modalPopover = false,
      className,
      hideSelectAll = false,
      searchable = true,
      emptyIndicator,
      autoSize = false,
      singleLine = false,
      popoverClassName,
      disabled = false,
      responsive,
      minWidth,
      maxWidth,
      deduplicateOptions = false,
      resetOnDefaultValueChange = true,
      closeOnSelect = false,
      onSearch,
      minSearchChars = 2,
      searchDebounceMs = 300,
      renderSearchingIndicator,
      isSearching,
      ...props
    },
    ref,
  ) => {
    const [selectedValues, setSelectedValues]
      = useState<string[]>(defaultValue)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    const [searchValue, setSearchValue] = useState('')

    const [politeMessage, setPoliteMessage] = useState('')
    const [assertiveMessage, setAssertiveMessage] = useState('')
    const prevSelectedCount = useRef(selectedValues.length)
    const prevIsOpen = useRef(isPopoverOpen)
    const prevSearchValue = useRef(searchValue)

    const announce = useCallback(
      (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        if (priority === 'assertive') {
          setAssertiveMessage(message)
          setTimeout(() => {
            setAssertiveMessage('')
          }, 100)
        }
        else {
          setPoliteMessage(message)
          setTimeout(() => {
            setPoliteMessage('')
          }, 100)
        }
      },
      [],
    )

    const multiSelectId = useId()
    const listboxId = `${multiSelectId}-listbox`
    const triggerDescriptionId = `${multiSelectId}-description`
    const selectedCountId = `${multiSelectId}-count`

    const prevDefaultValueRef = useRef<string[]>(defaultValue)

    /** 搜索防抖定时器 */
    const searchTimerRef = useRef<number | null>(null)

    /**
     * 选项字典，确保当远程结果消失时仍能根据 value 正确渲染已选中的标签文案
     */
    const knownOptionsMapRef = useRef<Map<string, MultiSelectOption>>(new Map())

    const isGroupedOptions = useCallback(
      (
        opts: MultiSelectOption[] | MultiSelectGroup[],
      ): opts is MultiSelectGroup[] => {
        return opts.length > 0 && 'heading' in opts[0]
      },
      [],
    )

    const arraysEqual = useCallback(
      (a: string[], b: string[]): boolean => {
        if (a.length !== b.length) {
          return false
        }

        const sortedA = [...a].sort()
        const sortedB = [...b].sort()

        return sortedA.every((val, index) => val === sortedB[index])
      },
      [],
    )

    const resetToDefault = useCallback(() => {
      setSelectedValues(defaultValue)
      setIsPopoverOpen(false)
      setSearchValue('')
      onValueChange(defaultValue)
    }, [defaultValue, onValueChange])

    const buttonRef = useRef<HTMLButtonElement>(null)

    useImperativeHandle(
      ref,
      () => ({
        reset: resetToDefault,
        getSelectedValues: () => selectedValues,
        setSelectedValues: (values: string[]) => {
          setSelectedValues(values)
          onValueChange(values)
        },
        clear: () => {
          setSelectedValues([])
          onValueChange([])
        },
        focus: () => {
          if (buttonRef.current) {
            buttonRef.current.focus()
            const originalOutline = buttonRef.current.style.outline
            const originalOutlineOffset = buttonRef.current.style.outlineOffset
            buttonRef.current.style.outline = '2px solid hsl(var(--ring))'
            buttonRef.current.style.outlineOffset = '2px'
            setTimeout(() => {
              if (buttonRef.current) {
                buttonRef.current.style.outline = originalOutline
                buttonRef.current.style.outlineOffset = originalOutlineOffset
              }
            }, 1000)
          }
        },
      }),
      [resetToDefault, selectedValues, onValueChange],
    )

    const [screenSize, setScreenSize] = useState<
      'mobile' | 'tablet' | 'desktop'
    >('desktop')

    useEffect(() => {
      if (typeof window === 'undefined') {
        return
      }

      const handleResize = () => {
        const width = window.innerWidth

        if (width < 640) {
          setScreenSize('mobile')
        }
        else if (width < 1024) {
          setScreenSize('tablet')
        }
        else {
          setScreenSize('desktop')
        }
      }

      handleResize()
      window.addEventListener('resize', handleResize)

      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', handleResize)
        }
      }
    }, [])

    const getResponsiveSettings = () => {
      if (!responsive) {
        return {
          maxCount: maxCount,
          hideIcons: false,
          compactMode: false,
        }
      }

      if (responsive === true) {
        const defaultResponsive = {
          mobile: { maxCount: 2, hideIcons: false, compactMode: true },
          tablet: { maxCount: 4, hideIcons: false, compactMode: false },
          desktop: { maxCount: 6, hideIcons: false, compactMode: false },
        }
        const currentSettings = defaultResponsive[screenSize]

        return {
          maxCount: currentSettings.maxCount,
          hideIcons: currentSettings.hideIcons,
          compactMode: currentSettings.compactMode,
        }
      }

      const currentSettings = responsive[screenSize]

      return {
        maxCount: currentSettings?.maxCount ?? maxCount,
        hideIcons: currentSettings?.hideIcons ?? false,
        compactMode: currentSettings?.compactMode ?? false,
      }
    }

    const responsiveSettings = getResponsiveSettings()

    /**
     * 将分组或扁平化的选项统一转为扁平数组
     */
    const flattenOptions = useCallback(
      (input: MultiSelectOption[] | MultiSelectGroup[]): MultiSelectOption[] => {
        let result: MultiSelectOption[]

        if (input.length === 0) {
          result = []
        }
        else if (isGroupedOptions(input)) {
          result = input.flatMap((g) => g.options)
        }
        else {
          result = input
        }

        return result
      },
      [isGroupedOptions],
    )

    /**
     * 本地（props）全部可见选项（不含远程）
     */
    const getAllOptions = useCallback((): MultiSelectOption[] => {
      if (options.length === 0) {
        return []
      }

      let allOptions: MultiSelectOption[]

      if (isGroupedOptions(options)) {
        allOptions = options.flatMap((group) => group.options)
      }
      else {
        allOptions = options
      }

      const valueSet = new Set<string>()
      const duplicates: string[] = []
      const uniqueOptions: MultiSelectOption[] = []
      allOptions.forEach((option) => {
        if (valueSet.has(option.value)) {
          duplicates.push(option.value)

          if (!deduplicateOptions) {
            uniqueOptions.push(option)
          }
        }
        else {
          valueSet.add(option.value)
          uniqueOptions.push(option)
        }
      })

      if (process.env.NODE_ENV === 'development' && duplicates.length > 0) {
        const action = deduplicateOptions
          ? 'automatically removed'
          : 'detected'
        consola.warn(
          `MultiSelect: 重复的选项值 ${action === 'automatically removed' ? '已自动移除' : '已检测到'}: ${duplicates.join(
            ', ',
          )}. `
          + (deduplicateOptions
            ? '重复项已自动移除。'
            : '这可能导致意外行为。请考虑设置 \'deduplicateOptions={true}\' 或确保所有选项值都是唯一的。'),
        )
      }

      return deduplicateOptions ? uniqueOptions : allOptions
    }, [options, deduplicateOptions, isGroupedOptions])

    const getOptionByValue = useCallback(
      (value: string): MultiSelectOption | undefined => {
        // 先从已知字典中获取（包含远程与初始）
        const fromKnown = knownOptionsMapRef.current.get(value)
        let option = fromKnown

        option ??= getAllOptions().find((op) => op.value === value)

        return option
      },
      [getAllOptions],
    )

    /** 本地过滤（当未提供 onSearch 时使用） */
    const locallyFilteredOptions = useMemo(() => {
      if (!searchable || !searchValue) {
        return options
      }

      if (options.length === 0) {
        return []
      }

      if (isGroupedOptions(options)) {
        return options
          .map((group) => ({
            ...group,
            options: group.options.filter((option) => {
              const text = searchValue.toLowerCase()

              return (
                option.label.toLowerCase().includes(text)
                || option.value.toLowerCase().includes(text)
              )
            }),
          }))
          .filter((group) => group.options.length > 0)
      }

      const text = searchValue.toLowerCase()

      return options.filter((option) => {
        return (
          option.label.toLowerCase().includes(text)
          || option.value.toLowerCase().includes(text)
        )
      })
    }, [options, searchValue, searchable, isGroupedOptions])

    /** 选项字典以 props 为基更新（用于保持徽章文案） */
    useEffect(() => {
      const all = getAllOptions()

      if (all.length > 0) {
        const map = knownOptionsMapRef.current
        all.forEach((op) => {
          if (!map.has(op.value)) {
            map.set(op.value, op)
          }
        })
      }
    }, [getAllOptions])

    /** 仅通知外部搜索词变化（带防抖）。外部据此更新 options */
    useEffect(() => {
      if (!onSearch || !searchable) {
        return
      }

      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current)
        searchTimerRef.current = null
      }

      searchTimerRef.current = window.setTimeout(() => {
        const term = searchValue && searchValue.length >= minSearchChars ? searchValue : ''

        try {
          const maybePromise = onSearch(term)

          if (maybePromise && typeof (maybePromise as Promise<unknown>).then === 'function') {
            ;(maybePromise as Promise<unknown>).catch((err: unknown) => {
              if (process.env.NODE_ENV === 'development') {
                consola.error('MultiSelect: 外部搜索回调出错', err)
              }
            })
          }
        }
        catch (error) {
          if (process.env.NODE_ENV === 'development') {
            consola.error('MultiSelect: 外部搜索回调出错', error)
          }
        }
      }, searchDebounceMs)

      return () => {
        if (searchTimerRef.current) {
          window.clearTimeout(searchTimerRef.current)
          searchTimerRef.current = null
        }
      }
    }, [onSearch, searchable, searchValue, minSearchChars, searchDebounceMs])

    /** 最终展示：有 onSearch 时信任外部传入的 options；否则使用本地过滤 */
    const displayedOptions = useMemo(() => {
      if (onSearch) {
        return options
      }

      return locallyFilteredOptions
    }, [onSearch, options, locallyFilteredOptions])

    /** 是否存在可展示的选项（用于避免错误显示空状态） */
    const hasItems = useMemo(() => {
      const current = displayedOptions

      if (isGroupedOptions(current)) {
        return current.some((g) => g.options.length > 0)
      }

      return (current).length > 0
    }, [displayedOptions, isGroupedOptions])

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true)
      }
      else if (event.key === 'Backspace' && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues]
        newSelectedValues.pop()
        setSelectedValues(newSelectedValues)
        onValueChange(newSelectedValues)
      }
    }

    const toggleOption = (optionValue: string) => {
      if (disabled) {
        return
      }

      const option = getOptionByValue(optionValue)

      if (option?.disabled) {
        return
      }

      const newSelectedValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((value) => value !== optionValue)
        : [...selectedValues, optionValue]
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)

      if (closeOnSelect) {
        setIsPopoverOpen(false)
      }
    }

    const handleClear = () => {
      if (disabled) {
        return
      }

      setSelectedValues([])
      onValueChange([])
    }

    const handleTogglePopover = () => {
      if (disabled) {
        return
      }

      setIsPopoverOpen((prev) => !prev)
    }

    const toggleAll = () => {
      if (disabled) {
        return
      }

      const allOptions = getAllOptions().filter((option) => !option.disabled)

      if (selectedValues.length === allOptions.length) {
        handleClear()
      }
      else {
        const allValues = allOptions.map((option) => option.value)
        setSelectedValues(allValues)
        onValueChange(allValues)
      }

      if (closeOnSelect) {
        setIsPopoverOpen(false)
      }
    }

    useEffect(() => {
      if (!resetOnDefaultValueChange) {
        return
      }

      const prevDefaultValue = prevDefaultValueRef.current

      if (!arraysEqual(prevDefaultValue, defaultValue)) {
        if (!arraysEqual(selectedValues, defaultValue)) {
          setSelectedValues(defaultValue)
        }

        prevDefaultValueRef.current = [...defaultValue]
      }
    }, [defaultValue, selectedValues, arraysEqual, resetOnDefaultValueChange])

    const getWidthConstraints = () => {
      const defaultMinWidth = screenSize === 'mobile' ? '0px' : '200px'
      const effectiveMinWidth = minWidth ?? defaultMinWidth
      const effectiveMaxWidth = maxWidth ?? '100%'

      return {
        minWidth: effectiveMinWidth,
        maxWidth: effectiveMaxWidth,
        width: autoSize ? 'auto' : '100%',
      }
    }

    const widthConstraints = getWidthConstraints()

    useEffect(() => {
      if (!isPopoverOpen) {
        setSearchValue('')
      }
    }, [isPopoverOpen])

    useEffect(() => {
      const selectedCount = selectedValues.length
      const allOptions = getAllOptions()
      const totalOptions = allOptions.filter((opt) => !opt.disabled).length

      if (selectedCount !== prevSelectedCount.current) {
        const diff = selectedCount - prevSelectedCount.current

        if (diff > 0) {
          const addedItems = selectedValues.slice(-diff)
          const addedLabels = addedItems
            .map(
              (value) => allOptions.find((opt) => opt.value === value)?.label,
            )
            .filter(Boolean)

          if (addedLabels.length === 1) {
            announce(
              `已选择 ${addedLabels[0]}。共选择了 ${selectedCount}/${totalOptions} 个选项。`,
            )
          }
          else {
            announce(
              `已选择 ${addedLabels.length} 个选项。总共选择了 ${selectedCount}/${totalOptions} 个。`,
            )
          }
        }
        else if (diff < 0) {
          announce(
            `已移除选项。当前选择了 ${selectedCount}/${totalOptions} 个选项。`,
          )
        }

        prevSelectedCount.current = selectedCount
      }

      if (isPopoverOpen !== prevIsOpen.current) {
        if (isPopoverOpen) {
          announce(
            `下拉菜单已打开。共有 ${totalOptions} 个选项可用。使用方向键导航。`,
          )
        }
        else {
          announce('下拉菜单已关闭。')
        }

        prevIsOpen.current = isPopoverOpen
      }

      if (searchValue !== prevSearchValue.current) {
        if (searchValue && isPopoverOpen) {
          let filteredCount = 0

          const current = displayedOptions

          if (isGroupedOptions(current)) {
            filteredCount = current.reduce((sum, g) => sum + g.options.length, 0)
          }
          else {
            filteredCount = (current).length
          }

          announce(`搜索 "${searchValue}" 找到 ${filteredCount} 个选项`)
        }

        prevSearchValue.current = searchValue
      }
    }, [
      selectedValues,
      isPopoverOpen,
      searchValue,
      announce,
      getAllOptions,
      displayedOptions,
      isGroupedOptions,
      flattenOptions,
    ])

    return (
      <>
        <div className="sr-only">
          <div aria-atomic="true" aria-live="polite" role="status">
            {politeMessage}
          </div>
          <div aria-atomic="true" aria-live="assertive" role="alert">
            {assertiveMessage}
          </div>
        </div>

        <Popover
          modal={modalPopover}
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
        >
          <div className="sr-only" id={triggerDescriptionId}>
            多选下拉菜单。使用方向键导航，回车键选择，Escape键关闭。
          </div>
          <div aria-live="polite" className="sr-only" id={selectedCountId}>
            {selectedValues.length === 0
              ? '未选择任何选项'
              : `已选择 ${selectedValues.length} 个选项：${selectedValues
                .map((value) => getOptionByValue(value)?.label)
                .filter(Boolean)
                .join('、')}`}
          </div>

          <PopoverTrigger asChild>
            <Button
              ref={buttonRef}
              {...props}
              aria-controls={isPopoverOpen ? listboxId : undefined}
              aria-describedby={`${triggerDescriptionId} ${selectedCountId}`}
              aria-expanded={isPopoverOpen}
              aria-haspopup="listbox"
              aria-label={`多选组件：已选择 ${selectedValues.length}/${
                getAllOptions().length
              } 个选项。${placeholder}`}
              className={cn(
                'flex p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-transparent hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-auto',
                autoSize ? 'w-auto' : 'w-full',
                responsiveSettings.compactMode && 'min-h-8 text-sm',
                screenSize === 'mobile' && 'min-h-12 text-base',
                disabled && 'opacity-50 cursor-not-allowed',
                className,
              )}
              disabled={disabled}
              role="combobox"
              style={{
                ...widthConstraints,
                maxWidth: `min(${widthConstraints.maxWidth}, 100%)`,
              }}
              onClick={handleTogglePopover}
            >
              {selectedValues.length > 0
                ? (
                    <div className="flex justify-between items-center w-full">
                      <div
                        className={cn(
                          'flex items-center gap-1',
                          singleLine
                            ? 'overflow-x-auto multiselect-singleline-scroll'
                            : 'flex-wrap',
                          responsiveSettings.compactMode && 'gap-0.5',
                          singleLine && 'pb-1',
                        )}
                      >
                        {selectedValues
                          .slice(0, responsiveSettings.maxCount)
                          .map((value) => {
                            const option = getOptionByValue(value)
                            const IconComponent = option?.icon
                            const customStyle = option?.style

                            if (!option) {
                              return null
                            }

                            const badgeStyle: React.CSSProperties = {
                              ...(customStyle?.badgeColor && {
                                backgroundColor: customStyle.badgeColor,
                              }),
                              ...(customStyle?.gradient && {
                                background: customStyle.gradient,
                                color: 'white',
                              }),
                            }

                            return (
                              <Badge
                                key={value}
                                className={cn(
                                  '!m-0',
                                  multiSelectVariants({ variant }),
                                  customStyle?.gradient
                                  && 'text-white border-transparent',
                                  responsiveSettings.compactMode
                                  && 'text-xs px-1.5 py-0.5',
                                  screenSize === 'mobile'
                                  && 'max-w-[120px] truncate',
                                  singleLine && 'flex-shrink-0 whitespace-nowrap',
                                  '[&>svg]:pointer-events-auto',
                                )}
                                style={{
                                  ...badgeStyle,
                                }}
                              >
                                {IconComponent && !responsiveSettings.hideIcons && (
                                  <IconComponent
                                    className={cn(
                                      'size-4 mr-2',
                                      responsiveSettings.compactMode
                                      && 'size-3 mr-1',
                                      customStyle?.iconColor && 'text-current',
                                    )}
                                    {...(customStyle?.iconColor && {
                                      style: { color: customStyle.iconColor },
                                    })}
                                  />
                                )}

                                <span
                                  className={cn(
                                    screenSize === 'mobile' && 'truncate',
                                  )}
                                >
                                  {option.label}
                                </span>

                                {/**
                                 * 使用可聚焦的 span 充当移除控件，避免在触发器 Button 内部再嵌套 Button
                                 * （button 嵌套 button 会导致无效的 HTML 结构及 Next.js hydration 报错）。
                                 */}
                                <span
                                  aria-label={`移除 ${option.label}`}
                                  className="-mr-1 size-4 !p-0 rounded-sm inline-flex items-center justify-center cursor-pointer hover:bg-muted"
                                  role="button"
                                  tabIndex={0}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    toggleOption(value)
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault()
                                      event.stopPropagation()
                                      toggleOption(value)
                                    }
                                  }}
                                >
                                  <XIcon
                                    className={cn(
                                      'size-3',
                                      responsiveSettings.compactMode
                                      && 'size-2.5',
                                    )}
                                  />
                                </span>
                              </Badge>
                            )
                          })
                          .filter(Boolean)}
                        {selectedValues.length > responsiveSettings.maxCount && (
                          <Badge
                            className={cn(
                              '!m-0 bg-transparent text-foreground border-foreground/1',
                              multiSelectVariants({ variant }),
                              responsiveSettings.compactMode
                              && 'text-xs px-1.5 py-0.5',
                              singleLine && 'flex-shrink-0 whitespace-nowrap',
                              '[&>svg]:pointer-events-auto',
                            )}
                          >
                            {`+ ${
                              selectedValues.length - responsiveSettings.maxCount
                            } more`}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div
                          aria-label={`清除所有已选择的 ${selectedValues.length} 个选项`}
                          className="flex items-center justify-center size-4 mx-2 cursor-pointer text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation()
                            handleClear()
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              event.stopPropagation()
                              handleClear()
                            }
                          }}
                        >
                          <XIcon className="size-4" />
                        </div>
                        <Separator
                          className="flex min-h-6 h-full"
                          orientation="vertical"
                        />
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="h-4 mx-2 text-muted-foreground"
                        />
                      </div>
                    </div>
                  )
                : (
                    <div className="flex items-center justify-between w-full mx-auto">
                      <span className="text-sm text-muted-foreground mx-3">
                        {placeholder}
                      </span>
                      <ChevronDownIcon className="h-4 text-muted-foreground mx-2" />
                    </div>
                  )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            aria-label="可用选项"
            aria-multiselectable="true"
            className={cn(
              'w-auto p-0 border border-border bg-popover text-popover-foreground shadow-sm rounded-md',
              screenSize === 'mobile' && 'w-[85vw] max-w-[280px]',
              screenSize === 'tablet' && 'w-[70vw] max-w-md',
              screenSize === 'desktop' && 'min-w-[300px]',
              popoverClassName,
            )}
            id={listboxId}
            role="listbox"
            style={{
              maxWidth: `min(${widthConstraints.maxWidth}, 85vw)`,
              maxHeight: screenSize === 'mobile' ? '70vh' : '60vh',
              touchAction: 'manipulation',
            }}
            onEscapeKeyDown={() => { setIsPopoverOpen(false) }}
          >
            <Command shouldFilter={!onSearch}>
              {searchable && (
                <CommandInput
                  aria-describedby={`${multiSelectId}-search-help`}
                  aria-label="搜索可用选项"
                  placeholder="搜索选项..."
                  value={searchValue}
                  onKeyDown={handleInputKeyDown}
                  onValueChange={setSearchValue}
                />
              )}
              {searchable && (
                <div className="sr-only" id={`${multiSelectId}-search-help`}>
                  输入以筛选选项。使用方向键导航结果。
                </div>
              )}
              {isSearching && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {renderSearchingIndicator ?? '正在搜索...'}
                </div>
              )}
              <CommandList
                className={cn(
                  'max-h-[40vh] overflow-y-auto multiselect-scrollbar',
                  screenSize === 'mobile' && 'max-h-[50vh]',
                  'overscroll-behavior-y-contain',
                )}
              >
                {!hasItems && (
                  <CommandEmpty>
                    {emptyIndicator ?? '未找到结果。'}
                  </CommandEmpty>
                )}

                {!hideSelectAll && !searchValue && (
                  <CommandGroup>
                    <CommandItem
                      key="all"
                      aria-label={`全选 ${
                        getAllOptions().length
                      } 个选项`}
                      aria-selected={
                        selectedValues.length
                        === getAllOptions().filter((opt) => !opt.disabled).length
                      }
                      className="cursor-pointer"
                      role="option"
                      onSelect={toggleAll}
                    >
                      <Checkbox
                        aria-hidden="true"
                        checked={
                          selectedValues.length
                          === getAllOptions().filter((opt) => !opt.disabled).length
                        }
                        className="mr-2 pointer-events-none"
                        tabIndex={-1}
                      />
                      <span>
                        (全选
                        {getAllOptions().length > 20
                          ? ` - ${getAllOptions().length} 个选项`
                          : ''}
                        )
                      </span>
                    </CommandItem>
                  </CommandGroup>
                )}

                {isGroupedOptions(displayedOptions)
                  ? (
                      displayedOptions.map((group) => (
                        <CommandGroup key={group.heading} heading={group.heading}>
                          {group.options.map((option) => {
                            const isSelected = selectedValues.includes(
                              option.value,
                            )

                            return (
                              <CommandItem
                                key={option.value}
                                aria-disabled={option.disabled}
                                aria-label={`${option.label}${
                                  isSelected ? '，已选中' : '，未选中'
                                }${option.disabled ? '，已禁用' : ''}`}
                                aria-selected={isSelected}
                                className={cn(
                                  'cursor-pointer',
                                  option.disabled && 'opacity-50 cursor-not-allowed',
                                )}
                                disabled={option.disabled}
                                role="option"
                                onSelect={() => { toggleOption(option.value) }}
                              >
                                <Checkbox
                                  aria-hidden="true"
                                  checked={isSelected}
                                  className="mr-2 pointer-events-none"
                                  disabled={option.disabled}
                                  tabIndex={-1}
                                />
                                {option.icon && (
                                  <option.icon
                                    aria-hidden="true"
                                    className="mr-2 size-4 text-muted-foreground"
                                  />
                                )}
                                <span>{option.label}</span>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      ))
                    )
                  : (
                      <CommandGroup>
                        {displayedOptions.map((option) => {
                          const isSelected = selectedValues.includes(option.value)

                          return (
                            <CommandItem
                              key={option.value}
                              aria-disabled={option.disabled}
                              aria-label={`${option.label}${
                                isSelected ? '，已选中' : '，未选中'
                              }${option.disabled ? '，已禁用' : ''}`}
                              aria-selected={isSelected}
                              className={cn(
                                'cursor-pointer',
                                option.disabled && 'opacity-50 cursor-not-allowed',
                              )}
                              disabled={option.disabled}
                              role="option"
                              onSelect={() => { toggleOption(option.value) }}
                            >
                              <Checkbox
                                aria-hidden="true"
                                checked={isSelected}
                                className="mr-2 pointer-events-none"
                                disabled={option.disabled}
                                tabIndex={-1}
                              />
                              {option.icon && (
                                <option.icon
                                  aria-hidden="true"
                                  className="mr-2 size-4 text-muted-foreground"
                                />
                              )}
                              <span>{option.label}</span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </>
    )
  },
)

MultiSelect.displayName = 'MultiSelect'

export type { MultiSelectGroup, MultiSelectOption, MultiSelectProps }
