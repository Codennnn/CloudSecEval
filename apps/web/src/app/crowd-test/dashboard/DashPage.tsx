'use client'

import { Activity, AlertTriangle, Clock, FileText, Shield, Users } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

// 模拟数据
const projectInfo = {
  name: '春季企业攻防演练',
  leader: '张三',
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

const onlineTesters = [
  { id: 1, name: '李明', team: '红队', status: '在线', avatar: 'LM' },
  { id: 2, name: '王芳', team: '蓝队', status: '在线', avatar: 'WF' },
  { id: 3, name: '陈强', team: '红队', status: '测试中', avatar: 'CQ' },
  { id: 4, name: '刘丽', team: '蓝队', status: '在线', avatar: 'LL' },
  { id: 5, name: '赵伟', team: '评估组', status: '分析中', avatar: 'ZW' },
]

const activityLogs = [
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

const coverageData = [
  { name: '已测试', value: 70, fill: '#10b981' },
  { name: '未测试', value: 30, fill: '#f59e0b' },
]

const assets = [
  { id: 1, name: 'Web应用服务器', tested: true, vulns: 8 },
  { id: 2, name: '数据库服务器', tested: true, vulns: 3 },
  { id: 3, name: '邮件系统', tested: false, vulns: 0 },
  { id: 4, name: '文件服务器', tested: true, vulns: 5 },
  { id: 5, name: '网络设备', tested: true, vulns: 2 },
  { id: 6, name: 'API网关', tested: false, vulns: 0 },
  { id: 7, name: '认证系统', tested: true, vulns: 4 },
  { id: 8, name: '管理后台', tested: false, vulns: 0 },
]

const teams = [
  { name: '红队', online: 8, tasks: 15, color: '#ef4444' },
  { name: '蓝队', online: 6, tasks: 12, color: '#3b82f6' },
  { name: '评估组', online: 4, tasks: 8, color: '#8b5cf6' },
]

const workloadData = [
  { team: '红队', reports: 15, vulns: 28 },
  { team: '蓝队', reports: 12, vulns: 18 },
  { team: '评估组', reports: 8, vulns: 12 },
]

const personalRanking = [
  { name: '李明', reports: 8, vulns: 15, score: 92 },
  { name: '王芳', reports: 6, vulns: 12, score: 85 },
  { name: '陈强', reports: 7, vulns: 10, score: 82 },
  { name: '刘丽', reports: 5, vulns: 8, score: 78 },
  { name: '赵伟', reports: 4, vulns: 6, score: 75 },
]

// 迷你趋势数据（用于KPI卡片）
const riskTrend = [65, 66, 67, 68, 70, 72, 74, 73, 75, 76, 77, 78].map((v, i) => ({ idx: i, value: v }))
const vulnTrend = [40, 44, 47, 50, 52, 54, 55, 56, 57, 57, 58, 58].map((v, i) => ({ idx: i, value: v }))
const approveTrend = [10, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 25].map((v, i) => ({ idx: i, value: v }))

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'text-red-500'

    case 'medium':
      return 'text-orange-500'

    case 'low':
      return 'text-yellow-500'

    default:
      return 'text-blue-500'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case '在线':
      return 'bg-green-500'

    case '测试中':
      return 'bg-blue-500'

    case '分析中':
      return 'bg-orange-500'

    default:
      return 'bg-gray-500'
  }
}

/**
 * 企业攻防演练大屏仪表盘
 */
export function DashboardPage() {
  return (
    <div className="p-admin-content space-y-6">
      {/* 顶部横幅：项目信息与关键信息总览 */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-[oklch(96%_0_0deg)] to-[oklch(96%_0.03_210deg)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, oklch(70% 0.12 30deg) 0, transparent 40%), radial-gradient(circle at 80% 30%, oklch(70% 0.12 240deg) 0, transparent 40%)' }} />
        <div className="relative grid gap-6 p-6 lg:grid-cols-3">
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-foreground-accent">
              <Shield className="h-5 w-5" />
              <span className="text-sm">企业攻防演练</span>
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{projectInfo.name}</h2>
              <Badge>{projectInfo.status}</Badge>
            </div>
            <div className="mt-2 grid gap-1 text-sm text-muted-foreground @sm:grid-cols-2">
              <div>负责人：{projectInfo.leader}</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 opacity-70" />
                <span>时间：{projectInfo.startDate} 至 {projectInfo.endDate}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:justify-items-end">
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">风险评分</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-error">{projectInfo.riskScore}</span>
              </div>
              <div className="mt-2 h-10">
                <ChartContainer config={{ value: { label: '风险', color: 'oklch(57.7% 0.245 27.325deg)' } }}>
                  <AreaChart data={riskTrend}>
                    <Area dataKey="value" fill="oklch(96% 0.03 20deg)" stroke="oklch(57.7% 0.245 27.325deg)" strokeWidth={2} type="monotone" />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">漏洞总数</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{projectInfo.totalVulns}</span>
              </div>
              <div className="mt-2 h-10">
                <ChartContainer config={{ value: { label: '漏洞', color: 'oklch(48% 0.2 20deg)' } }}>
                  <LineChart data={vulnTrend}>
                    <Line dataKey="value" dot={false} stroke="oklch(48% 0.2 20deg)" strokeWidth={2} type="monotone" />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">报告通过</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-success">{projectInfo.reports.approved}</span>
              </div>
              <div className="mt-2 h-10">
                <ChartContainer config={{ value: { label: '通过', color: 'oklch(60.8% 0.172 155.46deg)' } }}>
                  <AreaChart data={approveTrend}>
                    <Area dataKey="value" fill="oklch(95% 0.06 150deg)" stroke="oklch(60.8% 0.172 155.46deg)" strokeWidth={2} type="monotone" />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 报告统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">待审核</p>
                <p className="text-2xl font-bold text-orange-500">{projectInfo.reports.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">已通过</p>
                <p className="text-2xl font-bold text-green-500">{projectInfo.reports.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">已拒绝</p>
                <p className="text-2xl font-bold text-red-500">{projectInfo.reports.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">已归档</p>
                <p className="text-2xl font-bold text-gray-500">{projectInfo.reports.archived}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分组标题：实时动态与覆盖监控 */}
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-foreground-accent">实时动态与覆盖监控</h3>
        <p className="mt-1 text-xs text-muted-foreground">左侧为实时测试动态，右侧为系统覆盖率与资产状态概览。</p>
      </div>

      {/* 中间区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 实时测试动态区 */}
        <div className="space-y-6">

          {/* 在线测试人员 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                在线测试人员
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onlineTesters.map((tester) => (
                  <div key={tester.id} className="flex items-center gap-3 rounded-md border p-2 hover:bg-accent/40 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs">{tester.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{tester.name}</p>
                      <p className="text-xs text-gray-600">{tester.team}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(tester.status)}`} />
                      <span className="text-xs text-gray-600">{tester.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 新报告提醒 */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                新报告提醒
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">高危漏洞报告</p>
                  <p className="text-xs text-orange-600">李明刚刚提交了Web服务器的高危漏洞报告</p>
                </div>
                <Badge variant="destructive">新</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 测试活动日志 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                测试活动日志
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                    <div className="text-xs text-gray-500 min-w-12">
                      {log.time}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{log.user}</span>
                        <span className={getSeverityColor(log.severity)}> {log.action}</span>
                      </p>
                      <p className="text-xs text-gray-600">目标：{log.target}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 测试覆盖度监控区 */}
        <div className="space-y-6">

          {/* 系统覆盖率 - 环形图 + 图例 + 中心标签 */}
          <Card>
            <CardHeader>
              <CardTitle>系统覆盖率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-64">
                <ChartContainer
                  config={{
                    tested: { label: '已测试', color: '#10b981' },
                    untested: { label: '未测试', color: '#f59e0b' },
                  }}
                >
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={coverageData}
                      dataKey="value"
                      endAngle={-270}
                      innerRadius={48}
                      outerRadius={78}
                      startAngle={90}
                    >
                      {coverageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" />
                  </PieChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-semibold">70%</div>
                    <div className="text-xs text-muted-foreground">已测试</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 资产列表 */}
          <Card>
            <CardHeader>
              <CardTitle>资产测试状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/40">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{asset.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={asset.tested ? 'default' : 'secondary'}>
                          {asset.tested ? '已测试' : '未测试'}
                        </Badge>
                        {asset.tested && (
                          <span className="text-xs text-red-500">
                            {asset.vulns} 个漏洞
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 分组标题：团队协作状态区 */}
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-foreground-accent">团队协作与贡献</h3>
        <p className="mt-1 text-xs text-muted-foreground">团队在线情况、工作量对比，以及个人贡献排行。</p>
      </div>

      {/* 团队协作状态区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 各团队在线状态 */}
        <Card>
          <CardHeader>
            <CardTitle>团队在线状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{team.online} 人在线</p>
                    <p className="text-xs text-gray-600">{team.tasks} 个任务</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 工作量统计 */}
        <Card>
          <CardHeader>
            <CardTitle>工作量统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer
                config={{
                  reports: { label: '报告数', color: '#3b82f6' },
                  vulns: { label: '漏洞数', color: '#ef4444' },
                }}
              >
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="reports" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="vulns" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* 个人工作量排行 */}
        <Card>
          <CardHeader>
            <CardTitle>个人工作量排行</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personalRanking.map((person, index) => (
                <div key={person.name} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{person.name}</p>
                    <p className="text-xs text-gray-600">
                      {person.reports}报告 · {person.vulns}漏洞
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-500">{person.score}</p>
                    <p className="text-xs text-gray-600">分</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
