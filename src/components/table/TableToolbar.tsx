import { useCallback, useEffect, useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { ListFilterIcon, PlusIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { useSearchBuilder } from '~/hooks/advanced-search/useSearchBuilder'
import type { SearchConfig, SearchField } from '~/types/advanced-search'

import { SearchConditions } from '../advanced-search/SearchConditions'

interface TableToolbarProps {
  /** 可搜索的字段列表 */
  fields: SearchField[]
  /** 初始搜索配置 */
  initialConfig?: Partial<SearchConfig>
  /** 查询参数变更回调 */
  onQueryParamsChange?: (queryParams: Record<string, any>) => void
  /** 搜索配置变更回调 */
  onConfigChange?: (config: SearchConfig) => void
  /** 最大条件数量 */
  maxConditions?: number
  /** 右侧内容 */
  right?: React.ReactNode
}

export function TableToolbar(props: TableToolbarProps) {
  const {
    fields,
    initialConfig,
    onQueryParamsChange,
    onConfigChange,
    right,
    maxConditions = 10,
  } = props

  const handleConfigChange = useEvent((newConfig: SearchConfig) => {
    onConfigChange?.(newConfig)
    const params = generateQueryParams()
    onQueryParamsChange?.(params)
  })

  // 使用搜索配置器 Hook
  const {
    config,
    addCondition,
    updateCondition,
    removeCondition,
    duplicateCondition,
    generateQueryParams,
    errors,
  } = useSearchBuilder({
    initialConfig,
    onChange: handleConfigChange,
    maxConditions,
  })

  /**
   * 处理添加条件
   */
  const handleAddCondition = useCallback(() => {
    if (fields.length > 0 && config.conditions.length < maxConditions) {
      // 添加第一个可用字段的条件
      addCondition(fields[0].key, 'eq')
    }
  }, [fields, config.conditions.length, maxConditions, addCondition])

  /**
   * 是否显示条件数量徽章
   */
  const showBadge = config.conditions.length > 0

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="secondary">
                  <ListFilterIcon />
                  {showBadge && (
                    <Badge className="text-xs rounded-full">
                      {config.conditions.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                条件搜索 {showBadge && `(${config.conditions.length} 个条件)`}
              </TooltipContent>
            </Tooltip>
          </div>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto min-w-[400px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">搜索条件</h4>
              <Button
                disabled={config.conditions.length >= maxConditions}
                size="sm"
                variant="outline"
                onClick={handleAddCondition}
              >
                <PlusIcon />
                添加条件
              </Button>
            </div>

            <SearchConditions
              conditions={config.conditions}
              errors={errors}
              fields={fields}
              onDeleteCondition={removeCondition}
              onDuplicateCondition={duplicateCondition}
              onUpdateCondition={updateCondition}
            />
          </div>
        </PopoverContent>
      </Popover>

      {right}
    </div>
  )
}
