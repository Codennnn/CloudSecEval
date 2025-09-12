'use client'

import { BugListTable } from '../components/BugListTable'

import { BugStatsCards } from './components/BugStatsCards'
import { getBugListQueryKey, getBugListQueryOptions } from './lib/bugQueries'
import { ensureMockData } from './lib/mockData'

import { StatCardsContainer } from '~admin/components/StatCard'

export function BugPage() {
  const mockData = ensureMockData()

  return (
    <div className="p-admin-content">
      <StatCardsContainer gridConfig={{ default: 1, md: 2, lg: 3 }}>
        <BugStatsCards data={mockData} />
      </StatCardsContainer>

      <BugListTable
        className="@lg:mt-2"
        queryKeyFn={getBugListQueryKey}
        queryOptionsFn={getBugListQueryOptions}
        searchPlaceholder="搜索标题/作者"
        showActions={false}
        storageKey="bug-list-columns"
      />
    </div>
  )
}
