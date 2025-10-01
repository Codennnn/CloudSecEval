import { SetMetadata } from '@nestjs/common'

/**
 * 要求同租户资源访问装饰器的元数据键
 */
export const REQUIRE_SAME_TENANT_KEY = 'requireSameTenant'

/**
 * 要求同租户资源访问装饰器
 *
 * 用于标记某些路由需要验证 URL 参数中的资源 ID 是否属于当前租户
 *
 * 使用场景：
 * - RESTful API 中的资源详情接口（GET /reports/:id）
 * - 资源更新接口（PUT /reports/:id）
 * - 资源删除接口（DELETE /reports/:id）
 *
 * 工作原理：
 * 1. 从 URL 参数中提取资源 ID
 * 2. 查询该资源的 orgId
 * 3. 验证是否与当前用户的 orgId 一致
 * 4. 如果不一致，返回 403 错误
 *
 * @param paramName URL 参数名（默认为 'id'）
 *
 * @example
 * ```typescript
 * @Get(':id')
 * @RequireSameTenant('id')
 * async getBugReport(@Param('id') id: string) {
 *   // 此方法会自动验证 bug report 是否属于当前组织
 *   return this.bugReportsService.findById(id)
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Delete(':reportId')
 * @RequireSameTenant('reportId')
 * async deleteBugReport(@Param('reportId') reportId: string) {
 *   return this.bugReportsService.delete(reportId)
 * }
 * ```
 */
export const RequireSameTenant = (paramName = 'id') =>
  SetMetadata(REQUIRE_SAME_TENANT_KEY, paramName)

/**
 * 获取需要验证的参数名
 *
 * @param metadata 元数据
 * @returns 参数名或 undefined
 */
export function getRequireSameTenantParam(
  metadata: Record<string, unknown>,
): string | undefined {
  const paramName = metadata[REQUIRE_SAME_TENANT_KEY]

  if (typeof paramName === 'string') {
    return paramName
  }

  return undefined
}
