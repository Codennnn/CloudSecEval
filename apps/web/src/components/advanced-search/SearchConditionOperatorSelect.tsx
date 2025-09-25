import { useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import type { SelectProps } from '@radix-ui/react-select'
import { ScaleIcon } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { type FieldTypeEnum, operatorGroupConfig } from '~/constants/form'
import type { OperatorConfig, SearchOperator } from '~/types/advanced-search'
import { getOperatorConfig, getOperatorsByFieldType } from '~/utils/advanced-search/search-config'

type OnChange = (operator: SearchOperator) => void

interface SearchConditionOperatorSelectProps {
  /** 字段类型 */
  fieldType: FieldTypeEnum
  /** 当前选中的操作符 */
  value?: SearchOperator
  /** 是否禁用 */
  disabled?: SelectProps['disabled']
  /** 占位符 */
  placeholder?: string

  /** 操作符变更回调 */
  onChange?: OnChange
}

/**
 * 操作符选择组件
 *
 * 根据字段类型动态显示支持的操作符
 * 提供操作符描述和分组显示功能
 */
export function SearchConditionOperatorSelect(props: SearchConditionOperatorSelectProps) {
  const {
    fieldType,
    value,
    disabled = false,
    placeholder = '选择操作符',

    onChange,
  } = props

  /**
   * 获取支持的操作符
   */
  const supportedOperators = useMemo(() => {
    return getOperatorsByFieldType(fieldType)
  }, [fieldType])

  /**
   * 按分组组织操作符
   */
  const groupedOperators = useMemo(() => {
    const groups: { label: string, operators: OperatorConfig[] }[] = []

    Object.values(operatorGroupConfig).forEach((groupConfig) => {
      const groupOperators = supportedOperators.filter((operator) =>
        (groupConfig.operators as SearchOperator[]).includes(operator.value as SearchOperator),
      )

      if (groupOperators.length > 0) {
        groups.push({
          label: groupConfig.label,
          operators: groupOperators,
        })
      }
    })

    return groups
  }, [supportedOperators])

  /**
   * 获取当前选中操作符的配置
   */
  const selectedOperatorConfig = useMemo(() => {
    return value ? getOperatorConfig(value) : undefined
  }, [value])

  const handleChange = useEvent<OnChange>((newValue) => {
    onChange?.(newValue)
  })

  return (
    <Select
      disabled={disabled}
      value={value}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          <ScaleIcon />
          {selectedOperatorConfig?.label ?? '选择操作符'}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {groupedOperators.map((group, groupIndex) => (
          <div key={group.label}>
            {groupIndex > 0 && <Separator className="my-1" />}

            <div className="px-2 py-1.5">
              <div className="text-xs font-medium text-muted-foreground">
                {group.label}
              </div>
            </div>

            {group.operators.map((operator) => {
              return (
                <SelectItem key={operator.value} value={operator.value}>
                  {operator.label}
                </SelectItem>
              )
            })}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}
