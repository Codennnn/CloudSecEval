export interface ActivityItem {
  id: string
  time: string
  user: string
  action: '提交漏洞报告' | '审核漏洞报告'
  title: string
  severity: '高危' | '中危' | '低危'
  status: '待审核' | '已通过' | '已拒绝'
}

export const projectInfo = {
  name: '企业攻防演练',
  startDate: '2024-03-01',
  endDate: '2024-03-15',
  status: '进行中',
  riskScore: 78,
  totalVulns: 58,
  unhandledVulns: 12,
  reports: {
    pending: 8,
    approved: 25,
    rejected: 3,
    archived: 15,
  },
}

export const activityLogs = [
  { id: 1, time: '14:32', action: '发现高危漏洞', user: '李明', target: 'Web服务器', severity: 'high' },
  { id: 2, time: '14:28', action: '提交测试报告', user: '王芳', target: '数据库服务', severity: 'medium' },
  { id: 3, time: '14:25', action: '开始渗透测试', user: '陈强', target: '邮件系统', severity: 'info' },
  { id: 4, time: '14:20', action: '发现中危漏洞', user: '刘丽', target: '文件服务器', severity: 'medium' },
  { id: 5, time: '14:15', action: '完成端口扫描', user: '赵伟', target: '网络设备', severity: 'info' },
  { id: 6, time: '14:10', action: '发现低危漏洞', user: '李明', target: '应用服务', severity: 'low' },
  { id: 7, time: '14:05', action: '开始漏洞验证', user: '王芳', target: 'API接口', severity: 'info' },
  { id: 8, time: '14:00', action: '提交测试报告', user: '陈强', target: '认证系统', severity: 'medium' },
  { id: 9, time: '13:55', action: '发现高危漏洞', user: '刘丽', target: '管理后台', severity: 'high' },
  { id: 10, time: '13:50', action: '完成资产识别', user: '赵伟', target: '业务系统', severity: 'info' },
]

// 角色-颜色映射（统一定义，不在数据中硬编码色号）
export const enum TeamRole {
  红 = '红',
  蓝 = '蓝',
}

export const roleColorMap: Record<string, string> = {
  [TeamRole.红]: '#ef4444',
  [TeamRole.蓝]: '#3b82f6',
}

export const teams = [
  { name: '红队 1', role: TeamRole.红, online: 8, tasks: 15 },
  { name: '红队 2', role: TeamRole.红, online: 7, tasks: 13 },
  { name: '红队 3', role: TeamRole.红, online: 9, tasks: 18 },
  { name: '蓝队 1', role: TeamRole.蓝, online: 6, tasks: 12 },
  { name: '蓝队 2', role: TeamRole.蓝, online: 8, tasks: 14 },
  { name: '蓝队 3', role: TeamRole.蓝, online: 5, tasks: 11 },
]

export const assets = [
  { id: 1, name: 'Web应用服务器', tested: true, vulns: 8 },
  { id: 2, name: '数据库服务器', tested: true, vulns: 3 },
  { id: 3, name: '邮件系统', tested: false, vulns: 0 },
  { id: 4, name: '文件服务器', tested: true, vulns: 5 },
  { id: 5, name: '网络设备', tested: true, vulns: 2 },
  { id: 6, name: 'API网关', tested: false, vulns: 0 },
  { id: 7, name: '认证系统', tested: true, vulns: 4 },
  { id: 8, name: '管理后台', tested: false, vulns: 0 },
]

// 从 teams 派生工作量数据，确保与队伍列表保持一致
const reportsByTeam: Record<string, number> = { 红队: 15, 蓝队: 12, 评估组: 8 }
const vulnsByTeam: Record<string, number> = { 红队: 28, 蓝队: 18, 评估组: 12 }

export const workloadData = teams.map((t) => ({
  team: t.name,
  role: t.role,
  reports: reportsByTeam[t.name] ?? Math.max(5, Math.round(t.online * 1.5)),
  vulns: vulnsByTeam[t.name] ?? Math.max(6, Math.round(t.online * 2)),
}))

export const personalRanking = [
  { name: '李明', reports: 8, vulns: 15, score: 92 },
  { name: '王芳', reports: 6, vulns: 12, score: 85 },
  { name: '陈强', reports: 7, vulns: 10, score: 82 },
  { name: '刘丽', reports: 5, vulns: 8, score: 78 },
  { name: '赵伟', reports: 4, vulns: 6, score: 75 },
]

// KPI 迷你趋势
export const riskTrend
  = [65, 66, 67, 68, 70, 72, 74, 73, 75, 76, 77, 78].map((v, i) => ({ idx: i, value: v }))
export const vulnTrend = [40, 44, 47, 50, 52, 54, 55, 56, 57, 57, 58, 58].map((v, i) => ({
  idx: i, value: v,
}))
export const approveTrend = [10, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 25].map((v, i) => ({
  idx: i, value: v,
}))

// 本地时间线活动数据（按时间从新到旧）
export const activityTimeline: ActivityItem[] = [
  { id: 'a1', time: '10:24', user: '李明', action: '提交漏洞报告', title: 'Web 服务器越权访问', severity: '高危', status: '待审核' },
  { id: 'a2', time: '10:12', user: '王楠', action: '审核漏洞报告', title: '接口敏感信息泄露', severity: '中危', status: '已通过' },
  { id: 'a3', time: '09:58', user: '赵强', action: '审核漏洞报告', title: '弱口令问题', severity: '低危', status: '已拒绝' },
  { id: 'a4', time: '09:40', user: '陈晓', action: '提交漏洞报告', title: 'SQL 注入', severity: '高危', status: '待审核' },
]
