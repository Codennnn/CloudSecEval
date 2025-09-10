import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

import type { ExpressRequest } from '~/types/common'

/**
 * 用于在控制器方法参数中便捷获取当前请求的用户信息。
 *
 * - 默认返回 request.user（由认证守卫如 JwtAuthGuard 注入）
 * - 可传入字段名参数，直接获取用户对象的某个字段，如 @CurrentUser('email')
 * - 适用于需要获取当前登录用户信息的接口，如 profile、设置等
 */
export const CurrentUser = createParamDecorator(
  (fieldName: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ExpressRequest>()
    const user = request.user

    if (user) {
      if (fieldName) {
        return user[fieldName as keyof typeof user]
      }

      return user
    }
  },
)
