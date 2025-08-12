import { useMemo } from 'react'

import { ScaleIcon } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { type FieldTypeEnum, SearchOperatorEnum } from '~/constants/form'
import type { SearchOperator } from '~/types/advanced-search'
import { getOperatorConfig, getOperatorsByFieldType } from '~/utils/advanced-search/search-config'

/**
 * 操作符分组配置
 */
const OPERATOR_GROUPS: Record<string, { label: string, operators: SearchOperator[] }> = {
  equality: {
    label: '相等性',
    operators: [SearchOperatorEnum.EQ, SearchOperatorEnum.NEQ],
  },
  inclusion: {
    label: '包含性',
    operators: [
      SearchOperatorEnum.IN,
      SearchOperatorEnum.NOT_IN,
      SearchOperatorEnum.CONTAINS,
      SearchOperatorEnum.STARTS_WITH,
      SearchOperatorEnum.ENDS_WITH,
    ],
  },
  comparison: {
    label: '比较',
    operators: [
      SearchOperatorEnum.GT,
      SearchOperatorEnum.GTE,
      SearchOperatorEnum.LT,
      SearchOperatorEnum.LTE,
      SearchOperatorEnum.BETWEEN,
    ],
  },
  // pattern: {
  //   label: '模式匹配',
  //   operators: [SearchOperatorEnum.REGEX, SearchOperatorEnum.ILIKE],
  // },
  nullability: {
    label: '空值检查',
    operators: [SearchOperatorEnum.IS_NULL, SearchOperatorEnum.IS_NOT_NULL],
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
