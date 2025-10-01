import { SetMetadata } from '@nestjs/common'

/**
 * 绕过租户隔离装饰器的元数据键
 */
export const BYPASS_TENANT_ISOLATION_KEY = 'bypassTenantIsolation'

/**
 * 绕过租户隔离装饰器
 *
 * 用于标记某些路由或方法可以绕过租户隔离检查
 *
 * 使用场景：
 * - 系统管理员的全局查询接口
 * - 跨组织的统计分析接口
 * - 系统级的批量操作接口
 *
 * ⚠️ 警告：
 * 使用此装饰器需要特别小心，确保：
 * 1. 只在真正需要跨租户访问的场景使用
 * 2. 有适当的权限检查（如超级管理员权限）
 * 3. 有完善的审计日志记录
 *
 * @example
 * ```typescript
 * @Get('admin/all-reports')
 * @BypassTenantIsolation()
 * @RequirePermissions('SUPER_ADMIN')
 * async getAllReports() {
 *   // 此方法可以访问所有组织的数据
 *   return this.bugReportsService.findAllAcrossOrganizations()
 * }
 * ```
 *
 * @example
 * ```typescript
 * // 在 Service 中手动绕过
 * async getGlobalStatistics() {
 *   return this.tenantContext.runWithoutTenantIsolation(
 *     {
 *       action: 'GET_GLOBAL_STATS',
 *       reason: '获取全局统计数据',
 *       isSystemOperation: true
 *     },
 *     async () => {
 *       return this.repository.findMany()
 *     }
 *   )
 * }
 * ```
 */
export const BypassTenantIsolation = () =>
  SetMetadata(BYPASS_TENANT_ISOLATION_KEY, true)

/**
 * 检查是否标记了绕过租户隔离
 *
 * @param metadata 元数据
 * @returns 是否绕过租户隔离
 */
export function isBypassTenantIsolation(
  metadata: Record<string, unknown>,
): boolean {
  return metadata[BYPASS_TENANT_ISOLATION_KEY] === true
}
