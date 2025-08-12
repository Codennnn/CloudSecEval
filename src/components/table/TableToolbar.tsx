import { useEvent } from 'react-use-event-hook'

import { ListFilterIcon, PlusIcon, TrashIcon } from 'lucide-react'

import { SearchConditions } from '~/components/advanced-search/SearchConditions'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { useSearchBuilder } from '~/hooks/advanced-search/useSearchBuilder'
import type { QueryParams, SearchConfig, SearchField } from '~/types/advanced-search'
import { generateQueryParams, getDefaultOperatorByFieldType } from '~/utils/advanced-search/search-config'

interface TableToolbarProps {
  /** 可搜索的字段列表 */
  fields: SearchField[]
  /** 初始搜索配置 */
  initialConfig?: Partial<SearchConfig>
  /** 右侧内容 */
  right?: React.ReactNode

  /** 查询参数变更回调 */
  onQueryParamsChange?: (queryParams: QueryParams) => void
}

export function TableToolbar(props: TableToolbarProps) {
  const {
    fields,
    initialConfig,
    right,

    onQueryParamsChange,
  } = props

  const {
    config,
    addCondition,
    updateCondition,
    removeCondition,
    duplicateCondition,
    clearConditions,
    errors,
  } = useSearchBuilder({
    initialConfig,
    onChange: (config) => {
      const params = generateQueryParams(config)
      onQueryParamsChange?.(params)
    },
  })

  const handleAddCondition = useEvent(
    (fieldKey: SearchField['key']) => {
      const field = fields.find((f) => f.key === fieldKey)

      if (field) {
        // 根据字段类型获取默认操作符
        const defaultOperator = getDefaultOperatorByFieldType(field.type)
        addCondition(fieldKey, defaultOperator)
      }
    },
  )

  const hasConditions = config.conditions.length > 0

  return (
    <div className="flex items-center justify-end gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="secondary">
                  <ListFilterIcon />
                  {hasConditions && (
                    <Badge className="text-xs rounded-full">
                      {config.conditions.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                条件搜索 {hasConditions && `（${config.conditions.length} 个条件）`}
              </TooltipContent>
            </Tooltip>
          </div>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto min-w-[400px]">
          <div>
            <div className="flex items-center pb-4">
              <h4 className="text-sm font-medium">搜索条件</h4>

              <div className="flex items-center gap-2 ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <PlusIcon />
                      添加条件
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>选择字段</DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {fields.map((field) => (
                      <DropdownMenuItem
                        key={field.key}
                        className="px-3 py-2"
                        onClick={() => {
                          handleAddCondition(field.key)
                        }}
                      >
                        {field.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {hasConditions && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          clearConditions()
                        }}
                      >
                        <TrashIcon />
                      </Button>

                    </TooltipTrigger>

                    <TooltipContent>
                      清除所有条件
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
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
