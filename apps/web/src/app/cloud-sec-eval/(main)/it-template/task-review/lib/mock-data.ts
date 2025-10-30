/**
 * 任务审核项数据类型
 */
export interface TaskReviewItem {
  id: string
  workOrderTitle: string // 工单标题
  titleCategory: string // 标题分类
  securityRequirement: string // 安全要求
  fillingDepartment: string // 填写部门
  createdAt: string // 创建时间
}

/**
 * 任务审核 Mock 数据
 */
export const mockTaskReviewData: TaskReviewItem[] = [
  {
    id: '1',
    workOrderTitle: '数据库访问权限审核',
    titleCategory: '访问控制',
    securityRequirement: '最小权限原则',
    fillingDepartment: '技术部',
    createdAt: '2024-01-20 14:30:00',
  },
  {
    id: '2',
    workOrderTitle: '服务器安全配置检查',
    titleCategory: '系统运维保护',
    securityRequirement: '安全基线配置',
    fillingDepartment: '运维部',
    createdAt: '2024-01-20 13:45:00',
  },
  {
    id: '3',
    workOrderTitle: '应用程序漏洞扫描',
    titleCategory: '东西开发安全组建设',
    securityRequirement: '代码安全审计',
    fillingDepartment: '开发部',
    createdAt: '2024-01-20 11:20:00',
  },
  {
    id: '4',
    workOrderTitle: '网络防火墙规则审核',
    titleCategory: '网络安全',
    securityRequirement: '网络隔离策略',
    fillingDepartment: '网络部',
    createdAt: '2024-01-20 10:15:00',
  },
  {
    id: '5',
    workOrderTitle: '用户身份认证机制检查',
    titleCategory: '身份认证与授权',
    securityRequirement: '多因素认证',
    fillingDepartment: '安全部',
    createdAt: '2024-01-19 16:50:00',
  },
  {
    id: '6',
    workOrderTitle: '数据备份恢复测试',
    titleCategory: '业务连续性管理',
    securityRequirement: '备份策略执行',
    fillingDepartment: '运维部',
    createdAt: '2024-01-19 15:30:00',
  },
  {
    id: '7',
    workOrderTitle: '日志审计系统配置',
    titleCategory: '日志与监控',
    securityRequirement: '日志完整性保护',
    fillingDepartment: '技术部',
    createdAt: '2024-01-19 14:10:00',
  },
  {
    id: '8',
    workOrderTitle: '第三方供应商安全评估',
    titleCategory: '第三方安全管理',
    securityRequirement: '供应商安全审查',
    fillingDepartment: '采购部',
    createdAt: '2024-01-19 11:25:00',
  },
  {
    id: '9',
    workOrderTitle: '员工安全意识培训',
    titleCategory: '安全培训与意识',
    securityRequirement: '定期安全培训',
    fillingDepartment: '人力资源部',
    createdAt: '2024-01-19 09:40:00',
  },
  {
    id: '10',
    workOrderTitle: '物理机房访问控制检查',
    titleCategory: '物理安全',
    securityRequirement: '物理访问管理',
    fillingDepartment: '行政部',
    createdAt: '2024-01-18 16:20:00',
  },
  {
    id: '11',
    workOrderTitle: '系统补丁更新审核',
    titleCategory: '配置与补丁管理',
    securityRequirement: '及时补丁更新',
    fillingDepartment: '运维部',
    createdAt: '2024-01-18 14:55:00',
  },
  {
    id: '12',
    workOrderTitle: '敏感数据加密检查',
    titleCategory: '数据保护',
    securityRequirement: '数据加密传输',
    fillingDepartment: '技术部',
    createdAt: '2024-01-18 13:30:00',
  },
  {
    id: '13',
    workOrderTitle: '应急响应流程演练',
    titleCategory: '应急响应',
    securityRequirement: '应急预案执行',
    fillingDepartment: '安全部',
    createdAt: '2024-01-18 10:45:00',
  },
  {
    id: '14',
    workOrderTitle: '安全风险评估报告',
    titleCategory: '风险评估与内部监督',
    securityRequirement: '定期风险评估',
    fillingDepartment: '审计部',
    createdAt: '2024-01-17 15:10:00',
  },
  {
    id: '15',
    workOrderTitle: '访问日志审计分析',
    titleCategory: '审计',
    securityRequirement: '审计日志分析',
    fillingDepartment: '安全部',
    createdAt: '2024-01-17 11:30:00',
  },
  {
    id: '16',
    workOrderTitle: '云平台安全配置审核',
    titleCategory: '系统运维保护',
    securityRequirement: '云安全最佳实践',
    fillingDepartment: '云平台部',
    createdAt: '2024-01-17 09:20:00',
  },
  {
    id: '17',
    workOrderTitle: '代码安全审查',
    titleCategory: '东西开发安全组建设',
    securityRequirement: 'OWASP Top 10 检查',
    fillingDepartment: '开发部',
    createdAt: '2024-01-16 16:40:00',
  },
  {
    id: '18',
    workOrderTitle: '权限变更审批流程检查',
    titleCategory: '访问控制',
    securityRequirement: '权限审批机制',
    fillingDepartment: '安全部',
    createdAt: '2024-01-16 14:15:00',
  },
]

