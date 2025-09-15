'use client'

import { BugListTable } from '../components/BugListTable'

import { BugStatsCards } from './components/BugStatsCards'
import { getBugListQueryKey, getBugListQueryOptions } from './lib/bugQueries'
import { ensureMockData } from './lib/mockData'

export function BugPage() {
  const mockData = ensureMockData()

  return (
    <div className="p-admin-content flex flex-col gap-admin-content">
      <BugStatsCards data={mockData} />

      <BugListTable
        queryKeyFn={getBugListQueryKey}
        queryOptionsFn={getBugListQueryOptions}
        searchPlaceholder="搜索标题/作者"
        showActions={false}
        storageKey="bug-list-columns"
      />
    </div>
  )
}
