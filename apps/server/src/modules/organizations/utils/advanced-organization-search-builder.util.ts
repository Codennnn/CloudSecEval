import type { Prisma } from '#prisma/client'
import { EntitySearchBuilder } from '~/common/search/builders/entity-search-builder'
import { type BaseFieldSearchConfig } from '~/common/search/meta/field-metadata'

import type { BaseOrganizationDto } from '../dto/base-organization.dto'
import type { FindOrganizationsDto } from '../dto/find-organizations.dto'

/**
 * 基于组织实体类的字段元数据配置
 * - 从 Organization 实体类自动推导字段类型
 * - 集中配置每个字段的搜索能力
 * - 当实体字段变更时，TypeScript 会提供类型检查
 */
const ORGANIZATION_FIELD_CONFIG = {
  name: {
    type: 'string' as const,
    global: true,
    sortable: true,
    searchable: true,
  },
  code: {
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
} as const satisfies Record<keyof Pick<BaseOrganizationDto, 'name' | 'code' | 'remark' | 'isActive'>, BaseFieldSearchConfig>

/**
 * 组织搜索构建器
 * 使用通用的实体搜索框架，消除重复代码
 * - 字段配置基于组织实体类自动生成
 * - 当实体字段变更时自动同步
 * - 继承通用的搜索逻辑，专注于组织特定的业务逻辑
 */
export class AdvancedOrganizationSearchBuilder extends EntitySearchBuilder<
  Prisma.OrganizationWhereInput,
  Prisma.OrganizationOrderByWithRelationInput,
  FindOrganizationsDto,
  typeof ORGANIZATION_FIELD_CONFIG
> {
  /**
   * 构造函数
   * - 使用通用实体搜索构建器
   * - 传入组织特定的字段配置
   */
  constructor(searchDto: FindOrganizationsDto) {
    super(
      searchDto,
      ORGANIZATION_FIELD_CONFIG,
      {}, // 无扩展字段
      'name', // 默认排序字段
    )
  }

  /**
   * 构建自定义筛选条件
   * - 可在此根据业务需求扩展特定的筛选逻辑
   * - 例如：根据组织状态、创建时间范围等筛选
   */
  protected buildCustomFilters(): void {
    // 组织模块的自定义筛选逻辑可以在这里添加
    // 例如：特定的组织状态筛选、权限相关的筛选等
  }
}
