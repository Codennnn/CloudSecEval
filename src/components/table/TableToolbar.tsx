import { useEvent } from 'react-use-event-hook'

import { ArrowUpDownIcon, Columns3CogIcon, ListFilterIcon, PlusIcon, TrashIcon } from 'lucide-react'

import { ColumnVisibilityControls } from '~/components/advanced-search/ColumnVisibilityControls'
import { FilterConditions } from '~/components/advanced-search/FilterConditions'
import { SortConditions } from '~/components/advanced-search/SortConditions'
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
import { useColumnVisibility } from '~/hooks/useColumnVisibility'
import type { ColumnVisibilityConfig, QueryParams, SearchConfig, SearchField } from '~/types/advanced-search'
import { generateQueryParams, getDefaultOperatorByFieldType } from '~/utils/advanced-search/search-config'

import { SortOrder } from '~api/types.gen'

interface TableToolbarProps {
  /** 可搜索的字段列表（带有 sortable 属性的字段同时支持排序） */
  fields: SearchField[]
  /** 初始搜索配置 */
  initialConfig?: Partial<SearchConfig>
  /** 右侧内容 */
  right?: React.ReactNode

  /** 查询参数变更回调 */
  onQueryParamsChange?: (queryParams: QueryParams) => void

  /** 列可见性存储键名，用于 localStorage 持久化 */
  columnVisibilityStorageKey?: string
  /** 初始列可见性配置 */
  initialColumnVisibility?: Partial<ColumnVisibilityConfig>
  /** 列可见性变化回调 */
  onColumnVisibilityChange?: (config: ColumnVisibilityConfig) => void
}

export function TableToolbar(props: TableToolbarProps) {
  const {
    fields,
    initialConfig,
    right,

    columnVisibilityStorageKey,
    initialColumnVisibility,
    onQueryParamsChange,
    onColumnVisibilityChange,
  } = props

  const {
    config,
    setConfig,
    addCondition,
    updateCondition,
    removeCondition,
    duplicateCondition,
    clearConditions,
    errors,
    addSortCondition,
    updateSortCondition,
    removeSortCondition,
    duplicateSortCondition,
    clearSortConditions,
  } = useSearchBuilder({
    initialConfig,
    onChange: (newConfig) => {
      const params = generateQueryParams(newConfig)
      onQueryParamsChange?.(params)
    },
  })

  // 列可见性管理
  const {
    visibleFields,
    hiddenFields,
    toggleFieldVisibility,
    reorderVisibleColumns,
    showAllColumns,
    resetToDefault: resetColumnVisibility,
    canHideField,
  } = useColumnVisibility({
    fields,
    storageKey: columnVisibilityStorageKey,
    initialConfig: initialColumnVisibility,
    onChange: onColumnVisibilityChange,
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

  const handleAddSortCondition = useEvent(
    (fieldKey: SearchField['key']) => {
      addSortCondition(fieldKey, SortOrder.ASC)
    },
  )

  const hasFilterConditions = config.filterConditions.length > 0
  const hasSortConditions = config.sortConditions.length > 0
  const hasHiddenColumns = hiddenFields.length > 0

  // 获取可排序的字段
  const sortableFields = fields.filter((field) => field.sortable !== false)

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex items-center gap-1">
        {/* MARK: 筛选功能 */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant={hasFilterConditions ? 'secondary' : 'ghost'}>
                    <ListFilterIcon />
                    {hasFilterConditions && (
                      <Badge className="text-xs rounded-full">
                        {config.filterConditions.length}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  条件筛选 {hasFilterConditions && `（${config.filterConditions.length} 个条件）`}
                </TooltipContent>
              </Tooltip>
            </div>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-auto min-w-[400px]">
            <div>
              <div className="flex items-center pb-4">
                <h4 className="text-sm font-medium">筛选条件</h4>

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

                  {hasFilterConditions && (
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

              <FilterConditions
                conditions={config.filterConditions}
                errors={errors}
                fields={fields}
                onDeleteCondition={removeCondition}
                onDuplicateCondition={duplicateCondition}
                onUpdateCondition={updateCondition}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* MARK: 排序功能 */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant={hasSortConditions ? 'secondary' : 'ghost'}>
                    <ArrowUpDownIcon />
                    {hasSortConditions && (
                      <Badge className="text-xs rounded-full">
                        {config.sortConditions.length}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  列表排序 {hasSortConditions && `（${config.sortConditions.length} 项排序）`}
                </TooltipContent>
              </Tooltip>
            </div>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-auto min-w-[400px]">
            <div>
              <div className="flex items-center pb-4">
                <h4 className="text-sm font-medium">排序条件</h4>

                <div className="flex items-center gap-2 ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <PlusIcon />
                        添加排序
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>选择字段</DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      {sortableFields.map((field) => (
                        <DropdownMenuItem
                          key={field.key}
                          className="px-3 py-2"
                          onClick={() => {
                            handleAddSortCondition(field.key)
                          }}
                        >
                          {field.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {hasSortConditions && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            clearSortConditions()
                          }}
                        >
                          <TrashIcon />
                        </Button>

                      </TooltipTrigger>

                      <TooltipContent>
                        清除所有排序
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              <SortConditions
                conditions={config.sortConditions}
                fields={sortableFields}
                onConditionsChange={(newConditions) => {
                  setConfig((prev) => ({
                    ...prev,
                    sortConditions: newConditions,
                  }))
                }}
                onDeleteCondition={removeSortCondition}
                onDuplicateCondition={duplicateSortCondition}
                onUpdateCondition={updateSortCondition}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* MARK: 列设置功能 */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant={hasHiddenColumns ? 'secondary' : 'ghost'}>
                    <Columns3CogIcon />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  列设置 {hasHiddenColumns && `（显示 ${visibleFields.length} / ${fields.length} 列）`}
                </TooltipContent>
              </Tooltip>
            </div>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-auto min-w-[350px]">
            <div>
              <div className="flex items-center pb-4">
                <h4 className="text-sm font-medium">列设置</h4>
              </div>

              <ColumnVisibilityControls
                allFields={fields}
                canHideField={canHideField}
                hiddenFields={hiddenFields}
                visibleFields={visibleFields}
                onReorder={reorderVisibleColumns}
                onReset={resetColumnVisibility}
                onShowAll={showAllColumns}
                onToggleVisibility={toggleFieldVisibility}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {right}
    </div>
  )
}
