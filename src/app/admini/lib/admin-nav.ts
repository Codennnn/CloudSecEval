import { GaugeIcon, KeyIcon, type LucideIcon, UserIcon, UsersIcon } from 'lucide-react'

/**
 * 管理后台相关路由（敏感信息）
 * 这些路径不应暴露到前端代码中
 */
export const enum AdminRoutes {
  Root = '/admini',
  Login = '/admini/login',
  Dashboard = '/admini/dashboard',
  Users = '/admini/users',
  Profile = '/admini/profile',
  Licenses = '/admini/licenses',
}

interface AdminNavItem {
  title: string
  url: string
  icon?: LucideIcon
}

export type AdminSecondaryNavItem = AdminNavItem

export type AdminDocumentItem = AdminNavItem

type AdminNavConfig = Record<AdminRoutes, AdminNavItem>

export const adminTitle = 'NestJS 文档管理后台'

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
  },
  [AdminRoutes.Licenses]: {
    title: '授权码管理',
    url: AdminRoutes.Licenses,
    icon: KeyIcon,
  },
  [AdminRoutes.Profile]: {
    title: '个人资料',
    url: AdminRoutes.Profile,
    icon: UserIcon,
  },
  [AdminRoutes.Users]: {
    title: '用户管理',
    url: AdminRoutes.Users,
    icon: UsersIcon,
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

const createAdminNavItem = (adminRoute: AdminRoutes) => ({
  title: adminNavConfig[adminRoute].title,
  url: adminNavConfig[adminRoute].url,
  icon: adminNavConfig[adminRoute].icon,
})

/**
 * MARK: 主导航栏
 */
export const adminNavMain = [
  createAdminNavItem(AdminRoutes.Dashboard),
  createAdminNavItem(AdminRoutes.Licenses),
  createAdminNavItem(AdminRoutes.Users),
]

export const adminNavSecondary = [
  {
    title: 'Settings',
    url: '#',
    icon: UserIcon,
  },
  {
    title: 'Get Help',
    url: '#',
    icon: UserIcon,
  },
  {
    title: 'Search',
    url: '#',
    icon: UserIcon,
  },
]

export const adminNavDocuments = [
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
