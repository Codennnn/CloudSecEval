import { useMemo } from 'react'

import { ScaleIcon } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import type { FieldTypeEnum } from '~/constants/form'
import type { SearchOperator } from '~/types/advanced-search'
import { getOperatorConfig, getOperatorsByFieldType } from '~/utils/advanced-search/search-config'

/**
 * 操作符分组配置
 */
const OPERATOR_GROUPS: Record<string, { label: string, operators: SearchOperator[] }> = {
  equality: {
    label: '相等性',
    operators: ['eq', 'neq'],
  },
  inclusion: {
    label: '包含性',
    operators: ['in', 'notIn', 'contains', 'startsWith', 'endsWith'],
  },
  comparison: {
    label: '比较',
    operators: ['gt', 'gte', 'lt', 'lte', 'between'],
  },
  // pattern: {
  //   label: '模式匹配',
  //   operators: ['regex', 'ilike'],
  // },
  nullability: {
    label: '空值检查',
    operators: ['isNull', 'isNotNull'],
  },
}

interface SearchConditionOperatorSelectProps {
  /** 字段类型 */
  fieldType: FieldTypeEnum
  /** 当前选中的操作符 */
  value: SearchOperator | undefined
  /** 操作符变更回调 */
  onChange: (operator: SearchOperator) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符 */
  placeholder?: string
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
    onChange,
    disabled = false,
    placeholder = '选择操作符',
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
    const groups: { label: string, operators: typeof supportedOperators }[] = []

    Object.entries(OPERATOR_GROUPS).forEach(([, groupConfig]) => {
      const groupOperators = supportedOperators.filter((operator) =>
        groupConfig.operators.includes(operator.value),
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

  return (
    <Select
      disabled={disabled}
      value={value}
      onValueChange={(newValue) => { onChange(newValue as SearchOperator) }}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selectedOperatorConfig && (
            <div className="flex items-center gap-2">
              <ScaleIcon />
              <span>{selectedOperatorConfig.label}</span>
            </div>
          )}
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
