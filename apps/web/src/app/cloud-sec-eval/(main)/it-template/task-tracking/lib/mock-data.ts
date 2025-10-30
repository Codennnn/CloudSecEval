/**
 * 任务跟踪统计数据类型
 */
export interface TaskTrackingStats {
  issued: number // 周下发数量
  processing: number // 处理中数量
  reviewing: number // 审核中数量
  completed: number // 已完成数量
  overdue: number // 已超时数量
}

/**
 * 任务跟踪项数据类型
 */
export interface TaskTrackingItem {
  id: string
  templateName: string // 模版名称
  stats: TaskTrackingStats // 统计数据
  total: number // 总计
}

/**
 * 任务跟踪 Mock 数据
 */
export const mockTaskTrackingData: TaskTrackingItem[] = [
  {
    id: '1',
    templateName: '东西开发安全组建设全',
    stats: {
      issued: 70,
      processing: 2,
      reviewing: 0,
      completed: 2,
      overdue: 1,
    },
    total: 81,
  },
  {
    id: '2',
    templateName: '系统运维保护',
    stats: {
      issued: 64,
      processing: 2,
      reviewing: 0,
      completed: 0,
      overdue: 0,
    },
    total: 66,
  },
  {
    id: '3',
    templateName: '访问控制',
    stats: {
      issued: 93,
      processing: 0,
      reviewing: 0,
      completed: 0,
      overdue: 0,
    },
    total: 82,
  },
  {
    id: '4',
    templateName: '数据保护',
    stats: {
      issued: 29,
      processing: 0,
      reviewing: 0,
      completed: 1,
      overdue: 0,
    },
    total: 30,
  },
  {
    id: '5',
    templateName: '应急管理',
    stats: {
      issued: 37,
      processing: 0,
      reviewing: 0,
      completed: 0,
      overdue: 0,
    },
    total: 37,
  },
  {
    id: '6',
    templateName: '排查管理',
    stats: {
      issued: 40,
      processing: 0,
      reviewing: 0,
      completed: 0,
      overdue: 0,
    },
    total: 40,
  },
  {
    id: '7',
    templateName: '应急响应',
    stats: {
      issued: 56,
      processing: 0,
      reviewing: 0,
      completed: 0,
      overdue: 0,
    },
    total: 56,
  },
  {
    id: '8',
    templateName: '审计',
    stats: {
      issued: 27,
      processing: 0,
      reviewing: 0,
      completed: 0,
      overdue: 0,
    },
    total: 27,
  },
  {
    id: '9',
    templateName: '风险评估与内部监督',
    stats: {
      issued: 32,
      processing: 0,
      reviewing: 0,
      completed: 0,
      overdue: 0,
    },
    total: 32,
  },
  {
    id: '10',
    templateName: '安全审核与人员',
    stats: {
      issued: 35,
      processing: 0,
      reviewing: 0,
      completed: 0,
      overdue: 0,
    },
    total: 35,
  },
  {
    id: '11',
    templateName: '配置与补丁管理',
    stats: {
      issued: 42,
      processing: 3,
      reviewing: 0,
      completed: 0,
      overdue: 0,
    },
    total: 42,
  },
  {
    id: '12',
    templateName: '网络安全',
    stats: {
      issued: 48,
      processing: 1,
      reviewing: 1,
      completed: 3,
      overdue: 0,
    },
    total: 53,
  },
  {
    id: '13',
    templateName: '物理安全',
    stats: {
      issued: 25,
      processing: 0,
      reviewing: 2,
      completed: 1,
      overdue: 0,
    },
    total: 28,
  },
  {
    id: '14',
    templateName: '身份认证与授权',
    stats: {
      issued: 38,
      processing: 2,
      reviewing: 1,
      completed: 2,
      overdue: 1,
    },
    total: 44,
  },
  {
    id: '15',
    templateName: '日志与监控',
    stats: {
      issued: 45,
      processing: 1,
      reviewing: 0,
      completed: 4,
      overdue: 0,
    },
    total: 50,
  },
  {
    id: '16',
    templateName: '安全培训与意识',
    stats: {
      issued: 20,
      processing: 0,
      reviewing: 0,
      completed: 1,
      overdue: 0,
    },
    total: 21,
  },
  {
    id: '17',
    templateName: '第三方安全管理',
    stats: {
      issued: 33,
      processing: 1,
      reviewing: 1,
      completed: 0,
      overdue: 0,
    },
    total: 35,
  },
  {
    id: '18',
    templateName: '业务连续性管理',
    stats: {
      issued: 28,
      processing: 0,
      reviewing: 0,
      completed: 2,
      overdue: 0,
    },
    total: 30,
  },
]

