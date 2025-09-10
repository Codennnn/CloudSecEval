import { SetMetadata } from '@nestjs/common'

/**
 * 禁用接口的装饰器
 *
 * 使用场景：
 * - 临时禁用某个接口，避免用户访问
 * - 接口维护期间的优雅降级
 * - 功能开发完成但暂时不对外开放
 *
 * 特性：
 * - 支持设置禁用原因，方便开发者了解原因
 * - 支持设置预计恢复时间，便于项目管理
 * - 支持设置是否为维护模式，区分不同类型的禁用
 * - 统一的错误响应格式
 *
 * @example
 * ```typescript
 * // 基本用法
 * @DisabledApi('功能开发中')
 * @Get('feature')
 * newFeature() { ... }
 *
 * // 带恢复时间
 * @DisabledApi('数据库维护', '2024-01-15 10:00:00')
 * @Post('users')
 * createUser() { ... }
 *
 * // 维护模式
 * @DisabledApi('系统升级', '2024-01-15 10:00:00', true)
 * @Put('users/:id')
 * updateUser() { ... }
 * ```
 */

export const DISABLED_API_KEY = 'disabledApi'

export interface DisabledApiMetadata {
  /** 禁用原因 */
  reason: string
  /** 预计恢复时间（可选） */
  estimatedRecoveryTime?: string
  /** 是否为维护模式（默认false） */
  isMaintenanceMode?: boolean
  /** 禁用时间戳 */
  disabledAt: string
}

/**
 * 禁用API装饰器
 *
 * @param reason 禁用原因
 * @param estimatedRecoveryTime 预计恢复时间（可选）
 * @param isMaintenanceMode 是否为维护模式（默认 false）
 * @returns 装饰器函数
 */
export function DisabledApi(
  reason: string,
  estimatedRecoveryTime?: string,
  isMaintenanceMode = false,
) {
  const metadata: DisabledApiMetadata = {
    reason,
    estimatedRecoveryTime,
    isMaintenanceMode,
    disabledAt: new Date().toISOString(),
  }

  return SetMetadata(DISABLED_API_KEY, metadata)
}
