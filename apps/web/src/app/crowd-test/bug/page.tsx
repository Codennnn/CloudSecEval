'use client'

import type { ReactElement } from 'react'

import { ProTable } from '~/components/table/ProTable'

import { useBugColumns } from './components/BugColumns'
import { BugStatsCards } from './components/BugStatsCards'
import { getBugListQueryKey, getBugListQueryOptions } from './lib/bugQueries'
import { ensureMockData } from './lib/mockData'

import { StatCardsContainer } from '~admin/components/StatCard'

// ============================================================================
// MARK: 主页面组件
// ============================================================================

/**
 * 漏洞管理列表页（审核员视角）
 */
export default function BugPage(): ReactElement {
  const columns = useBugColumns()
  const mockData = ensureMockData()

  return (
    <div className="p-4 @container space-y-4">
      <StatCardsContainer gridConfig={{ default: 1, md: 2, lg: 3 }}>
        <BugStatsCards data={mockData} />
      </StatCardsContainer>

      <ProTable
        className="@lg:mt-2"
        columnVisibilityStorageKey="bug-list-columns"
        columns={columns}
        headerTitle="漏洞管理"
        paginationConfig={{
          pageSizeOptions: [10, 20, 30, 40, 50],
          showPageSizeSelector: true,
          showSelection: false,
        }}
        queryKeyFn={getBugListQueryKey}
        queryOptionsFn={getBugListQueryOptions}
        rowSelection={{
          enabled: false,
        }}
        toolbar={{
          search: {
            inputProps: { placeholder: '搜索标题/作者' },
          },
        }}
      />
    </div>
  )
}
