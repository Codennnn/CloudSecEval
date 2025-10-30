/**
 * 主任务接口（复用任务创建台的数据结构）
 */
export interface MainTask {
  id: string
  number: number
  title: string
  fullTitle: string
}

/**
 * 任务填报状态枚举
 */
export enum TaskFillingStatus {
  PendingSubmit = 'pending-submit', // 待提交
  UnderReview = 'under-review', // 审核中
  Rejected = 'rejected', // 已拒绝
  Approved = 'approved', // 已通过
}

/**
 * 任务填报状态显示配置
 */
export const taskFillingStatusConfig = {
  [TaskFillingStatus.PendingSubmit]: {
    label: '待提交',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  [TaskFillingStatus.UnderReview]: {
    label: '审核中',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
  [TaskFillingStatus.Rejected]: {
    label: '已拒绝',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  [TaskFillingStatus.Approved]: {
    label: '已通过',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
}

/**
 * 任务填报数据接口
 */
export interface TaskFillingItem {
  id: string
  workOrderTitle: string // 工单标题
  titleCategory: string // 标题分类
  securityRequirement: string // 安全要求
  checkItem: string // 检查项
  assignedBy: string // 下发人
  status: TaskFillingStatus // 状态
  createdAt: string // 创建时间
}

/**
 * Mock 数据 - 任务填报列表
 */
export const mockTaskFillingData: TaskFillingItem[] = [
  // 待提交状态 - 3条
  {
    id: '1',
    workOrderTitle: '1-系统开发与供应链安全',
    titleCategory: '资源分配',
    securityRequirement: '安全要求',
    checkItem: '1、证实是否明确分配安全等级保护所需的资源',
    assignedBy: 'admin',
    status: TaskFillingStatus.PendingSubmit,
    createdAt: '2025-09-02 10:18:09',
  },
  {
    id: '2',
    workOrderTitle: '1-系统开发与供应链安全',
    titleCategory: '系统生命周期',
    securityRequirement: '安全要求',
    checkItem: '1、检查系统生命周期管理文档',
    assignedBy: 'admin',
    status: TaskFillingStatus.PendingSubmit,
    createdAt: '2025-09-01 15:30:22',
  },
  {
    id: '3',
    workOrderTitle: '2-系统与通信保护',
    titleCategory: '网络架构',
    securityRequirement: '安全要求',
    checkItem: '1、审核网络架构设计方案',
    assignedBy: '张三',
    status: TaskFillingStatus.PendingSubmit,
    createdAt: '2025-08-30 09:45:18',
  },

  // 审核中状态 - 3条
  {
    id: '4',
    workOrderTitle: '3-访问控制',
    titleCategory: '身份认证',
    securityRequirement: '安全要求',
    checkItem: '1、验证身份认证机制的有效性',
    assignedBy: '李四',
    status: TaskFillingStatus.UnderReview,
    createdAt: '2025-08-28 14:20:35',
  },
  {
    id: '5',
    workOrderTitle: '4-数据保护',
    titleCategory: '数据加密',
    securityRequirement: '安全要求',
    checkItem: '1、检查数据加密实施方案',
    assignedBy: '王五',
    status: TaskFillingStatus.UnderReview,
    createdAt: '2025-08-25 11:15:42',
  },
  {
    id: '6',
    workOrderTitle: '5-配置管理',
    titleCategory: '配置基线',
    securityRequirement: '安全要求',
    checkItem: '1、审核配置基线管理文档',
    assignedBy: 'admin',
    status: TaskFillingStatus.UnderReview,
    createdAt: '2025-08-22 16:50:28',
  },

  // 已拒绝状态 - 3条
  {
    id: '7',
    workOrderTitle: '6-维护管理',
    titleCategory: '系统维护',
    securityRequirement: '安全要求',
    checkItem: '1、检查系统维护记录的完整性',
    assignedBy: '赵六',
    status: TaskFillingStatus.Rejected,
    createdAt: '2025-08-20 10:30:15',
  },
  {
    id: '8',
    workOrderTitle: '7-应急响应',
    titleCategory: '应急预案',
    securityRequirement: '安全要求',
    checkItem: '1、评估应急响应预案的可行性',
    assignedBy: '孙七',
    status: TaskFillingStatus.Rejected,
    createdAt: '2025-08-18 13:25:50',
  },
  {
    id: '9',
    workOrderTitle: '8-审计',
    titleCategory: '审计日志',
    securityRequirement: '安全要求',
    checkItem: '1、审查审计日志记录机制',
    assignedBy: '周八',
    status: TaskFillingStatus.Rejected,
    createdAt: '2025-08-15 09:10:33',
  },

  // 已通过状态 - 3条
  {
    id: '10',
    workOrderTitle: '9-风险评估与持续监控',
    titleCategory: '风险评估',
    securityRequirement: '安全要求',
    checkItem: '1、检查风险评估报告的完整性',
    assignedBy: '吴九',
    status: TaskFillingStatus.Approved,
    createdAt: '2025-08-12 14:40:27',
  },
  {
    id: '11',
    workOrderTitle: '10-安全组织与人员',
    titleCategory: '人员管理',
    securityRequirement: '安全要求',
    checkItem: '1、验证安全人员资质和培训记录',
    assignedBy: '郑十',
    status: TaskFillingStatus.Approved,
    createdAt: '2025-08-10 11:20:18',
  },
  {
    id: '12',
    workOrderTitle: '11-物理与环境安全',
    titleCategory: '物理安全',
    securityRequirement: '安全要求',
    checkItem: '1、检查物理安全措施的实施情况',
    assignedBy: 'admin',
    status: TaskFillingStatus.Approved,
    createdAt: '2025-08-08 08:55:42',
  },
]

/**
 * 11个主任务的Mock数据（复用任务创建台的数据）
 */
export const mainTasks: MainTask[] = [
  {
    id: 'task-1',
    number: 1,
    title: '系统开发与供应链安全',
    fullTitle: '1-系统开发与供应链安全',
  },
  {
    id: 'task-2',
    number: 2,
    title: '系统与通信保护',
    fullTitle: '2-系统与通信保护',
  },
  {
    id: 'task-3',
    number: 3,
    title: '访问控制',
    fullTitle: '3-访问控制',
  },
  {
    id: 'task-4',
    number: 4,
    title: '数据保护',
    fullTitle: '4-数据保护',
  },
  {
    id: 'task-5',
    number: 5,
    title: '配置管理',
    fullTitle: '5-配置管理',
  },
  {
    id: 'task-6',
    number: 6,
    title: '维护管理',
    fullTitle: '6-维护管理',
  },
  {
    id: 'task-7',
    number: 7,
    title: '应急响应',
    fullTitle: '7-应急响应',
  },
  {
    id: 'task-8',
    number: 8,
    title: '审计',
    fullTitle: '8-审计',
  },
  {
    id: 'task-9',
    number: 9,
    title: '风险评估与持续监控',
    fullTitle: '9-风险评估与持续监控',
  },
  {
    id: 'task-10',
    number: 10,
    title: '安全组织与人员',
    fullTitle: '10-安全组织与人员',
  },
  {
    id: 'task-11',
    number: 11,
    title: '物理与环境安全',
    fullTitle: '11-物理与环境安全',
  },
]
