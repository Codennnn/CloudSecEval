/**
 * 任务状态枚举
 */
export enum TaskStatus {
  Pending = 'pending', // 待提报
  Processing = 'processing', // 处理中
  Approved = 'approved', // 已通过
  Rejected = 'rejected', // 已拒绝
}

/**
 * 任务状态显示配置
 */
export const taskStatusConfig = {
  [TaskStatus.Pending]: {
    label: '待提报',
    variant: 'warning' as const,
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  },
  [TaskStatus.Processing]: {
    label: '处理中',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  [TaskStatus.Approved]: {
    label: '已通过',
    variant: 'success' as const,
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  [TaskStatus.Rejected]: {
    label: '已拒绝',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
}

/**
 * 任务调度数据接口
 */
export interface TaskScheduleItem {
  id: string
  workOrderTitle: string // 工单标题
  titleCategory: string // 标题分类
  securityRequirement: string // 安全要求
  checkItem: string // 检查项
  assignedBy: string // 下发人
  status: TaskStatus // 状态
  createdAt: string // 创建时间
}

/**
 * Tab 类型
 */
export type TabType = 'security-requirement' | 'check-item' | 'in-progress'

/**
 * Tab 配置
 */
export const tabConfig = {
  'security-requirement': {
    label: '安全要求',
    searchPlaceholder: '输入安全要求',
  },
  'check-item': {
    label: '检查项',
    searchPlaceholder: '输入检查项',
  },
  'in-progress': {
    label: '汇总工单',
    searchPlaceholder: '输入关键字搜索',
  },
}

/**
 * Mock 数据 - 任务调度列表
 */
export const mockTaskScheduleData: TaskScheduleItem[] = [
  {
    id: '1',
    workOrderTitle: '1-系统开发与供应链安全',
    titleCategory: '资源分配',
    securityRequirement: '安全要求',
    checkItem: '测试',
    assignedBy: 'admin',
    status: TaskStatus.Pending,
    createdAt: '2025-09-16 05:48:32',
  },
  {
    id: '2',
    workOrderTitle: '1-系统开发与供应链安全',
    titleCategory: '资源分配',
    securityRequirement: '安全要求',
    checkItem: '邵家',
    assignedBy: '邵家',
    status: TaskStatus.Processing,
    createdAt: '2025-09-01 17:58:05',
  },
  {
    id: '3',
    workOrderTitle: '1-系统开发与供应链安全',
    titleCategory: '系统生命周期',
    securityRequirement: '安全要求',
    checkItem: 'admin',
    assignedBy: 'admin',
    status: TaskStatus.Processing,
    createdAt: '2025-09-01 17:58:05',
  },
  {
    id: '4',
    workOrderTitle: '2-系统与通信保护',
    titleCategory: '网络架构',
    securityRequirement: '安全要求',
    checkItem: '检查网络架构设计',
    assignedBy: '张三',
    status: TaskStatus.Approved,
    createdAt: '2025-08-28 14:22:10',
  },
  {
    id: '5',
    workOrderTitle: '3-访问控制',
    titleCategory: '身份认证',
    securityRequirement: '安全要求',
    checkItem: '验证身份认证机制',
    assignedBy: '李四',
    status: TaskStatus.Approved,
    createdAt: '2025-08-25 10:15:33',
  },
  {
    id: '6',
    workOrderTitle: '4-数据保护',
    titleCategory: '数据加密',
    securityRequirement: '安全要求',
    checkItem: '检查数据加密方案',
    assignedBy: '王五',
    status: TaskStatus.Approved,
    createdAt: '2025-08-20 16:45:22',
  },
  {
    id: '7',
    workOrderTitle: '5-配置管理',
    titleCategory: '配置基线',
    securityRequirement: '安全要求',
    checkItem: '审核配置基线文档',
    assignedBy: 'admin',
    status: TaskStatus.Rejected,
    createdAt: '2025-08-15 09:30:18',
  },
  {
    id: '8',
    workOrderTitle: '6-维护管理',
    titleCategory: '系统维护',
    securityRequirement: '安全要求',
    checkItem: '检查维护记录',
    assignedBy: '赵六',
    status: TaskStatus.Processing,
    createdAt: '2025-08-10 11:20:45',
  },
]
