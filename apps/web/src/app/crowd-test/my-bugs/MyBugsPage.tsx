'use client'

import { useRef, useState } from 'react'

import { type ProTableRef, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
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

  await new Promise((r) => { setTimeout(r, 380) })

  return { code: 200, message: 'ok', data: pageRows, pagination }
}

async function mockCreateMyBug(data: Pick<MyBugItem, 'title' | 'description' | 'severity' | 'tags'>): Promise<MyBugItem> {
  const list = ensureMockData()
  const now = new Date().toISOString()
  const item: MyBugItem = {
    id: `mybug_${list.length + 1}`,
    title: data.title,
    description: data.description,
    severity: data.severity,
    status: 'pending',
    tags: data.tags ?? [],
    createdAt: now,
    updatedAt: now,
  }
  list.unshift(item)
  await new Promise((r) => { setTimeout(r, 260) })

  return item
}

async function mockUpdateMyBug(id: string, data: Partial<Pick<MyBugItem, 'title' | 'description' | 'severity' | 'tags'>>): Promise<MyBugItem | null> {
  const list = ensureMockData()
  const idx = list.findIndex((x) => x.id === id)

  if (idx < 0) { return null }

  list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() }
  await new Promise((r) => { setTimeout(r, 220) })

  return list[idx]
}

async function mockDeleteMyBug(id: string): Promise<boolean> {
  const list = ensureMockData()
  const idx = list.findIndex((x) => x.id === id)

  if (idx < 0) { return false }

  list.splice(idx, 1)
  await new Promise((r) => { setTimeout(r, 200) })

  return true
}

async function mockSubmitMyBug(id: string): Promise<{ submitted: boolean }> {
  const list = ensureMockData()
  const idx = list.findIndex((x) => x.id === id)

  if (idx < 0) { return { submitted: false } }

  list[idx] = { ...list[idx], status: 'pending', updatedAt: new Date().toISOString() }
  await new Promise((r) => { setTimeout(r, 180) })

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

interface EditState {
  id?: string
  title: string
  description: string
  severity: BugSeverity
  tagsText: string
}

function useEditState(): [EditState, (next: Partial<EditState>) => void, () => void] {
  const [state, setState] = useState<EditState>({ title: '', description: '', severity: 'medium', tagsText: '' })

  const update = (next: Partial<EditState>) => {
    setState((prev) => ({ ...prev, ...next }))
  }

  const reset = () => { setState({ title: '', description: '', severity: 'medium', tagsText: '' }) }

  return [state, update, reset]
}

// ============================================================================
// MARK: 页面
// ============================================================================

export function MyBugsPage() {
  const tableRef = useRef<ProTableRef<MyBugItem> | null>(null)
  const [edit, setEdit, resetEdit] = useEditState()
  const [formOpen, setFormOpen] = useState<boolean>(false)

  const refreshList = async () => {
    await tableRef.current?.refresh()
  }

  const openEdit = (item: MyBugItem) => {
    setEdit({
      id: item.id,
      title: item.title,
      description: item.description,
      severity: item.severity,
      tagsText: item.tags.join(', '),
    })
    setFormOpen(true)
  }

  async function handleSubmit(): Promise<void> {
    const tags = edit.tagsText.split(',').map((s) => s.trim()).filter(Boolean)

    if (!edit.id) {
      await mockCreateMyBug({
        title: edit.title,
        description: edit.description,
        severity: edit.severity,
        tags,
      })
    }
    else {
      await mockUpdateMyBug(edit.id, {
        title: edit.title,
        description: edit.description,
        severity: edit.severity,
        tags,
      })
    }

    setFormOpen(false)
    resetEdit()
    await refreshList()
  }

  return (
    <div className="p-admin-content">
      <BugListTable<MyBugItem>
        showActions
        queryKeyFn={getQueryKey}
        queryOptionsFn={getQueryOptions}
        searchPlaceholder="搜索标题/描述"
        storageKey="my-bugs-columns"
        tableRef={tableRef as unknown as React.RefObject<ProTableRef<MyBugItem> | null>}
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

      {formOpen && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>{edit.id ? '编辑漏洞' : '新建漏洞'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题</Label>
              <Input id="title" value={edit.title} onChange={(e) => { setEdit({ title: e.target.value }) }} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="severity">严重级别</Label>
              <Select
                value={edit.severity}
                onValueChange={(v) => {
                  setEdit({ severity: v as BugSeverity })
                }}
              >
                <SelectTrigger className="w-40" id="severity">
                  <SelectValue placeholder="选择级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="critical">严重</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">问题描述 / 复现步骤 / 影响</Label>
              <Textarea id="description" rows={8} value={edit.description} onChange={(e) => { setEdit({ description: e.target.value }) }} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">标签（逗号分隔）</Label>
              <Input id="tags" placeholder="auth, api" value={edit.tagsText} onChange={(e) => { setEdit({ tagsText: e.target.value }) }} />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false)
                resetEdit()
              }}
            >取消
            </Button>
            <Button onClick={() => { void handleSubmit() }}>{edit.id ? '保存' : '提交'}</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
