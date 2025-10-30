import { ActivityIcon, BookOpenIcon, Building2Icon, CheckCheckIcon, CheckCircleIcon, ClipboardListIcon, Clock3Icon, FileTextIcon, LibraryIcon, type LucideIcon, MapPinIcon, MessageSquareIcon, PencilIcon } from 'lucide-react'

import { SITE_CONFIG } from '~/constants/common'

/**
 * 云智评模块相关路由
 */
export enum CloudSecEvalRoutes {
  Root = '/cloud-sec-eval',
  RegulationAnalysis = '/cloud-sec-eval/regulation-analysis',
  ComplianceAssessment = '/cloud-sec-eval/compliance-assessment',
  RiskIdentification = '/cloud-sec-eval/risk-identification',
  ReportGeneration = '/cloud-sec-eval/report-generation',
  IntelligentQA = '/cloud-sec-eval/intelligent-qa',
  KnowledgeBase = '/cloud-sec-eval/knowledge-base',
  ITTemplate = '/cloud-sec-eval/it-template',
  TaskCreation = '/cloud-sec-eval/it-template/task-creation',
  TaskScheduling = '/cloud-sec-eval/it-template/task-scheduling',
  TaskFilling = '/cloud-sec-eval/it-template/task-filling',
  TaskReview = '/cloud-sec-eval/it-template/task-review',
  TaskTracking = '/cloud-sec-eval/it-template/task-tracking',
}

/**
 * 云智评模块首页路由
 */
export const cloudSecEvalHomeRoute = CloudSecEvalRoutes.RegulationAnalysis

/**
 * 云智评模块根路由
 */
export const cloudSecEvalRootRoute = CloudSecEvalRoutes.Root

/**
 * 导航项接口定义
 */
export interface CloudSecEvalNavItem {
  title: string
  url?: string
  icon?: LucideIcon
  type?: 'label' | 'menu-item'
  items?: CloudSecEvalNavItem[]
}

type CloudSecEvalNavConfig = Record<CloudSecEvalRoutes, CloudSecEvalNavItem>

/**
 * 云智评模块导航配置
 */
export const cloudSecEvalNavConfig: CloudSecEvalNavConfig = {
  [CloudSecEvalRoutes.Root]: {
    title: '云安全支撑与管理系统',
    url: CloudSecEvalRoutes.Root,
  },
  [CloudSecEvalRoutes.RiskIdentification]: {
    title: '统计概览',
    url: CloudSecEvalRoutes.RiskIdentification,
    icon: ActivityIcon,
  },
  [CloudSecEvalRoutes.RegulationAnalysis]: {
    title: '法规解析',
    url: CloudSecEvalRoutes.RegulationAnalysis,
    icon: BookOpenIcon,
  },
  [CloudSecEvalRoutes.ComplianceAssessment]: {
    title: '合规评估',
    url: CloudSecEvalRoutes.ComplianceAssessment,
    icon: CheckCircleIcon,
  },
  [CloudSecEvalRoutes.ReportGeneration]: {
    title: '报告生成',
    url: CloudSecEvalRoutes.ReportGeneration,
    icon: FileTextIcon,
  },
  [CloudSecEvalRoutes.IntelligentQA]: {
    title: '智能问答',
    url: CloudSecEvalRoutes.IntelligentQA,
    icon: MessageSquareIcon,
  },
  [CloudSecEvalRoutes.KnowledgeBase]: {
    title: '知识库',
    url: CloudSecEvalRoutes.KnowledgeBase,
    icon: LibraryIcon,
  },
  [CloudSecEvalRoutes.ITTemplate]: {
    title: '云评 IT 化管理',
    url: CloudSecEvalRoutes.ITTemplate,
    icon: Building2Icon,
    items: [
      {
        title: '任务创建台',
        url: CloudSecEvalRoutes.TaskCreation,
        icon: ClipboardListIcon,
      },
      {
        title: '任务调度台',
        url: CloudSecEvalRoutes.TaskScheduling,
        icon: Clock3Icon,
      },
      {
        title: '任务填报台',
        url: CloudSecEvalRoutes.TaskFilling,
        icon: PencilIcon,
      },
      {
        title: '任务审核台',
        url: CloudSecEvalRoutes.TaskReview,
        icon: CheckCheckIcon,
      },
      {
        title: '任务跟踪台',
        url: CloudSecEvalRoutes.TaskTracking,
        icon: MapPinIcon,
      },
    ],
  },
  [CloudSecEvalRoutes.TaskCreation]: {
    title: '任务创建台',
    url: CloudSecEvalRoutes.TaskCreation,
    icon: ClipboardListIcon,
  },
  [CloudSecEvalRoutes.TaskScheduling]: {
    title: '任务调度台',
    url: CloudSecEvalRoutes.TaskScheduling,
    icon: Clock3Icon,
  },
  [CloudSecEvalRoutes.TaskFilling]: {
    title: '任务填报台',
    url: CloudSecEvalRoutes.TaskFilling,
    icon: PencilIcon,
  },
  [CloudSecEvalRoutes.TaskReview]: {
    title: '任务审核台',
    url: CloudSecEvalRoutes.TaskReview,
    icon: CheckCheckIcon,
  },
  [CloudSecEvalRoutes.TaskTracking]: {
    title: '任务跟踪台',
    url: CloudSecEvalRoutes.TaskTracking,
    icon: MapPinIcon,
  },
}

/**
 * 创建导航项的辅助函数
 */
function createCloudSecEvalNavItem(route: CloudSecEvalRoutes): CloudSecEvalNavItem {
  return cloudSecEvalNavConfig[route]
}

/**
 * 主导航栏配置
 */
const cloudSecEvalNavMain: CloudSecEvalNavItem[] = [
  createCloudSecEvalNavItem(CloudSecEvalRoutes.RiskIdentification),
  createCloudSecEvalNavItem(CloudSecEvalRoutes.KnowledgeBase),
  createCloudSecEvalNavItem(CloudSecEvalRoutes.RegulationAnalysis),
  createCloudSecEvalNavItem(CloudSecEvalRoutes.ComplianceAssessment),
  createCloudSecEvalNavItem(CloudSecEvalRoutes.ReportGeneration),
  createCloudSecEvalNavItem(CloudSecEvalRoutes.ITTemplate),
  createCloudSecEvalNavItem(CloudSecEvalRoutes.IntelligentQA),
]

/**
 * 根据路由获取页面名称
 */
export function getPageNameByRoute(pathname: string): string {
  const route = Object.values(CloudSecEvalRoutes).find((r) => {
    return pathname === (r as string)
  })

  if (route) {
    return cloudSecEvalNavConfig[route].title
  }

  return '云安全支撑与管理系统'
}

/**
 * 生成页面标题
 */
export function generatePageTitle(route: CloudSecEvalRoutes): string {
  const pageTitle = cloudSecEvalNavConfig[route].title

  return pageTitle ? `${pageTitle} - ${SITE_CONFIG.name}` : SITE_CONFIG.name
}

/**
 * 获取导航配置的 Hook
 */
export function useCloudSecEvalNav() {
  return {
    navMain: cloudSecEvalNavMain,
  }
}
