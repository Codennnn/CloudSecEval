import type { Prisma } from '#prisma/client'
import { EntitySearchBuilder } from '~/common/search/builders/entity-search-builder'
import { type BaseFieldSearchConfig } from '~/common/search/meta/field-metadata'

import type { FindUsersDto, UserSearchFields } from '../dto/find-users.dto'

/**
 * 基于用户实体类的字段元数据配置
 * - 从 User 实体类自动推导字段类型
 * - 集中配置每个字段的搜索能力
 * - 当实体字段变更时，TypeScript 会提供类型检查
 */
const USER_FIELD_CONFIG = {
  name: {
    type: 'string',
    global: true,
    sortable: true,
    searchable: true,
  },
  email: {
    type: 'string',
    global: true,
    sortable: true,
    searchable: true,
  },
  phone: {
    type: 'string',
    global: true,
    sortable: true,
    searchable: true,
  },
  isActive: {
    type: 'boolean',
    global: false,
    sortable: true,
    searchable: true,
  },
  createdAt: {
    type: 'date',
    global: false,
    sortable: true,
    searchable: true,
  },
  updatedAt: {
    type: 'date',
    global: false,
    sortable: true,
    searchable: true,
  },
  orgId: {
    type: 'string',
    global: false,
    sortable: true,
    searchable: true,
  },
  departmentId: {
    type: 'string',
    global: false,
    sortable: true,
    searchable: true,
  },
} as const satisfies Record<keyof UserSearchFields, BaseFieldSearchConfig>

/**
 * 用户搜索构建器
 * 使用通用的实体搜索框架，消除重复代码
 * - 字段配置基于用户实体类自动生成
 * - 当实体字段变更时自动同步
 * - 继承通用的搜索逻辑，专注于用户特定的业务逻辑
 */
export class AdvancedUserSearchBuilder extends EntitySearchBuilder<
  Prisma.UserWhereInput,
  Prisma.UserOrderByWithRelationInput,
  FindUsersDto,
  typeof USER_FIELD_CONFIG
> {
  /**
   * 构造函数
   * - 使用通用实体搜索构建器
   * - 传入用户特定的字段配置
   */
  constructor(searchDto: FindUsersDto) {
    super(
      searchDto,
      USER_FIELD_CONFIG,
      {}, // 无扩展字段
      'createdAt', // 默认排序字段
    )
  }

  /**
   * 构建自定义筛选条件
   * - 支持按组织ID筛选
   * - 支持按部门ID筛选（含子孙部门）
   * - 可在此根据角色、权限等扩展
   */
  protected buildCustomFilters(): void {
    const { orgId, departmentId } = this.searchDto

    // 按组织ID筛选
    if (orgId) {
      this.conditions.orgId = orgId
    }

    // 按部门ID筛选
    if (departmentId) {
      // 注意：includeDescendants 的逻辑需要在仓储层处理
      // 因为需要先查询出所有子孙部门的ID列表
      this.conditions.departmentId = departmentId
    }

    // 用户模块的其他自定义筛选逻辑可以在这里添加
    // 例如：根据角色筛选、根据权限筛选等
  }
}
