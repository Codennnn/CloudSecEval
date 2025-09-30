/**
 * Token 管理工具
 * 用于管理 localStorage 中的认证令牌
 */

import {
  AUTH_STATUS_VALUES,
  COOKIE_KEYS,
  LOCAL_STORAGE_KEYS } from '~/constants/storage'

// 为了向后兼容，保留这些导出（但现在它们引用常量文件中的值）
export const TOKEN_KEY = LOCAL_STORAGE_KEYS.ACCESS_TOKEN
export const REFRESH_TOKEN_KEY = LOCAL_STORAGE_KEYS.REFRESH_TOKEN
export const AUTH_STATUS_COOKIE = COOKIE_KEYS.AUTH_STATUS
export const AUTH_STATUS_LOGGED_IN = AUTH_STATUS_VALUES.LOGGED_IN

export const tokenManager = {
  /**
   * 获取访问令牌
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
  },

  /**
   * 设置访问令牌
   */
  setAccessToken(token: string): void {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, token)
  },

  /**
   * 获取刷新令牌
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
  },

  /**
   * 设置刷新令牌
   */
  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token)
    }
  },

  /**
   * 清除所有令牌
   */
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
    }
  },

  /**
   * 检查是否已认证（有访问令牌）
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  },

  /**
   * 设置登录数据（同时设置访问令牌和刷新令牌）
   */
  setLoginData(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken)
    this.setRefreshToken(refreshToken)

    // 设置认证状态 Cookie，用于 middleware 路由保护
    this.setAuthStatusCookie(true)
  },

  /**
   * 设置认证状态 Cookie（用于 middleware 判断登录状态）
   */
  setAuthStatusCookie(isAuthenticated: boolean): void {
    if (typeof document !== 'undefined') {
      if (isAuthenticated) {
        // 设置一个简单的认证状态 Cookie，有效期 7 天
        const expires = new Date()
        expires.setDate(expires.getDate() + 7)
        document.cookie = `${AUTH_STATUS_COOKIE}=${AUTH_STATUS_LOGGED_IN}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
      }
      else {
        // 清除认证状态 Cookie
        document.cookie = `${AUTH_STATUS_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    }
  },

  /**
   * 清除所有认证数据（包括 localStorage 和认证状态 Cookie）
   */
  clearAllAuthData(): void {
    this.clearTokens()
    this.setAuthStatusCookie(false)
  },
}
