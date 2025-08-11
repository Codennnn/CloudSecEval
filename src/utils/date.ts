import { differenceInDays, differenceInHours, differenceInMinutes, format } from 'date-fns'

/**
 * 日期格式化，适配 date-fns
 * 所有格式均遵循 date-fns 的格式化字符串规则：
 *
 * - yyyy: 4位数年份
 * - MM: 2位数月份 (01-12)
 * - dd: 2位数日期 (01-31)
 * - HH: 24小时制 (00-23)
 * - mm: 分钟 (00-59)
 * - ss: 秒钟 (00-59)
 */
export const enum DateFormat {
  /** 年-月-日 (例：2024-03-21) */
  YYYY_MM_DD = 'yyyy-MM-dd',
  /** 年-月-日 时:分 (例：2024-03-21 15:30) */
  YYYY_MM_DD_HH_MM = 'yyyy-MM-dd HH:mm',
  /** 年-月-日 时:分:秒 (例：2024-03-21 15:30:45) */
  YYYY_MM_DD_HH_MM_SS = 'yyyy-MM-dd HH:mm:ss',
  /** 年-月-日 时:分 (例：2024年03月21日 15:30) */
  YYYY年MM月DD日HH时MM分 = 'yyyy年MM月dd日 HH:mm',
  /** 月-日 时:分 (例：03-21 15:30) */
  MM_DD_HH_MM = 'MM-dd HH:mm',
  /** 月-日 (例：03-21) */
  MM_DD = 'MM-dd',
  /** 时:分 (例：15:30) */
  HH_MM = 'HH:mm',
  /** xx 时 xx 分 (例：15 时 30 分) */
  HH时MM分 = 'HH 时 MM 分',
}

/**
 * 格式化日期为指定格式的字符串
 *
 * @param date - 支持 Date 对象、时间戳、ISO 字符串等 date-fns 可解析的日期格式
 * @param format - 日期格式模板，默认为 'yyyy-MM-dd HH:mm:ss'
 * @returns 格式化后的日期字符串，如果输入为空则返回 undefined
 *
 * @example
 * formatDate(new Date())                    // '2024-03-20 15:30:00'
 * formatDate('2024-03-20', 'yyyy-MM-dd')   // '2024-03-20'
 * formatDate(1710921600000)                // '2024-03-20 15:30:00'
 * formatDate(null)                         // undefined
 */
export function formatDate(
  date: unknown,
  formatStr = DateFormat.YYYY_MM_DD_HH_MM_SS,
): string | undefined {
  if (date) {
    const dateObj = new Date(date as string | number | Date)

    return format(dateObj, formatStr)
  }

  return undefined
}

/**
 * 格式化日期范围数组为开始和结束时间对象
 *
 * @param dateRange - 包含开始和结束日期的数组 [startDate, endDate]
 * @param format - 日期格式模板，默认为 'yyyy-MM-dd HH:mm:ss'
 * @returns 包含格式化后的开始时间和结束时间的对象
 *
 * @example
 * // 自定义格式
 * formatDateRange(['2024-03-20', '2024-03-21'], 'yyyy-MM-dd')
 * // 返回: {
 * //   start: '2024-03-20',
 * //   end: '2024-03-21'
 * // }
 *
 * formatDateRange(null)
 * // 返回: { start: undefined, end: undefined }
 */
export function formatDateRange(
  dateRange: unknown,
  formatStr = DateFormat.YYYY_MM_DD_HH_MM_SS,
): { start: string | undefined, end: string | undefined } {
  if (Array.isArray(dateRange)) {
    return {
      start: formatDate(dateRange.at(0), formatStr),
      end: formatDate(dateRange.at(1), formatStr),
    }
  }

  return { start: undefined, end: undefined }
}

/**
 * 将日期格式化为相对时间描述
 *
 * @param date - 支持 Date 对象、时间戳、ISO 字符串等 date-fns 可解析的日期格式
 * @returns 返回相对时间描述，如"5 分钟前"、"2 小时前"、"3 天前"等。
 *          如果超过 30 天则返回具体日期，如果输入为空则返回 undefined
 *
 * @example
 * formatRelativeTime(new Date())           // "刚刚"
 * formatRelativeTime('2024-03-20 12:00')   // "3 小时前"
 * formatRelativeTime('2024-02-20')         // "2024-02-20"
 * formatRelativeTime(null)                 // undefined
 */
export function formatRelativeTime(date: unknown): string | undefined {
  if (date) {
    const now = new Date()
    const target = new Date(date as string | number | Date)

    // 先计算分钟差
    const diffMinutes = differenceInMinutes(now, target)

    if (diffMinutes < 60) {
      if (diffMinutes <= 1) {
        return '刚刚'
      }

      return `${diffMinutes} 分钟前`
    }

    // 超过60分钟，再计算小时差
    const diffHours = differenceInHours(now, target)

    if (diffHours < 24) {
      return `${diffHours} 小时前`
    }

    // 超过24小时，再计算天数差
    const diffDays = differenceInDays(now, target)

    if (diffDays < 30) {
      return `${diffDays} 天前`
    }

    // 超过30天，返回具体日期
    return formatDate(date, DateFormat.YYYY_MM_DD)
  }

  return undefined
}
