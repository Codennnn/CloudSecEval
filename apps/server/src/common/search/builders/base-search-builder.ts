import { type BaseSearchCondition, LogicalOperator, type SearchBuilder, type SearchConfig, SearchMode, type SortField } from '~/common/search/interfaces/search.interface'

/**
 * 通用搜索构建器基类
 * 提供基础的搜索条件构建逻辑，具体模块可以继承此类实现特定功能
 */
export abstract class BaseSearchBuilder<
  TWhereInput,
  TOrderByInput,
  TSearchDto extends BaseSearchCondition,
> implements SearchBuilder<TWhereInput, TOrderByInput> {
  protected conditions: Record<string, unknown> = {}
  protected readonly config: SearchConfig

  constructor(
    protected readonly searchDto: TSearchDto,
    config: SearchConfig,
  ) {
    this.config = {
      caseSensitive: false,
      ...config,
    }
  }

  /**
   * 重置搜索条件
   */
  protected resetConditions(): void {
    this.conditions = {}
  }

  /**
   * 构建 where 条件
   */
  buildWhere(): TWhereInput {
    this.resetConditions()

    const searchMode = this.determineSearchMode()

    switch (searchMode) {
      case SearchMode.GLOBAL:
        this.buildGlobalSearch()
        break

      case SearchMode.EXACT:
        this.buildExactSearch()
        break

      case SearchMode.COMBINED:
        this.buildCombinedSearch()
        break

      case SearchMode.ADVANCED:
        this.buildAdvancedSearch()
        break
    }

    this.buildCustomFilters()

    return this.conditions as TWhereInput
  }

  /**
   * 构建排序条件
   */
  buildOrderBy(): TOrderByInput[] {
    const sortFields = this.parseSortFields()

    return this.convertSortFieldsToPrisma(sortFields)
  }

  /**
   * 获取全局搜索字段
   */
  getGlobalSearchFields(): string[] {
    return this.config.globalSearchFields
  }

  /**
   * 智能判断搜索模式
   */
  protected determineSearchMode(): SearchMode {
    // 如果明确指定了搜索模式，使用指定的模式
    if (this.searchDto.searchMode) {
      return this.searchDto.searchMode
    }

    // 检查是否有高级搜索条件（包含操作符的字段）
    if (this.hasAdvancedConditions()) {
      return SearchMode.ADVANCED
    }

    // 检查是否有字段搜索条件
    const hasFieldConditions = this.hasFieldConditions()

    // 如果同时提供了全局搜索和字段搜索，使用组合模式
    if (this.searchDto.search && hasFieldConditions) {
      return SearchMode.COMBINED
    }

    // 如果只提供了全局搜索，使用全局模式
    if (this.searchDto.search) {
      return SearchMode.GLOBAL
    }

    // 如果只提供了字段搜索，使用精确模式
    if (hasFieldConditions) {
      return SearchMode.EXACT
    }

    // 默认使用全局模式
    return SearchMode.GLOBAL
  }

  /**
   * 构建全局搜索条件
   */
  protected buildGlobalSearch(): void {
    if (!this.searchDto.search) {
      return
    }

    const globalConditions = this.config.globalSearchFields.map((field) => ({
      [field]: {
        contains: this.searchDto.search,
        mode: this.config.caseSensitive ? 'default' : 'insensitive',
      },
    }))

    if (globalConditions.length > 0) {
      this.conditions.OR = globalConditions
    }
  }

  /**
   * 构建精确搜索条件
   */
  protected buildExactSearch(): void {
    const exactConditions = this.buildFieldConditions()
    Object.assign(this.conditions, exactConditions)
  }

  /**
   * 构建组合搜索条件
   */
  protected buildCombinedSearch(): void {
    const conditions: Record<string, unknown>[] = []
    const operator = this.searchDto.operator ?? LogicalOperator.AND

    // 添加全局搜索条件
    if (this.searchDto.search) {
      const globalConditions = this.config.globalSearchFields.map((field) => ({
        [field]: {
          contains: this.searchDto.search,
          mode: this.config.caseSensitive ? 'default' : 'insensitive',
        },
      }))

      if (globalConditions.length > 0) {
        conditions.push({ OR: globalConditions })
      }
    }

    // 添加字段搜索条件
    const fieldConditions = this.buildFieldConditions()

    if (Object.keys(fieldConditions).length > 0) {
      if (operator === LogicalOperator.AND) {
        conditions.push(fieldConditions)
      }
      else {
        // OR 操作：将字段条件转换为 OR 数组
        const orConditions = Object.entries(fieldConditions).map(([key, value]) => ({
          [key]: value,
        }))
        conditions.push({ OR: orConditions })
      }
    }

    // 组合所有条件
    if (conditions.length > 1) {
      this.conditions.AND = conditions
    }
    else if (conditions.length === 1) {
      Object.assign(this.conditions, conditions[0])
    }
  }

  /**
   * 构建高级搜索条件
   */
  protected buildAdvancedSearch(): void {
    // 结合精确搜索和操作符搜索
    this.buildExactSearch()
    this.buildOperatorConditions()
  }

  /**
   * 解析排序字段
   */
  protected parseSortFields(): SortField[] {
    if (!this.searchDto.sortBy) {
      return [this.config.defaultSort]
    }

    // 如果是字符串，转换为 SortField 对象
    if (typeof this.searchDto.sortBy === 'string') {
      const field = this.searchDto.sortBy
      const order = this.searchDto.sortOrder ?? this.config.defaultSort.order

      // 验证字段是否允许排序
      if (!this.config.allowedSortFields.includes(field)) {
        return [this.config.defaultSort]
      }

      return [{ field, order }]
    }

    // 如果是数组，验证每个字段
    return this.searchDto.sortBy.filter((sortField) =>
      this.config.allowedSortFields.includes(sortField.field),
    )
  }

  /**
   * 将排序字段转换为 Prisma 格式
   */
  protected convertSortFieldsToPrisma(sortFields: SortField[]): TOrderByInput[] {
    return sortFields.map((sortField): TOrderByInput => ({
      [sortField.field]: sortField.order,
    }) as TOrderByInput)
  }

  // 抽象方法，由子类实现
  /**
   * 检查是否有高级搜索条件
   */
  protected abstract hasAdvancedConditions(): boolean

  /**
   * 检查是否有字段搜索条件
   */
  protected abstract hasFieldConditions(): boolean

  /**
   * 构建字段搜索条件
   */
  protected abstract buildFieldConditions(): Record<string, unknown>

  /**
   * 构建操作符搜索条件
   */
  protected abstract buildOperatorConditions(): void

  /**
   * 构建自定义筛选条件
   */
  protected abstract buildCustomFilters(): void
}
