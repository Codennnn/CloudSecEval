import { type BaseSearchCondition, type SearchConfig, SortOrder } from '../interfaces/search.interface'
import {
  type BaseFieldSearchConfig,
  buildSimpleCondition,
  FieldConfigManager,
  isOperatorValue,
  isSimpleValue,
} from '../meta/field-metadata'
import { toPrismaCondition } from '../operators/search-operators.util'
import { BaseSearchBuilder } from './base-search-builder'

/**
 * 基于实体的搜索构建器抽象类
 * 封装了基于字段元数据的通用搜索逻辑，消除重复代码
 */
export abstract class EntitySearchBuilder<
  TWhereInput,
  TOrderByInput,
  TSearchDto extends BaseSearchCondition,
  TFieldConfig extends Record<string, BaseFieldSearchConfig>,
> extends BaseSearchBuilder<TWhereInput, TOrderByInput, TSearchDto> {
  protected readonly fieldManager: FieldConfigManager<TFieldConfig>

  constructor(
    searchDto: TSearchDto,
    fieldConfig: TFieldConfig,
    extendedConfig: Record<string, BaseFieldSearchConfig> = {},
    defaultSortField = 'createdAt',
    defaultSortOrder = SortOrder.DESC,
  ) {
    // 创建字段配置管理器
    const fieldManager = new FieldConfigManager(fieldConfig, extendedConfig)

    // 生成搜索配置
    const searchConfig: SearchConfig = {
      globalSearchFields: fieldManager.getGlobalSearchFields(),
      allowedSortFields: fieldManager.getSortableFields(),
      defaultSort: {
        field: defaultSortField,
        order: defaultSortOrder,
      },
      caseSensitive: false,
    }

    super(searchDto, searchConfig)

    this.fieldManager = fieldManager
  }

  /**
   * 检查是否有高级搜索条件（操作符查询）
   * - 基于字段配置自动检查所有可搜索字段
   * - 任一可搜索字段传入操作符对象视为高级条件
   */
  protected hasAdvancedConditions(): boolean {
    const dto = this.searchDto as Record<string, unknown>
    const searchableFields = this.fieldManager.getSearchableFields()

    for (const field of searchableFields) {
      const value = dto[field]

      if (isOperatorValue(value)) {
        return true
      }
    }

    return false
  }

  /**
   * 检查是否有字段搜索条件（简单值查询）
   * - 基于字段配置自动检查所有可搜索字段
   * - 任一可搜索字段传入简单值视为字段条件
   */
  protected hasFieldConditions(): boolean {
    const dto = this.searchDto as Record<string, unknown>
    const searchableFields = this.fieldManager.getSearchableFields()

    for (const field of searchableFields) {
      const value = dto[field]

      if (isSimpleValue(value)) {
        return true
      }
    }

    return false
  }

  /**
   * 构建字段搜索条件（简单值）
   * - 基于字段配置和类型自动处理
   * - 跳过特殊字段，由子类专门处理
   */
  protected buildFieldConditions(): Record<string, unknown> {
    const conditions: Record<string, unknown> = {}
    const dto = this.searchDto as Record<string, unknown>
    const searchableFields = this.fieldManager.getSearchableFields()
    const specialFields = this.fieldManager.getSpecialFields()

    for (const field of searchableFields) {
      // 跳过特殊字段，它们需要专门处理
      if (specialFields.includes(field)) {
        continue
      }

      const fieldConfig = this.fieldManager.getFieldConfig(field)
      const value = dto[field]

      if (fieldConfig && isSimpleValue(value)) {
        const condition = buildSimpleCondition(fieldConfig.type, value)

        if (condition !== null) {
          conditions[field] = condition
        }
      }
    }

    return conditions
  }

  /**
   * 构建操作符搜索条件（对象值）
   * - 基于字段配置自动处理所有可搜索字段
   * - 特殊字段通过 buildSpecialOperatorConditions 处理
   * - 统一通过 toPrismaCondition 转换
   */
  protected buildOperatorConditions(): void {
    const dto = this.searchDto as Record<string, unknown>
    const searchableFields = this.fieldManager.getSearchableFields()
    const specialFields = this.fieldManager.getSpecialFields()

    for (const field of searchableFields) {
      const value = dto[field]

      if (isOperatorValue(value)) {
        // 特殊字段需要专门处理
        if (specialFields.includes(field)) {
          this.buildSpecialOperatorCondition(field, value as Record<string, unknown>)
          continue
        }

        const condition = toPrismaCondition(value as Record<string, unknown>)

        if (condition !== null) {
          this.conditions[field] = condition
        }
      }
    }
  }

  /**
   * 构建特殊字段的操作符条件
   * 子类需要重写此方法来处理特殊字段
   */
  protected buildSpecialOperatorCondition(field: string, value: Record<string, unknown>): void {
    // 默认实现：尝试使用通用转换
    const condition = toPrismaCondition(value)

    if (condition !== null) {
      this.conditions[field] = condition
    }
  }

  /**
   * 获取字段配置管理器
   * 供子类使用
   */
  protected getFieldManager(): FieldConfigManager<TFieldConfig> {
    return this.fieldManager
  }
}
