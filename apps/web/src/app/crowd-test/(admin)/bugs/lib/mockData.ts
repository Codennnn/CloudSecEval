import { BugReportStatus } from '../../constants'

import { type BugReportSummaryDto, VulnerabilitySeverity } from '~api/types.gen'

// ============================================================================
// MARK: Mock 数据生成与管理
// ============================================================================

/** 模块级缓存的 Mock 数据 */
let MOCK_BUGS: BugReportSummaryDto[] | null = null

/**
 * 生成固定数量的 Mock 漏洞数据
 */
function generateMockBugs(total: number): BugReportSummaryDto[] {
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
    { id: 'u1', name: 'Alice', email: 'alice@example.com' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' },
    { id: 'u4', name: 'Diana' },
    { id: 'u5', name: 'Eve' },
  ]

  const statuses: BugReportStatus[] = [
    BugReportStatus.PENDING,
    BugReportStatus.IN_REVIEW,
    BugReportStatus.APPROVED,
    BugReportStatus.REJECTED,
    BugReportStatus.RESOLVED,
    BugReportStatus.CLOSED,
  ]
  const severities: VulnerabilitySeverity[] = [
    VulnerabilitySeverity.LOW,
    VulnerabilitySeverity.MEDIUM,
    VulnerabilitySeverity.HIGH,
    VulnerabilitySeverity.CRITICAL,
  ]

  const now = Date.now()
  const data: BugReportSummaryDto[] = []

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
      userId: author.id,
      user: {
        id: author.id,
        name: author.name,
        email: author.email ?? '',
      },
      status,
      createdAt,
      severity: severity,
      respondedAt: responded ?? undefined,
    })
  }

  return data
}

/**
 * 确保 Mock 数据只被初始化一次
 */
export function ensureMockData(): BugReportSummaryDto[] {
  MOCK_BUGS ??= generateMockBugs(120)

  return MOCK_BUGS
}
