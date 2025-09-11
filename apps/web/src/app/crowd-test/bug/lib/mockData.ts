import type { ListResponse } from '~/lib/api/types'

import type { BugItem, BugSeverity, BugStatus } from '../types'

import type { Options } from '~api/sdk.gen'
import type { PaginationMetaDto } from '~api/types.gen'

// ============================================================================
// MARK: Mock 数据生成与管理
// ============================================================================

/** 模块级缓存的 Mock 数据 */
let MOCK_BUGS: BugItem[] | null = null

/**
 * 生成固定数量的 Mock 漏洞数据
 */
function generateMockBugs(total: number): BugItem[] {
  const titles = [
    '越权访问导致敏感信息泄露',
    'JWT 未正确校验签名',
    'S3 存储桶权限配置错误',
    '弱口令导致账号被接管',
    '未授权的文件上传导致 RCE',
    '密码重置逻辑可被枚举',
    'GraphQL 信息泄露',
    'XSS 可通过 Markdown 注入',
    'SSRF 通过 PDF 解析触发',
    'CSRF 导致用户邮箱被篡改',
  ]

  const authors = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' },
    { id: 'u4', name: 'Diana' },
    { id: 'u5', name: 'Eve' },
  ]

  const statuses: BugStatus[] = ['pending', 'triaged', 'accepted', 'rejected', 'fixed']
  const severities: BugSeverity[] = ['low', 'medium', 'high', 'critical']

  const now = Date.now()
  const data: BugItem[] = []

  for (let i = 0; i < total; i += 1) {
    const title = titles[i % titles.length]
    const author = authors[i % authors.length]
    const status = statuses[i % statuses.length]
    const severity = severities[i % severities.length]
    const offsetMs = (i % 60) * 24 * 60 * 60 * 1000 + ((i * 37) % (24 * 60 * 60 * 1000))
    const createdAt = new Date(now - offsetMs).toISOString()
    const responded = i % 3 === 0
      ? new Date(new Date(createdAt).getTime() + ((i % 18) + 2) * 60 * 60 * 1000).toISOString()
      : undefined

    data.push({
      id: `bug_${i + 1}`,
      title: `${title} #${(i % 100) + 1}`,
      authorId: author.id,
      authorName: author.name,
      status,
      createdAt,
      severity,
      firstRespondedAt: responded,
    })
  }

  return data
}

/**
 * 确保 Mock 数据只被初始化一次
 */
export function ensureMockData(): BugItem[] {
  MOCK_BUGS ??= generateMockBugs(120)

  return MOCK_BUGS
}

/**
 * 解析对象中的查询参数
 */
function getQueryParam(obj: unknown, key: string): unknown {
  const record = obj as Record<string, unknown>
  const value = record[key]

  return value
}

/**
 * 模拟获取漏洞列表：支持分页、全局搜索、状态筛选、时间范围筛选
 * 注意：不实现排序
 */
export async function mockFetchBugs(options: Options): Promise<ListResponse<BugItem>> {
  const all = ensureMockData()

  // 基于查询参数过滤
  const query = (options as { query?: Record<string, unknown> }).query ?? {}
  const page = (query.page ?? 1) as number
  const pageSize = (query.pageSize ?? 10) as number

  const search = getQueryParam(query, 'search') as string | undefined
  const statusEq = getQueryParam(query, 'status[eq]') as BugStatus | undefined
  const statusIn = getQueryParam(query, 'status[in]') as BugStatus[] | string[] | undefined
  const createdBetween = getQueryParam(query, 'createdAt[between]') as [string | number, string | number] | undefined
  const titleContains = getQueryParam(query, 'title[contains]') as string | undefined
  const authorContains = getQueryParam(query, 'authorName[contains]') as string | undefined

  let filtered = all.slice()

  // 全局搜索：匹配标题或作者
  if (typeof search === 'string' && search.trim().length > 0) {
    const kw = search.trim().toLowerCase()
    filtered = filtered.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(kw)
      const inAuthor = item.authorName.toLowerCase().includes(kw)

      return inTitle || inAuthor
    })
  }

  // 标题 contains
  if (typeof titleContains === 'string' && titleContains.length > 0) {
    const kw = titleContains.toLowerCase()
    filtered = filtered.filter((item) => {
      return item.title.toLowerCase().includes(kw)
    })
  }

  // 作者 contains
  if (typeof authorContains === 'string' && authorContains.length > 0) {
    const kw = authorContains.toLowerCase()
    filtered = filtered.filter((item) => {
      return item.authorName.toLowerCase().includes(kw)
    })
  }

  // 状态 eq
  if (typeof statusEq === 'string') {
    filtered = filtered.filter((item) => {
      return item.status === statusEq
    })
  }

  // 状态 in
  if (Array.isArray(statusIn) && statusIn.length > 0) {
    const set = new Set(statusIn)
    filtered = filtered.filter((item) => {
      return set.has(item.status)
    })
  }

  // 创建时间 between（包含边界）
  if (Array.isArray(createdBetween)) {
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

  // 模拟网络延时
  await new Promise((resolve) => {
    setTimeout(resolve, 420)
  })

  return {
    code: 200,
    message: 'ok',
    data: pageRows,
    pagination,
  }
}
