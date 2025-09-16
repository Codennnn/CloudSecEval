import { consola } from 'consola'
import { BarChartIcon, BookUpIcon, FingerprintIcon, GaugeIcon, KeyIcon, type LucideIcon, NotebookTextIcon, SquareUserRoundIcon, UserIcon, UsersIcon } from 'lucide-react'

import { SITE_CONFIG } from '~/constants/common'
import { adminPermission } from '~/constants/permission'
import { matchPermission, type PermissionFlag } from '~/lib/permissions/matcher'
import { isCrowdTest } from '~/utils/platform'
import { isRouteMatch } from '~/utils/route'

import { useUserPermissions } from '~admin/stores/useUserStore'

/**
 * 管理后台相关路由（敏感信息）
 * 这些路径不应暴露到前端代码中
 */
export const enum AdminRoutes {
  Root = '/admini',
  Login = '/admini/login',
  Dashboard = '/admini/dashboard',
  Users = '/admini/users',
  Roles = '/admini/roles',
  Permissions = '/admini/permissions',
  Profile = '/admini/profile',
  Licenses = '/admini/licenses',
  Docs = '/admini/docs',
  Unauthorized = '/admini/unauthorized',

  CrowdTestDashboard = '/crowd-test/dashboard',
  CrowdTestBugs = '/crowd-test/bugs',
  CrowdTestBugsDetail = '/crowd-test/bugs/[bugReportId]',
  CrowdTestMyBugs = '/crowd-test/my-bugs',
  CrowdTestTeams = '/crowd-test/teams',
  CrowdTestTeamProfile = '/crowd-test/teams/[teamId]',
  CrowdTestRoles = '/crowd-test/roles',
}

interface AdminNavItem {
  title: string
  url: string
  icon?: LucideIcon
  /** 访问该导航项所需的权限 */
  requiredPermission?: PermissionFlag[]
}

export type AdminSecondaryNavItem = AdminNavItem

export type AdminDocumentItem = AdminNavItem

type AdminNavConfig = Record<AdminRoutes, AdminNavItem>

// MARK: 管理后台导航配置
export const adminNavConfig: AdminNavConfig = {
  [AdminRoutes.Root]: {
    title: SITE_CONFIG.adminTitle,
    url: AdminRoutes.Root,
  },
  [AdminRoutes.Login]: {
    title: '登录',
    url: AdminRoutes.Login,
  },
  [AdminRoutes.Dashboard]: {
    title: '仪表盘',
    url: AdminRoutes.Dashboard,
    icon: GaugeIcon,
    requiredPermission: [adminPermission.statistics.read],
  },
  [AdminRoutes.Licenses]: {
    title: '授权码管理',
    url: AdminRoutes.Licenses,
    icon: KeyIcon,
    requiredPermission: [adminPermission.licenses.read],
  },
  [AdminRoutes.Profile]: {
    title: '个人资料',
    url: AdminRoutes.Profile,
    icon: UserIcon,
  },
  [AdminRoutes.Users]: {
    title: '部门与成员',
    url: AdminRoutes.Users,
    icon: UsersIcon,
    requiredPermission: [adminPermission.users.read],
  },
  [AdminRoutes.Roles]: {
    title: '角色管理',
    url: AdminRoutes.Roles,
    icon: SquareUserRoundIcon,
    requiredPermission: [adminPermission.roles.read],
  },
  [AdminRoutes.Permissions]: {
    title: '权限管理',
    url: AdminRoutes.Permissions,
    icon: FingerprintIcon,
    requiredPermission: [adminPermission.permissions.read],
  },
  [AdminRoutes.Docs]: {
    title: '项目文档',
    url: AdminRoutes.Docs,
  },
  [AdminRoutes.Unauthorized]: {
    title: '访问被拒绝',
    url: AdminRoutes.Unauthorized,
  },

  // CrowdTest
  [AdminRoutes.CrowdTestDashboard]: {
    title: '数据总览',
    url: AdminRoutes.CrowdTestDashboard,
    icon: GaugeIcon,
  },
  [AdminRoutes.CrowdTestBugs]: {
    title: '报告管理',
    url: AdminRoutes.CrowdTestBugs,
    icon: NotebookTextIcon,
  },
  [AdminRoutes.CrowdTestBugsDetail]: {
    title: '报告详情',
    url: AdminRoutes.CrowdTestBugsDetail,
    icon: NotebookTextIcon,
  },
  [AdminRoutes.CrowdTestMyBugs]: {
    title: '我的报告',
    url: AdminRoutes.CrowdTestMyBugs,
    icon: BookUpIcon,
  },
  [AdminRoutes.CrowdTestTeams]: {
    title: '团队管理',
    url: AdminRoutes.CrowdTestTeams,
    icon: UsersIcon,
    requiredPermission: [adminPermission.departments.read],
  },
  [AdminRoutes.CrowdTestTeamProfile]: {
    title: '团队概况',
    url: AdminRoutes.CrowdTestTeamProfile,
    icon: UsersIcon,
  },
  [AdminRoutes.CrowdTestRoles]: {
    title: '角色管理',
    url: AdminRoutes.CrowdTestRoles,
    icon: SquareUserRoundIcon,
    requiredPermission: [adminPermission.roles.read],
  },
}

export function getPageNameByRoute(pathname: string): string {
  // 获取所有路由，按路径长度降序排序，确保更具体的路径优先匹配
  const routes = Object.keys(adminNavConfig).sort((a, b) => b.length - a.length)

  // 查找匹配的路由
  for (const route of routes) {
    if (isRouteMatch(pathname, route)) {
      return adminNavConfig[route as AdminRoutes].title
    }
  }

  // 如果没有匹配到任何路由，返回根路由的标题
  return adminNavConfig[AdminRoutes.Root].title
}

/**
 * 根据路径生成页面标题
 */
export function generatePageTitle(pathname?: string): string {
  if (!pathname) {
    return SITE_CONFIG.adminTitle
  }

  const pageName = getPageNameByRoute(pathname)

  // 如果页面名称就是网站名称，只返回网站名称
  if (pageName === SITE_CONFIG.adminTitle) {
    return SITE_CONFIG.adminTitle
  }

  // 否则返回 "页面名称 - 网站名称" 的格式
  return `${pageName} - ${SITE_CONFIG.adminTitle}`
}

const createAdminNavItem = (adminRoute: AdminRoutes): AdminNavItem => ({
  title: adminNavConfig[adminRoute].title,
  url: adminNavConfig[adminRoute].url,
  icon: adminNavConfig[adminRoute].icon,
  requiredPermission: adminNavConfig[adminRoute].requiredPermission,
})

// MARK: 主导航栏
const adminNavMain = isCrowdTest()
  ? [
      createAdminNavItem(AdminRoutes.CrowdTestDashboard),
      createAdminNavItem(AdminRoutes.CrowdTestBugs),
      createAdminNavItem(AdminRoutes.CrowdTestMyBugs),
      createAdminNavItem(AdminRoutes.CrowdTestTeams),
      createAdminNavItem(AdminRoutes.CrowdTestRoles),
    ]
  : [
      createAdminNavItem(AdminRoutes.Dashboard),
      createAdminNavItem(AdminRoutes.Licenses),
      createAdminNavItem(AdminRoutes.Users),
      createAdminNavItem(AdminRoutes.Roles),
      createAdminNavItem(AdminRoutes.Permissions),
    ]

const adminNavSecondary: AdminSecondaryNavItem[] = [
  {
    title: '流量分析',
    url: 'https://us.umami.is/websites/17a93541-f99f-43ed-8d7c-3887b4e85693',
    icon: BarChartIcon,
  },
]

// MARK: 文档导航栏
const adminNavDocuments: AdminDocumentItem[] = [
  {
    title: '项目介绍文案',
    url: '项目介绍文案',
  },
  {
    title: '收费逻辑说明话术',
    url: '收费逻辑说明话术',
  },
  {
    title: '文档搜索',
    url: '文档搜索',
  },
]

export function useAdminNav() {
  const userPermissions = useUserPermissions()

  const filterNavItemsByPermissions = (navItems: AdminNavItem[]) => {
    return navItems.filter((item) => {
      // 如果导航项没有权限要求，则显示
      if (!item.requiredPermission) {
        return true
      }

      return matchPermission(userPermissions, item.requiredPermission)
    })
  }

  const navMain = filterNavItemsByPermissions(adminNavMain)
  const navSecondary = filterNavItemsByPermissions(adminNavSecondary)
  const navDocuments = filterNavItemsByPermissions(adminNavDocuments)

  return {
    navMain,
    navSecondary,
    navDocuments,
  }
}

/**
 * 根据路径获取页面权限要求
 * 用于页面级权限校验
 */
export function getPagePermissionByRoute(pathname: string): PermissionFlag[] | undefined {
  // 按路径长度降序排序，确保更具体的路径优先匹配
  const routes = Object.keys(adminNavConfig).sort((a, b) => b.length - a.length)

  for (const route of routes) {
    if (isRouteMatch(pathname, route)) {
      return adminNavConfig[route as AdminRoutes].requiredPermission
    }
  }

  return undefined
}

/**
 * 根据 RouteKey 获取对应的完整路由路径
 *
 * @param routeKey - 路由配置中定义的路由键名
 * @param params - 动态路由参数对象，用于替换路径中的动态参数（如 [projectId]）
 * @returns 返回与 routeKey 对应的实际路由路径
 * @example
 * ```ts
 * // 基础用法
 * getRoutePath(RouteKey.首页) // 返回: '/'
 *
 * // 带动态参数
 * getRoutePath(RouteKey.TW_客户_项目详情, { projectId: '123' }) // 返回: '/client/project/123'
 * ```
 */
export function getRoutePath(routeKey: AdminRoutes, params?: Record<string, string | number>) {
  let path: string = adminNavConfig[routeKey].url

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      const paramPattern = `[${key}]`

      if (!path.includes(paramPattern)) {
        consola.warn(
          `[路由参数警告] 路由 "${routeKey}" 的路径 "${path}" 中未找到参数 "${key}" 的占位符`,
          '\n提供的参数：', params,
        )

        return
      }

      path = path.replace(paramPattern, String(value))
    })
  }

  return path
}
