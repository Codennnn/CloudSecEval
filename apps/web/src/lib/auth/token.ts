/**
 * Token 管理工具
 * 用于管理 localStorage 中的认证令牌
 */

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const AUTH_STATUS_COOKIE = 'auth_status'

export const tokenManager = {
  /**
   * 获取访问令牌
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * 设置访问令牌
   */
  setAccessToken(token: string): void {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.setItem(TOKEN_KEY, token)
  },

  /**
   * 获取刷新令牌
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  /**
   * 设置刷新令牌
   */
  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  /**
   * 清除所有令牌
   */
  clearTokens(): void {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
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
    if (typeof document === 'undefined') {
      return
    }

    if (isAuthenticated) {
      // 设置一个简单的认证状态 Cookie，有效期 7 天
      const expires = new Date()
      expires.setDate(expires.getDate() + 7)
      document.cookie = `${AUTH_STATUS_COOKIE}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    }
    else {
      // 清除认证状态 Cookie
      document.cookie = `${AUTH_STATUS_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
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
