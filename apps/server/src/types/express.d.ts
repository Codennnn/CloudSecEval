import type { SafeUserDto } from '~/modules/users/dto/base-user.dto'

declare global {
  namespace Express {
    // 扩展 Express 的 Request 接口
    interface Request {
      /**
       * 当前认证用户信息
       * - 由 JWT 或 Local 策略中的 validate 方法设置
       * - 通过 @CurrentUser() 装饰器获取
       */
      user?: SafeUserDto
    }
  }
}

// 这个导出是必需的，使其成为一个模块
export {}
