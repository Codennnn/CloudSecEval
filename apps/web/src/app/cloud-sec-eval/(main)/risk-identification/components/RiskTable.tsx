import { useMemo } from 'react'

import { EyeIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import type { TableColumnDef } from '~/types/advanced-search'

import { ProTable } from '~/components/table/ProTable'

import type { RiskItem } from '../lib/types'
import { RISK_LEVEL_CONFIG, RISK_STATUS_CONFIG, RISK_TYPE_CONFIG } from '../lib/types'
import { formatDateTime } from '../lib/utils'

interface RiskTableProps {
  data: RiskItem[]
  onRowClick: (risk: RiskItem) => void
}

/**
 * 风险列表表格组件
 * 使用 ProTable 展示风险数据，支持搜索、筛选、排序
 */
export function RiskTable(props: RiskTableProps) {
  const { data, onRowClick } = props

  /**
   * 表格列定义
   */
  const columns = useMemo<TableColumnDef<RiskItem>[]>(() => {
    return [
      {
        id: 'name',
        accessorKey: 'name',
        header: '风险名称',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {RISK_TYPE_CONFIG[row.original.type].icon}
            </span>
            <div className="flex flex-col gap-0.5">
              <div className="font-medium max-w-[300px] truncate">
                {row.original.name}
              </div>
              {row.original.cvssScore && (
                <div className="text-xs text-muted-foreground">
                  CVSS: {row.original.cvssScore.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'level',
        accessorKey: 'level',
        header: '风险等级',
        cell: ({ row }) => {
          const config = RISK_LEVEL_CONFIG[row.original.level]
          return (
            <Badge
              className={cn(
                'font-medium',
                config.bgClass,
                config.textClass,
                config.borderClass,
              )}
              variant="outline"
            >
              {config.label}
            </Badge>
          )
        },
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: '风险类型',
        cell: ({ row }) => (
          <div className="text-sm">
            {RISK_TYPE_CONFIG[row.original.type].label}
          </div>
        ),
      },
      {
        id: 'affectedAssets',
        accessorKey: 'affectedAssets',
        header: '影响资产',
        cell: ({ row }) => {
          const assets = row.original.affectedAssets
          if (assets.length === 0) {
            return <span className="text-muted-foreground">-</span>
          }

          if (assets.length === 1) {
            return (
              <div className="text-sm max-w-[200px] truncate">
                {assets[0]}
              </div>
            )
          }

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm cursor-help">
                  <span className="font-medium">{assets.length}</span>
                  {' '}
                  个资产
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <div className="space-y-1">
                  {assets.map((asset, index) => (
                    <div key={index} className="text-xs">
                      {asset}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        },
        enableSorting: false,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => {
          const config = RISK_STATUS_CONFIG[row.original.status]
          return (
            <Badge variant={config.variant}>
              {config.label}
            </Badge>
          )
        },
      },
      {
        id: 'source',
        accessorKey: 'source',
        header: '来源',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground max-w-[150px] truncate">
            {row.original.source}
          </div>
        ),
      },
      {
        id: 'discoveredAt',
        accessorKey: 'discoveredAt',
        header: '发现时间',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {formatDateTime(row.original.discoveredAt)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onRowClick(row.original)
            }}
          >
            <EyeIcon className="mr-2 size-4" />
            查看详情
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ]
  }, [onRowClick])

  return (
    <div className="rounded-lg border bg-card">
      <ProTable<RiskItem>
        columns={columns}
        data={data}
        headerTitle="风险列表"
        paginationConfig={{
          showPagination: true,
          showPageSizeSelector: true,
          pageSizeOptions: [10, 20, 30, 50],
        }}
        toolbar={{
          showToolbar: true,
          showColumnControl: true,
        }}
      />
    </div>
  )
}

