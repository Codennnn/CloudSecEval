/**
 * 任务分项配置接口
 */
export interface TaskItemConfig {
  label: string
  value: string
  approver?: string
}

/**
 * 任务分项接口
 */
export interface TaskItem {
  id: string
  title: string
  difficulty: string
  requirement: string
  steps: string[]
  configs: TaskItemConfig[]
}

/**
 * 主任务接口
 */
export interface MainTask {
  id: string
  number: number
  title: string
  fullTitle: string
  items?: TaskItem[]
}

/**
 * 11个主任务的Mock数据
 */
export const mainTasks: MainTask[] = [
  {
    id: 'task-1',
    number: 1,
    title: '系统开发与供应链安全',
    fullTitle: '1-系统开发与供应链安全',
    items: [
      {
        id: '1-1',
        title: '资源分配',
        difficulty: '一般要求',
        requirement: 'a)开展评估应当根据所评估的等级保护对象的重要性程度、规模大小、技术、人力资源可能面临的风险等因素合理配置评估所需的资源。',
        steps: [
          '检查《中国联动计算机信息系统安全等级保护办法》，查看其是否明确分配安全等级保护所需的资源，包括：人力资源的配置、技术、设备、资金等资源的配置；',
          '在等级保护安全管理工作中，查看其是否根据安全等级保护对象的重要性程度、规模大小、技术、人力资源可能面临的风险等因素合理配置评估所需的资源；',
          '在具体工作计划中，对资源配置进行详细说明，查看其是否根据安全等级保护对象的重要性程度、规模大小、技术、人力资源可能面临的风险等因素合理配置评估所需的资源，涉及：人力资源的配置、技术、设备、资金等资源的配置。',
        ],
        configs: [
          {
            label: '操作用户',
            value: '网络部',
          },
          {
            label: '任务描述',
            value: 'ceahi',
          },
          {
            label: '权证材料',
            value: 'ceahi',
          },
        ],
      },
      {
        id: '1-2',
        title: '系统生命周期',
        difficulty: '一般要求',
        requirement: 'a)在等级保护对象建设过程中应当实施安全等级保护，遵循安全等级保护的基本要求，同步规划安全保护措施，同步建设安全保护设施，同步使用安全保护设施。',
        steps: [
          '检查《云管理办法》，查看其是否在系统生命周期中，将网络安全等级保护工作与系统的规划、设计、实施和运维等各个阶段同步进行；',
          '检查工作计划及相关文件，查看其是否在系统生命周期中，将网络安全等级保护工作与系统的规划、设计、实施和运维等各个阶段同步进行，同步规划安全保护措施，同步建设安全保护设施，同步使用安全保护设施；',
          '检查云服务商提供的合同及其他相关文件，查看其是否在系统生命周期中，将网络安全等级保护工作与系统的规划、设计、实施和运维等各个阶段同步进行，同步规划安全保护措施，同步建设安全保护设施，同步使用安全保护设施，并提供相应的方案、上线前测试报告、或已部署的安全保护设施的相关证明材料。',
        ],
        configs: [
          {
            label: '操作用户',
            value: '网络部',
          },
          {
            label: '任务描述',
            value: 'cehi',
          },
          {
            label: '权证材料',
            value: 'ce',
          },
        ],
      },
    ],
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

