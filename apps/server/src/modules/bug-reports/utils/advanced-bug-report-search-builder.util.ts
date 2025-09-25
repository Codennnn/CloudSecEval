import type { Prisma } from '#prisma/client'
import { EntitySearchBuilder } from '~/common/search/builders/entity-search-builder'
import type { SearchOperators } from '~/common/search/interfaces/search.interface'
import { type BaseFieldSearchConfig, isOperatorValue, isSimpleValue } from '~/common/search/meta/field-metadata'
import { toPrismaCondition } from '~/common/search/operators/search-operators.util'

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
  createdAt: Date
  updatedAt: Date
  reviewedAt: Date
  user: string
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
  user: {
    type: 'string',
    global: false,
    sortable: false,
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
   * 处理用户字段的搜索逻辑，支持根据用户邮箱或名称查询
   */
  protected buildCustomFilters(): void {
    this.buildUserSearchFilter()
  }

  /**
   * 构建用户搜索筛选条件
   * 支持根据用户邮箱或名称进行搜索
   */
  private buildUserSearchFilter(): void {
    const userValue = this.searchDto.user

    if (!userValue) {
      return
    }

    // 处理简单字符串值
    if (isSimpleValue(userValue)) {
      this.conditions.user = {
        OR: [
          {
            email: {
              contains: userValue as string,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: userValue as string,
              mode: 'insensitive',
            },
          },
        ],
      }

      return
    }

    // 处理高级搜索操作符
    if (isOperatorValue(userValue)) {
      const prismaCondition = toPrismaCondition(userValue as SearchOperators<string>)

      if (prismaCondition !== null) {
        // 对于操作符，我们需要将条件应用到邮箱和名称字段上
        this.conditions.user = {
          OR: [
            { email: prismaCondition },
            { name: prismaCondition },
          ],
        }
      }
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
