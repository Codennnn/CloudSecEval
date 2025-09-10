import type { Prisma } from '#prisma/client'
import { EntitySearchBuilder } from '~/common/search/builders/entity-search-builder'
import { type BaseFieldSearchConfig } from '~/common/search/meta/field-metadata'

import type { BaseDepartmentDto } from '../dto/base-department.dto'
import type { FindDepartmentsDto } from '../dto/find-departments.dto'

/**
 * 基于部门实体类的字段元数据配置
 * - 从 Department 实体类自动推导字段类型
 * - 集中配置每个字段的搜索能力
 * - 当实体字段变更时，TypeScript 会提供类型检查
 */
const DEPARTMENT_FIELD_CONFIG = {
  name: {
    type: 'string' as const,
    global: true,
    sortable: true,
    searchable: true,
  },
  remark: {
    type: 'string' as const,
    global: false,
    sortable: false,
    searchable: true,
  },
  isActive: {
    type: 'boolean' as const,
    global: false,
    sortable: true,
    searchable: true,
  },
} as const satisfies Record<keyof Pick<BaseDepartmentDto, 'name' | 'remark' | 'isActive'>, BaseFieldSearchConfig>

/**
 * 部门搜索构建器
 * 使用通用的实体搜索框架，消除重复代码
 * - 字段配置基于部门实体类自动生成
 * - 当实体字段变更时自动同步
 * - 继承通用的搜索逻辑，专注于部门特定的业务逻辑
 */
export class AdvancedDepartmentSearchBuilder extends EntitySearchBuilder<
  Prisma.DepartmentWhereInput,
  Prisma.DepartmentOrderByWithRelationInput,
  FindDepartmentsDto,
  typeof DEPARTMENT_FIELD_CONFIG
> {
  /**
   * 构造函数
   * - 使用通用实体搜索构建器
   * - 传入部门特定的字段配置
   */
  constructor(searchDto: FindDepartmentsDto) {
    super(
      searchDto,
      DEPARTMENT_FIELD_CONFIG,
      {}, // 无扩展字段
      'name', // 默认排序字段
    )
  }

  /**
   * 构建自定义筛选条件
   * - 根据组织ID筛选
   * - 根据上级部门ID筛选
   * - 处理包含子孙部门的逻辑
   */
  protected buildCustomFilters(): void {
    const { orgId, parentId } = this.searchDto

    // 按组织ID筛选
    if (orgId) {
      this.conditions.orgId = orgId
    }

    // 按上级部门ID筛选
    if (parentId !== undefined) {
      this.conditions.parentId = parentId
    }

    // 注意：includeDescendants 的逻辑需要在仓储层处理
    // 因为需要先查询出所有子孙部门的ID列表
  }
}
