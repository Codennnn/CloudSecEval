import { type AggregateFilter, AggregateFunction, type SearchOperators } from '../interfaces/search.interface'
import { toPrismaCondition } from '../operators/search-operators.util'

/**
 * 构建聚合筛选条件
 * @param aggregateFilters 聚合筛选配置
 * @returns Prisma 查询条件
 */
export function buildAggregateFilters(
  aggregateFilters: AggregateFilter[],
): Record<string, unknown>[] {
  return aggregateFilters.map((filter) => {
    const condition = toPrismaCondition(filter.condition)

    return {
      [filter.relation ?? filter.field]: {
        _count: filter.function === AggregateFunction.COUNT
          ? condition
          : undefined,
        _sum: filter.function === AggregateFunction.SUM
          ? { [filter.field]: condition }
          : undefined,
        _avg: filter.function === AggregateFunction.AVG
          ? { [filter.field]: condition }
          : undefined,
        _min: filter.function === AggregateFunction.MIN
          ? { [filter.field]: condition }
          : undefined,
        _max: filter.function === AggregateFunction.MAX
          ? { [filter.field]: condition }
          : undefined,
      },
    }
  }).filter(Boolean)
}

/**
 * 构建日期范围查询
 * @param field 字段名
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param includeTime 是否包含时间
 * @returns 查询条件
 */
export function buildDateRangeQuery(
  field: string,
  startDate: Date,
  endDate: Date,
  includeTime = true,
): Record<string, unknown> {
  const start = includeTime ? startDate : new Date(startDate.toDateString())
  const end = includeTime
    ? endDate
    : new Date(new Date(endDate.toDateString()).getTime() + 24 * 60 * 60 * 1000 - 1)

  return {
    [field]: {
      gte: start,
      lte: end,
    },
  }
}

/**
 * 构建数值统计查询
 * @param field 字段名
 * @param operator 操作符
 * @param value 值
 * @param aggregateFunction 聚合函数
 * @returns 查询条件
 */
export function buildNumericStatsQuery(
  field: string,
  operator: keyof SearchOperators<number>,
  value: number,
  aggregateFunction: AggregateFunction = AggregateFunction.COUNT,
): Record<string, unknown> {
  const condition = toPrismaCondition({ [operator]: value })

  return {
    [field]: {
      [`_${aggregateFunction}`]: condition,
    },
  }
}

/**
 * 构建复杂关联查询
 * @param relation 关联表名
 * @param conditions 查询条件
 * @param quantifier 量词：'some', 'every', 'none'
 * @returns 查询条件
 */
export function buildRelationQuery(
  relation: string,
  conditions: Record<string, unknown>,
  quantifier: 'some' | 'every' | 'none' = 'some',
): Record<string, unknown> {
  return {
    [relation]: {
      [quantifier]: conditions,
    },
  }
}

/**
 * 构建全文搜索查询（适用于支持全文搜索的数据库）
 * @param fields 搜索字段
 * @param searchText 搜索文本
 * @param mode 搜索模式
 * @returns 查询条件
 */
export function buildFullTextSearch(
  fields: string[],
  searchText: string,
  mode: 'natural' | 'boolean' | 'phrase' = 'natural',
): Record<string, unknown> {
  // 为 PostgreSQL 全文搜索构建条件
  const searchConditions = fields.map((field) => ({
    [field]: {
      search: searchText,
      mode: mode === 'phrase' ? 'insensitive' : mode,
    },
  }))

  return {
    OR: searchConditions,
  }
}

/**
 * 构建地理位置查询（如果支持地理数据）
 * @param field 地理字段名
 * @param latitude 纬度
 * @param longitude 经度
 * @param radius 半径（米）
 * @returns 查询条件
 */
export function buildGeoQuery(
  field: string,
  latitude: number,
  longitude: number,
  radius: number,
): Record<string, unknown> {
  return {
    [field]: {
      // 这里是示例，实际实现需要根据数据库支持的地理函数
      distance: {
        from: [longitude, latitude],
        lte: radius,
      },
    },
  }
}

/**
 * 构建时间窗口查询
 * @param field 时间字段名
 * @param windowSize 时间窗口大小（毫秒）
 * @param referenceTime 参考时间，默认为当前时间
 * @returns 查询条件
 */
export function buildTimeWindowQuery(
  field: string,
  windowSize: number,
  referenceTime: Date = new Date(),
): Record<string, unknown> {
  const startTime = new Date(referenceTime.getTime() - windowSize)
  const endTime = referenceTime

  return {
    [field]: {
      gte: startTime,
      lte: endTime,
    },
  }
}

/**
 * 构建分组聚合查询
 * @param groupByFields 分组字段
 * @param aggregateFields 聚合字段配置
 * @returns 查询条件
 */
export function buildGroupAggregateQuery(
  groupByFields: string[],
  aggregateFields: {
    field: string
    function: AggregateFunction
    alias?: string
  }[],
): Record<string, unknown> {
  const groupBy = groupByFields.reduce<Record<string, boolean>>((acc, field) => {
    acc[field] = true

    return acc
  }, {})

  const aggregates = aggregateFields.reduce<Record<string, Record<string, boolean>>>(
    (acc, agg) => {
      const funcName = `_${agg.function}`
      acc[funcName] = acc[funcName] ?? {}
      acc[funcName][agg.alias ?? agg.field] = true

      return acc
    },
    {},
  )

  return {
    groupBy,
    ...aggregates,
  }
}
