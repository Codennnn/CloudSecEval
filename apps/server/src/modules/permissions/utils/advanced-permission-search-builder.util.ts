import type { Prisma } from '#prisma/client'
import { EntitySearchBuilder } from '~/common/search/builders/entity-search-builder'
import { SortOrder } from '~/common/search/interfaces/search.interface'
import { type BaseFieldSearchConfig } from '~/common/search/meta/field-metadata'

import type { FindPermissionsDto } from '../dto/find-permissions.dto'

/**
 * 基于权限实体的字段配置
 * - 统一声明可搜索与可排序字段
 * - 指定全局搜索字段
 */
const PERMISSION_FIELD_CONFIG = {
  resource: {
    type: 'string' as const,
    global: true,
    sortable: true,
    searchable: true,
  },
  action: {
    type: 'string' as const,
    global: true,
    sortable: true,
    searchable: true,
  },
  slug: {
    type: 'string' as const,
    global: true,
    sortable: false,
    searchable: true,
  },
  description: {
    type: 'string' as const,
    global: true,
    sortable: false,
    searchable: true,
  },
  system: {
    type: 'boolean' as const,
    global: false,
    sortable: false,
    searchable: true,
  },
  createdAt: {
    type: 'date' as const,
    global: false,
    sortable: true,
    searchable: true,
  },
  updatedAt: {
    type: 'date' as const,
    global: false,
    sortable: true,
    searchable: true,
  },
} as const satisfies Record<string, BaseFieldSearchConfig>

/**
 * 权限搜索构建器
 * 使用通用实体搜索构建器，默认按 resource 升序；仓库层会补充 action 次序以保持原排序策略
 */
export class AdvancedPermissionSearchBuilder extends EntitySearchBuilder<
  Prisma.PermissionWhereInput,
  Prisma.PermissionOrderByWithRelationInput,
  FindPermissionsDto,
  typeof PERMISSION_FIELD_CONFIG
> {
  constructor(searchDto: FindPermissionsDto) {
    super(
      searchDto,
      PERMISSION_FIELD_CONFIG,
      {},
      'resource',
      SortOrder.ASC,
    )
  }

  /**
   * 构建权限模块的自定义筛选条件
   * 当前无额外业务筛选，保留空实现以满足抽象类约束
   */
  protected buildCustomFilters(): void {
    // 无自定义过滤逻辑
  }
}
