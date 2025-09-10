import { TZDate } from '@date-fns/tz'
import { BadRequestException } from '@nestjs/common'
import { addDays, format, startOfDay, subDays } from 'date-fns'

const DEFAULT_TIMEZONE = process.env.TIMEZONE ?? 'Asia/Shanghai'

/**
 * 日期范围配置接口
 */
export interface DateRangeConfig {
  /** 开始日期 */
  startDate?: Date
  /** 结束日期 */
  endDate?: Date
  /** 时区，默认为 'Asia/Shanghai' */
  timezone?: string
  /** 默认日期范围天数，默认为 30 天 */
  defaultRangeDays?: number
}

/**
 * 时间序列数据点接口
 */
export interface TimeSeriesDataPoint {
  /** 时间戳 */
  timestamp: string
  /** 数值 */
  value: number
}

/**
 * 数据聚合函数类型
 * @param item 原始数据项
 * @returns 聚合后的数值
 */
export type DataAggregator<T> = (item: T) => number

/**
 * 规范化日期范围
 * 处理默认时间范围逻辑，确保日期的有效性和一致性
 *
 * @param config 日期范围配置
 * @returns 规范化后的开始和结束日期
 * @throws BadRequestException 当日期范围无效时抛出异常
 */
export function normalizeDateRange(config: DateRangeConfig): {
  startDate: Date
  endDate: Date
  timezone: string
} {
  const {
    startDate,
    endDate,
    timezone = DEFAULT_TIMEZONE,
    defaultRangeDays = 30,
  } = config

  let finalStartDate = startDate
  let finalEndDate = endDate
  const now = new Date()

  // 如果两个日期都未提供，默认选取当前日期向前推指定天数
  if (!finalStartDate && !finalEndDate) {
    finalEndDate = now
    finalStartDate = subDays(now, defaultRangeDays)
  }
  // 如果仅提供了 startDate，endDate 自动设定为 startDate 之后的指定天数
  else if (finalStartDate && !finalEndDate) {
    finalEndDate = addDays(finalStartDate, defaultRangeDays)
  }
  // 如果仅提供了 endDate，startDate 自动设定为 endDate 之前的指定天数
  else if (!finalStartDate && finalEndDate) {
    finalStartDate = subDays(finalEndDate, defaultRangeDays)
  }

  // 日期有效性校验：确保 endDate 不早于 startDate
  if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
    throw new BadRequestException('结束日期不能早于开始日期')
  }

  return {
    startDate: finalStartDate!,
    endDate: finalEndDate!,
    timezone,
  }
}

/**
 * 验证日期范围的有效性
 *
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param maxRangeDays 最大日期范围天数，默认为 365 天
 * @throws BadRequestException 当日期无效或范围超出限制时抛出异常
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date,
  maxRangeDays = 365,
): void {
  // 检查日期是否为有效的 Date 对象
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    throw new BadRequestException('开始日期格式无效')
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    throw new BadRequestException('结束日期格式无效')
  }

  // 检查日期逻辑顺序
  if (endDate < startDate) {
    throw new BadRequestException('结束日期不能早于开始日期')
  }

  // 检查日期范围是否超出限制
  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (daysDiff > maxRangeDays) {
    throw new BadRequestException(
      `日期范围不能超过 ${maxRangeDays} 天，当前范围为 ${daysDiff} 天`,
    )
  }
}

/**
 * 填充缺失的日期
 * 在指定日期范围内为缺失的日期添加零值
 *
 * @param dateMap 日期到数值的映射
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param timezone 时区
 */
function fillMissingDates(
  dateMap: Map<string, number>,
  startDate: Date,
  endDate: Date,
  timezone: string,
): void {
  const start = new TZDate(startDate, timezone)
  const end = new TZDate(endDate, timezone)
  const startDay = startOfDay(start)
  const endDay = startOfDay(end)

  // 遍历日期范围，为缺失的日期添加零值占位符
  let currentDate = startDay

  while (currentDate <= endDay) {
    const dateKey = format(currentDate, 'yyyy-MM-dd')

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, 0)
    }

    currentDate = addDays(currentDate, 1)
  }
}

/**
 * 将日期映射转换为时间序列数据
 *
 * @param dateMap 日期到数值的映射
 * @param timezone 时区
 * @returns 时间序列数据点数组
 */
function convertToTimeSeriesData(
  dateMap: Map<string, number>,
  timezone: string,
): TimeSeriesDataPoint[] {
  return Array.from(dateMap.entries())
    .map(([dateKey, value]) => {
      // 创建目标时区的日期对象
      const localDate = new TZDate(`${dateKey}T00:00:00`, timezone)

      return {
        timestamp: localDate.toISOString(),
        value,
      }
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

/**
 * 处理时间序列数据
 * 将原始数据按日期分组，填充缺失日期，并返回时间序列数据点
 *
 * @param data 原始数据数组
 * @param config 日期范围配置
 * @param aggregator 数据聚合函数
 * @returns 时间序列数据点数组
 */
export function processTimeSeriesData<T extends { createdAt: Date }>(
  data: T[],
  config: DateRangeConfig,
  aggregator: DataAggregator<T>,
): TimeSeriesDataPoint[] {
  const { startDate, endDate, timezone } = normalizeDateRange(config)

  // 验证日期范围
  validateDateRange(startDate, endDate)

  // 按日期分组合并数据
  const dateMap = new Map<string, number>()

  data.forEach((item) => {
    // 使用 TZDate 将 UTC 时间转换为目标时区时间
    const zonedDate = new TZDate(item.createdAt, timezone)
    // 获取该时区的日期开始时间
    const dayStart = startOfDay(zonedDate)
    // 格式化为 YYYY-MM-DD 格式作为分组键
    const dateKey = format(dayStart, 'yyyy-MM-dd')

    const currentValue = dateMap.get(dateKey) ?? 0
    const aggregatedValue = aggregator(item)
    dateMap.set(dateKey, currentValue + aggregatedValue)
  })

  // 填充缺失的日期以确保时间序列完整性
  fillMissingDates(dateMap, startDate, endDate, timezone)

  // 转换为 TimeSeriesDataPoint 格式并按日期排序
  return convertToTimeSeriesData(dateMap, timezone)
}

/**
 * 获取日期范围内的所有日期
 *
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param timezone 时区，默认为 'Asia/Shanghai'
 * @returns 日期字符串数组（YYYY-MM-DD 格式）
 */
export function getDateRange(
  startDate: Date,
  endDate: Date,
  timezone = DEFAULT_TIMEZONE,
): string[] {
  validateDateRange(startDate, endDate)

  const dates: string[] = []
  const start = new TZDate(startDate, timezone)
  const end = new TZDate(endDate, timezone)
  const startDay = startOfDay(start)
  const endDay = startOfDay(end)

  let currentDate = startDay

  while (currentDate <= endDay) {
    dates.push(format(currentDate, 'yyyy-MM-dd'))
    currentDate = addDays(currentDate, 1)
  }

  return dates
}

/**
 * 在指定时区格式化日期
 *
 * @param date 要格式化的日期
 * @param formatStr 格式字符串，默认为 'yyyy-MM-dd'
 * @param timezone 时区，默认为 'Asia/Shanghai'
 * @returns 格式化后的日期字符串
 */
export function formatDateInTimezone(
  date: Date,
  formatStr = 'yyyy-MM-dd',
  timezone = DEFAULT_TIMEZONE,
): string {
  const zonedDate = new TZDate(date, timezone)

  return format(zonedDate, formatStr)
}

/**
 * 计算两个日期之间的天数差
 *
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 天数差（正数表示 endDate 在 startDate 之后）
 */
export function getDaysDifference(startDate: Date, endDate: Date): number {
  return Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  )
}
