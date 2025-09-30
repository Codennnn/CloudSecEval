/**
 * 存储键名常量
 *
 * 统一管理 localStorage、sessionStorage 等存储相关的键名常量
 * 避免在代码中使用魔法字符串，提高代码的可维护性和类型安全性
 */

/**
 * localStorage 键名常量
 */
export const LOCAL_STORAGE_KEYS = {
  // 认证相关
  /** 访问令牌 */
  ACCESS_TOKEN: 'access_token',
  /** 刷新令牌 */
  REFRESH_TOKEN: 'refresh_token',

  // 用户相关
  /** 用户信息存储 */
  USER_STORAGE: 'user-storage',
  /** 用户授权信息 */
  USER_LICENSE_INFO: 'user-license-info',

  // 业务数据
  /** 部门树存储（动态键名前缀） */
  DEPARTMENT_TREE_PREFIX: 'department-tree-store',
} as const

/**
 * Cookie 键名常量
 */
export const COOKIE_KEYS = {
  /** 认证状态 */
  AUTH_STATUS: 'auth_status',
} as const

/**
 * 认证状态值常量
 */
export const AUTH_STATUS_VALUES = {
  /** 已登录状态 */
  LOGGED_IN: 'true',
  /** 已登出状态 */
  LOGGED_OUT: 'false',
} as const

/**
 * 生成动态存储键名的工具函数
 */
export const STORAGE_KEY_GENERATORS = {
  /**
   * 生成部门树存储键名
   * @param orgId 组织 ID
   * @returns 完整的存储键名
   */
  departmentTree: (orgId: string | number): string =>
    `${LOCAL_STORAGE_KEYS.DEPARTMENT_TREE_PREFIX}-${orgId}`,
} as const

// 类型定义
export type LocalStorageKey = typeof LOCAL_STORAGE_KEYS[keyof typeof LOCAL_STORAGE_KEYS]
export type CookieKey = typeof COOKIE_KEYS[keyof typeof COOKIE_KEYS]
export type AuthStatusValue = typeof AUTH_STATUS_VALUES[keyof typeof AUTH_STATUS_VALUES]
