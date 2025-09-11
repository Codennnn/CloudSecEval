import { BarChartIcon, FingerprintIcon, GaugeIcon, KeyIcon, type LucideIcon, SquareUserRoundIcon, UserIcon, UsersIcon } from 'lucide-react'

import { adminPermission } from '~/constants/permission'
import { matchPermission, type PermissionFlag } from '~/lib/permissions/matcher'

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

export const adminTitle = 'NestJS 文档管理后台'

// MARK: 管理后台导航配置
export const adminNavConfig: AdminNavConfig = {
  [AdminRoutes.Root]: {
    title: adminTitle,
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
}

export function getPageNameByRoute(pathname: string): string {
  // 获取所有路由，按路径长度降序排序，确保更具体的路径优先匹配
  const routes = Object.keys(adminNavConfig).sort((a, b) => b.length - a.length)

  // 查找匹配的路由
  for (const route of routes) {
    if (pathname.startsWith(route)) {
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
    return adminTitle
  }

  const pageName = getPageNameByRoute(pathname)

  // 如果页面名称就是网站名称，只返回网站名称
  if (pageName === adminTitle) {
    return adminTitle
  }

  // 否则返回 "页面名称 - 网站名称" 的格式
  return `${pageName} - ${adminTitle}`
}

const createAdminNavItem = (adminRoute: AdminRoutes): AdminNavItem => ({
  title: adminNavConfig[adminRoute].title,
  url: adminNavConfig[adminRoute].url,
  icon: adminNavConfig[adminRoute].icon,
  requiredPermission: adminNavConfig[adminRoute].requiredPermission,
})

// MARK: 主导航栏
const adminNavMain = [
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
