import type { Prisma } from '#prisma/client'
import { buildRelationQuery } from '~/common/search/builders/advanced-query-builder'
import { EntitySearchBuilder } from '~/common/search/builders/entity-search-builder'
import { type BaseFieldSearchConfig } from '~/common/search/meta/field-metadata'
import { toPrismaCondition } from '~/common/search/operators/search-operators.util'

import type { FindLicensesDto } from '../dto/find-licenses.dto'
import type { LicenseListItemDto } from '../dto/license-response.dto'

/**
 * 基于授权码实体类的字段元数据配置
 * - 从 LicenseEntity 实体类自动推导字段类型
 * - 集中配置每个字段的搜索能力
 * - 当实体字段变更时，TypeScript 会提供类型检查
 */
const LICENSE_FIELD_CONFIG = {
  email: {
    type: 'string',
    global: true,
    sortable: true,
    searchable: true,
  },
  code: {
    type: 'string',
    global: true,
    sortable: true,
    searchable: true,
  },
  isUsed: {
    type: 'boolean',
    global: false,
    sortable: true,
    searchable: true,
  },
  locked: {
    type: 'boolean',
    global: false,
    sortable: true,
    searchable: true,
  },
  purchaseAmount: {
    type: 'decimal',
    global: false,
    sortable: true,
    searchable: true,
  },
  remark: {
    type: 'string',
    global: false,
    sortable: false,
    searchable: true,
  },
  warningCount: {
    type: 'number',
    global: false,
    sortable: true,
    searchable: true,
  },
  expiresAt: {
    type: 'date',
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
} as const satisfies Record<keyof Omit<LicenseListItemDto, 'id'>, BaseFieldSearchConfig>

/**
 * 扩展字段配置 - 包含非实体字段但在搜索中需要的字段
 */
const EXTENDED_FIELDS_CONFIG = {
  // 访问日志相关字段
  lastAccessTime: {
    type: 'date' as const,
    global: false,
    sortable: false,
    searchable: true,
    special: true,
  },
  totalAccesses: {
    type: 'number' as const,
    global: false,
    sortable: false,
    searchable: true,
    special: true,
  },
  riskLevel: {
    type: 'enum' as const,
    global: false,
    sortable: false,
    searchable: true,
    special: true,
  },
  ipAddress: {
    type: 'string' as const,
    global: false,
    sortable: false,
    searchable: true,
    special: true,
  },
} as const satisfies Record<string, BaseFieldSearchConfig>

/**
 * 授权码搜索构建器
 * 继承通用的实体搜索框架，消除重复代码
 * - 字段配置基于授权码实体类自动生成
 * - 当实体字段变更时自动同步
 * - 保留授权码特有的复杂搜索逻辑（统计、聚合等）
 */
export class LicenseSearchBuilder extends EntitySearchBuilder<
  Prisma.LicenseWhereInput,
  Prisma.LicenseOrderByWithRelationInput,
  FindLicensesDto,
  typeof LICENSE_FIELD_CONFIG
> {
  /**
   * 构造函数
   * - 使用通用实体搜索构建器
   * - 传入授权码特定的字段配置和扩展字段
   */
  constructor(searchDto: FindLicensesDto) {
    super(
      searchDto,
      LICENSE_FIELD_CONFIG,
      EXTENDED_FIELDS_CONFIG, // 包含访问日志相关的扩展字段
      'createdAt', // 默认排序字段
    )
  }

  /**
   * 构建特殊字段的操作符条件
   * 重写父类方法，处理授权码特有的特殊字段
   */
  protected buildSpecialOperatorCondition(field: string, value: Record<string, unknown>): void {
    switch (field) {
      case 'ipAddress':
        this.buildIpAddressCondition(value)
        break

      default:
        // 其他特殊字段在 buildCustomFilters 中处理
        break
    }
  }

  /**
   * 构建自定义筛选条件
   * 处理需要复杂逻辑的筛选条件，如统计、聚合等
   */
  protected buildCustomFilters(): void {
    // 这里处理需要复杂逻辑的筛选条件
    // 例如：风险等级、访问统计等需要关联查询的条件

    // 注意：对于需要访问日志数据的筛选条件（如 totalAccesses、lastAccessTime、riskLevel）
    // 需要在 Repository 层进行特殊处理，因为它们涉及到聚合查询
  }

  /**
   * 构建 IP 地址搜索条件
   */
  private buildIpAddressCondition(ipOperators: Record<string, unknown>): void {
    const condition = toPrismaCondition(ipOperators)

    if (condition !== null) {
      // IP 地址搜索需要关联 AccessLog 表
      this.conditions.accessLogs = {
        some: {
          ip: condition,
        },
      }
    }
  }

  /**
   * 获取统计相关的筛选条件
   * 这些条件需要在 Repository 层进行后处理
   */
  getStatisticsFilters(): {
    totalAccesses?: Record<string, unknown>
    lastAccessTime?: Record<string, unknown>
    riskLevel?: Record<string, unknown>
  } {
    const dto = this.searchDto
    const filters: Record<string, Record<string, unknown>> = {}

    if (dto.totalAccesses && typeof dto.totalAccesses === 'object') {
      filters.totalAccesses = dto.totalAccesses as Record<string, unknown>
    }
    else if (typeof dto.totalAccesses === 'number') {
      filters.totalAccesses = { eq: dto.totalAccesses }
    }

    if (dto.lastAccessTime && typeof dto.lastAccessTime === 'object' && !(dto.lastAccessTime instanceof Date)) {
      filters.lastAccessTime = dto.lastAccessTime as Record<string, unknown>
    }
    else if (dto.lastAccessTime instanceof Date) {
      filters.lastAccessTime = { eq: dto.lastAccessTime }
    }

    if (dto.riskLevel && typeof dto.riskLevel === 'object') {
      filters.riskLevel = dto.riskLevel as Record<string, unknown>
    }
    else if (typeof dto.riskLevel === 'string') {
      filters.riskLevel = { eq: dto.riskLevel }
    }

    return filters
  }

  /**
   * 检查是否有统计相关的筛选条件
   */
  hasStatisticsFilters(): boolean {
    const filters = this.getStatisticsFilters()

    return Object.keys(filters).length > 0
  }

  /**
   * 获取聚合筛选条件
   * 返回高级聚合筛选配置
   */
  getAggregateFilters(): Record<string, unknown> {
    const dto = this.searchDto
    const aggregateConditions: Record<string, unknown> = {}

    // 访问总数筛选
    if (dto.accessCountFilter) {
      aggregateConditions.accessCount = buildRelationQuery(
        'accessLogs',
        { _count: this.buildAggregateCondition(dto.accessCountFilter as Record<string, unknown>) },
        'some',
      )
    }

    // IP 地址数量筛选
    if (dto.ipCountFilter) {
      aggregateConditions.ipCount = buildRelationQuery(
        'accessLogs',
        {
          ip: {
            _count: this.buildAggregateCondition(dto.ipCountFilter as Record<string, unknown>),
          },
        },
        'some',
      )
    }

    // 风险访问次数筛选
    if (dto.riskyAccessFilter) {
      aggregateConditions.riskyAccess = buildRelationQuery(
        'accessLogs',
        {
          isRisky: true,
          _count: this.buildAggregateCondition(dto.riskyAccessFilter as Record<string, unknown>),
        },
        'some',
      )
    }

    // 最近访问时间筛选
    if (dto.recentAccessFilter) {
      const timeCondition = toPrismaCondition(dto.recentAccessFilter)

      if (timeCondition) {
        aggregateConditions.recentAccess = buildRelationQuery(
          'accessLogs',
          { accessedAt: timeCondition },
          'some',
        )
      }
    }

    return aggregateConditions
  }

  /**
   * 构建聚合条件
   * @param aggregateFilter 聚合筛选配置
   * @returns 聚合条件
   */
  private buildAggregateCondition(
    aggregateFilter: Record<string, unknown>,
  ): Record<string, unknown> {
    const condition: Record<string, unknown> = {}

    if (aggregateFilter.gte !== null) {
      condition.gte = aggregateFilter.gte
    }

    if (aggregateFilter.lte !== null) {
      condition.lte = aggregateFilter.lte
    }

    if (aggregateFilter.eq !== null) {
      condition.equals = aggregateFilter.eq
    }

    return condition
  }

  /**
   * 检查是否有聚合筛选条件
   */
  hasAggregateFilters(): boolean {
    const dto = this.searchDto

    return !!(
      dto.accessCountFilter
      ?? dto.ipCountFilter
      ?? dto.riskyAccessFilter
      ?? dto.recentAccessFilter
    )
  }
}
