import type { ExecutionContext } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'

import { IS_PUBLIC_KEY } from '~/modules/auth/decorators/public.decorator'

/**
 * 检查当前路由是否为公共路由
 *
 * @description 通过 Reflector 检查路由方法或类上是否标记了 @Public() 装饰器
 * 这个函数封装了公共路由检查的通用逻辑，避免在多个守卫中重复相同的代码
 *
 * @param reflector Reflector 实例，用于获取元数据
 * @param context 执行上下文，包含当前请求的路由信息
 * @returns 如果是公共路由返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * // 在守卫中使用
 * canActivate(context: ExecutionContext): boolean {
 *   if (isPublicRoute(this.reflector, context)) {
 *     return true
 *   }
 *   // 继续执行守卫逻辑
 * }
 * ```
 */
export function isPublicRoute(reflector: Reflector, context: ExecutionContext): boolean {
  return Boolean(reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]))
}

/**
 * 检查当前路由是否需要跳过守卫
 *
 * @description 这是 isPublicRoute 的别名方法，语义更清晰
 * 用于表示是否应该跳过当前守卫的执行
 *
 * @param reflector Reflector 实例
 * @param context 执行上下文
 * @returns 如果应该跳过守卫返回 true，否则返回 false
 */
export function shouldSkipGuard(reflector: Reflector, context: ExecutionContext): boolean {
  return isPublicRoute(reflector, context)
}
