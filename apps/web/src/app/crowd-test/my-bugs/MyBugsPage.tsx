'use client'

import { useRef } from 'react'

import { useRouter } from 'next/navigation'

import { type ProTableRef, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { ListResponse } from '~/lib/api/types'

import { BugListTable } from '../components/BugListTable'

import type { Options } from '~api/sdk.gen'
import type { PaginationMetaDto } from '~api/types.gen'

type BugStatus = 'pending' | 'triaged' | 'accepted' | 'rejected' | 'fixed'
type BugSeverity = 'low' | 'medium' | 'high' | 'critical'

interface MyBugItem {
  id: string
  title: string
  description: string
  severity: BugSeverity
  status: BugStatus
  tags: string[]
  createdAt: string
  updatedAt: string
}

let MOCK_MY_BUGS: MyBugItem[] | null = null

function ensureMockData(): MyBugItem[] {
  if (!MOCK_MY_BUGS) {
    const now = Date.now()
    const base: MyBugItem[] = Array.from({ length: 24 }).map((_, i) => {
      const severity: BugSeverity = (['low', 'medium', 'high', 'critical'] as const)[i % 4]
      const status: BugStatus = (['pending', 'triaged', 'accepted', 'rejected', 'fixed'] as const)[i % 5]
      const offset = i * 36 * 60 * 60 * 1000
      const createdAt = new Date(now - offset).toISOString()

      return {
        id: `mybug_${i + 1}`,
        title: `我发现的漏洞 #${i + 1}`,
        description: '这是一个示例描述，包含问题现象、影响范围与复现步骤。',
        severity,
        status,
        tags: i % 2 === 0 ? ['auth', 'api'] : ['ui'],
        createdAt,
        updatedAt: createdAt,
      }
    })
    MOCK_MY_BUGS = base
  }

  return MOCK_MY_BUGS
}

function getQueryParam<T = unknown>(obj: unknown, key: string): T | undefined {
  const record = obj as Record<string, unknown>

  return record?.[key] as T | undefined
}

async function mockListMyBugs(options: Options): Promise<ListResponse<MyBugItem>> {
  const all = ensureMockData()
  const query = (options as { query?: Record<string, unknown> }).query ?? {}
  const page = Number((query.page ?? 1) as number)
  const pageSize = Number((query.pageSize ?? 10) as number)

  const search = getQueryParam<string>(query, 'search')
  const statusEq = getQueryParam<BugStatus>(query, 'status[eq]')
  const severityEq = getQueryParam<BugSeverity>(query, 'severity[eq]')
  const createdBetween = getQueryParam<[string | number, string | number]>(query, 'createdAt[between]')

  let filtered = all.slice()

  if (typeof search === 'string' && search.trim() !== '') {
    const kw = search.trim().toLowerCase()
    filtered = filtered.filter((item) => {
      return item.title.toLowerCase().includes(kw) || item.description.toLowerCase().includes(kw)
    })
  }

  if (typeof statusEq === 'string') {
    filtered = filtered.filter((item) => item.status === statusEq)
  }

  if (typeof severityEq === 'string') {
    filtered = filtered.filter((item) => item.severity === severityEq)
  }

  if (Array.isArray(createdBetween) && createdBetween.length === 2) {
    const [startRaw, endRaw] = createdBetween
    const start = new Date(startRaw).getTime()
    const end = new Date(endRaw).getTime()
    filtered = filtered.filter((item) => {
      const ts = new Date(item.createdAt).getTime()

      return ts >= start && ts <= end
    })
  }

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIdx = (safePage - 1) * pageSize
  const endIdx = startIdx + pageSize
  const pageRows = filtered.slice(startIdx, endIdx)

  const pagination: PaginationMetaDto = {
    total,
    page: safePage,
    pageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  }

  await new Promise((r) => {
    setTimeout(r, 380)
  })

  return { code: 200, message: 'ok', data: pageRows, pagination }
}

async function mockDeleteMyBug(id: string): Promise<boolean> {
  const list = ensureMockData()
  const idx = list.findIndex((x) => x.id === id)

  if (idx < 0) {
    return false
  }

  list.splice(idx, 1)
  await new Promise((r) => {
    setTimeout(r, 200)
  })

  return true
}

async function mockSubmitMyBug(id: string): Promise<{ submitted: boolean }> {
  const list = ensureMockData()
  const idx = list.findIndex((x) => x.id === id)

  if (idx < 0) {
    return { submitted: false }
  }

  list[idx] = { ...list[idx], status: 'pending', updatedAt: new Date().toISOString() }
  await new Promise((r) => {
    setTimeout(r, 180)
  })

  return { submitted: true }
}

const getQueryKey: QueryKeyFn = (options: Options) => {
  return ['my-bugs', options.query]
}

const getQueryOptions: QueryOptionsFn<MyBugItem> = (options: Options) => {
  return {
    queryKey: [...getQueryKey(options)] as unknown[],
    queryFn: async () => {
      const res = await mockListMyBugs(options)

      return res
    },
  }
}

export function MyBugsPage() {
  const router = useRouter()

  const tableRef = useRef<ProTableRef<MyBugItem> | null>(null)

  const refreshList = async () => {
    await tableRef.current?.refresh()
  }

  const openEdit = (item: MyBugItem) => {
    router.push(`/crowd-test/bugs/${item.id}`)
  }

  return (
    <div className="p-admin-content">
      <BugListTable<MyBugItem>
        columnVisibilityStorageKey="my-bugs-columns"
        queryKeyFn={getQueryKey}
        queryOptionsFn={getQueryOptions}
        tableRef={tableRef}
        onDelete={async (item) => {
          await mockDeleteMyBug(item.id)
          void refreshList()
        }}
        onEdit={(item) => {
          openEdit(item)
        }}
        onSubmit={(item) => {
          void mockSubmitMyBug(item.id)
          void refreshList()
        }}
      />
    </div>
  )
}
