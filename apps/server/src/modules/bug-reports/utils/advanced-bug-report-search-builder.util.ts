import type { Prisma } from '#prisma/client'
import { EntitySearchBuilder } from '~/common/search/builders/entity-search-builder'
import { type BaseFieldSearchConfig } from '~/common/search/meta/field-metadata'

import type { FindBugReportsDto } from '../dto/find-bug-reports.dto'

/**
 * 漏洞报告搜索字段类型定义
 */
interface BugReportSearchFields {
  title: string
  severity: string
  attackMethod: string
  description: string
  status: string
  userId: string
  reviewerId: string
  orgId: string
  createdAt: Date
  updatedAt: Date
  reviewedAt: Date
}

/**
 * 基于漏洞报告实体类的字段元数据配置
 * - 从 BugReport 实体类自动推导字段类型
 * - 集中配置每个字段的搜索能力
 * - 当实体字段变更时，TypeScript 会提供类型检查
 */
const BUG_REPORT_FIELD_CONFIG = {
  title: {
    type: 'string',
    global: true,
    sortable: true,
    searchable: true,
  },
  severity: {
    type: 'enum',
    global: false,
    sortable: true,
    searchable: true,
  },
  attackMethod: {
    type: 'string',
    global: true,
    sortable: false,
    searchable: true,
  },
  description: {
    type: 'string',
    global: true,
    sortable: false,
    searchable: true,
  },
  status: {
    type: 'enum',
    global: false,
    sortable: true,
    searchable: true,
  },
  userId: {
    type: 'string',
    global: false,
    sortable: false,
    searchable: false, // UUID 字段不参与搜索
  },
  reviewerId: {
    type: 'string',
    global: false,
    sortable: false,
    searchable: false, // UUID 字段不参与搜索
  },
  orgId: {
    type: 'string',
    global: false,
    sortable: false,
    searchable: false, // UUID 字段不参与搜索
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
  reviewedAt: {
    type: 'date',
    global: false,
    sortable: true,
    searchable: true,
  },
} as const satisfies Record<keyof BugReportSearchFields, BaseFieldSearchConfig>

/**
 * 漏洞报告搜索构建器
 * 使用通用的实体搜索框架，消除重复代码
 * - 字段配置基于漏洞报告实体类自动生成
 * - 当实体字段变更时自动同步
 * - 继承通用的搜索逻辑，专注于漏洞报告特定的业务逻辑
 */
export class AdvancedBugReportSearchBuilder extends EntitySearchBuilder<
  Prisma.BugReportWhereInput,
  Prisma.BugReportOrderByWithRelationInput,
  FindBugReportsDto,
  typeof BUG_REPORT_FIELD_CONFIG
> {
  /**
   * 构造函数
   * - 使用通用实体搜索构建器
   * - 传入漏洞报告特定的字段配置
   */
  constructor(searchDto: FindBugReportsDto) {
    super(
      searchDto,
      BUG_REPORT_FIELD_CONFIG,
      {}, // 无扩展字段
      'createdAt', // 默认排序字段
    )
  }

  /**
   * 构建自定义筛选条件
   * 处理 UUID 字段的精确匹配筛选
   */
  protected buildCustomFilters(): void {
    const { userId, reviewerId, orgId } = this.searchDto

    // UUID 字段只支持精确匹配
    if (userId) {
      this.conditions.userId = userId
    }

    if (reviewerId) {
      this.conditions.reviewerId = reviewerId
    }

    if (orgId) {
      this.conditions.orgId = orgId
    }
  }

  /**
   * 获取单个排序条件（适配现有 repository 接口）
   */
  getOrderBy(): Prisma.BugReportOrderByWithRelationInput {
    const orderByList = this.buildOrderBy()

    // 返回第一个排序条件，如果没有则使用默认排序
    return orderByList.length > 0 ? orderByList[0] : { createdAt: 'desc' }
  }
}
