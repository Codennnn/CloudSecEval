import { addDays, subDays } from 'date-fns'

import { BusinessException } from '~/common/exceptions/business.exception'

import {
  formatDateInTimezone,
  getDateRange,
  getDaysDifference,
  normalizeDateRange,
  processTimeSeriesData,
  validateDateRange,
} from './date-processor.util'

describe('DateProcessorUtil', () => {
  describe('normalizeDateRange', () => {
    it('应该为空日期设置默认30天范围', () => {
      const result = normalizeDateRange({})

      expect(result.startDate).toBeInstanceOf(Date)
      expect(result.endDate).toBeInstanceOf(Date)
      expect(result.timezone).toBe('Asia/Shanghai')

      // 验证日期范围约为30天
      const daysDiff = Math.ceil(
        (result.endDate.getTime() - result.startDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      expect(daysDiff).toBe(30)
    })

    it('应该为仅提供开始日期时设置结束日期', () => {
      const startDate = new Date('2024-01-01')
      const result = normalizeDateRange({ startDate })

      expect(result.startDate).toEqual(startDate)
      expect(result.endDate).toEqual(addDays(startDate, 30))
    })

    it('应该为仅提供结束日期时设置开始日期', () => {
      const endDate = new Date('2024-01-31')
      const result = normalizeDateRange({ endDate })

      expect(result.endDate).toEqual(endDate)
      expect(result.startDate).toEqual(subDays(endDate, 30))
    })

    it('应该使用自定义默认范围天数', () => {
      const result = normalizeDateRange({ defaultRangeDays: 7 })

      const daysDiff = Math.ceil(
        (result.endDate.getTime() - result.startDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      expect(daysDiff).toBe(7)
    })

    it('应该在结束日期早于开始日期时抛出异常', () => {
      const startDate = new Date('2024-01-31')
      const endDate = new Date('2024-01-01')

      expect(() => {
        normalizeDateRange({ startDate, endDate })
      }).toThrow(BusinessException)
    })

    it('应该使用自定义时区', () => {
      const result = normalizeDateRange({ timezone: 'UTC' })

      expect(result.timezone).toBe('UTC')
    })
  })

  describe('validateDateRange', () => {
    it('应该验证有效的日期范围', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      expect(() => {
        validateDateRange(startDate, endDate)
      }).not.toThrow()
    })

    it('应该在开始日期无效时抛出异常', () => {
      const startDate = new Date('invalid')
      const endDate = new Date('2024-01-31')

      expect(() => {
        validateDateRange(startDate, endDate)
      }).toThrow(BusinessException)
    })

    it('应该在结束日期无效时抛出异常', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('invalid')

      expect(() => {
        validateDateRange(startDate, endDate)
      }).toThrow(BusinessException)
    })

    it('应该在结束日期早于开始日期时抛出异常', () => {
      const startDate = new Date('2024-01-31')
      const endDate = new Date('2024-01-01')

      expect(() => {
        validateDateRange(startDate, endDate)
      }).toThrow(BusinessException)
    })

    it('应该在日期范围超出限制时抛出异常', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2025-01-01') // 365天

      expect(() => {
        validateDateRange(startDate, endDate, 100)
      }).toThrow(BusinessException)
    })
  })

  describe('processTimeSeriesData', () => {
    const mockData = [
      { createdAt: new Date('2024-01-01T10:00:00Z'), count: 5 },
      { createdAt: new Date('2024-01-01T15:00:00Z'), count: 3 },
      { createdAt: new Date('2024-01-03T12:00:00Z'), count: 7 },
    ]

    it('应该正确处理时间序列数据', () => {
      const result = processTimeSeriesData(
        mockData,
        {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-03'),
          timezone: 'UTC',
        },
        (item) => item.count,
      )

      expect(result).toHaveLength(3) // 3天的数据
      expect(result[0].value).toBe(8) // 2024-01-01: 5 + 3
      expect(result[1].value).toBe(0) // 2024-01-02: 缺失数据，应为0
      expect(result[2].value).toBe(7) // 2024-01-03: 7
    })

    it('应该按时间戳排序结果', () => {
      const result = processTimeSeriesData(
        mockData,
        {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-03'),
          timezone: 'UTC',
        },
        (item) => item.count,
      )

      for (let i = 1; i < result.length; i++) {
        expect(result[i].timestamp >= result[i - 1].timestamp).toBe(true)
      }
    })

    it('应该填充缺失的日期', () => {
      const result = processTimeSeriesData(
        [{ createdAt: new Date('2024-01-01T10:00:00Z'), count: 5 }],
        {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-05'),
          timezone: 'UTC',
        },
        (item) => item.count,
      )

      expect(result).toHaveLength(5) // 5天的数据
      expect(result[0].value).toBe(5) // 有数据的日期
      expect(result[1].value).toBe(0) // 缺失数据的日期
      expect(result[2].value).toBe(0)
      expect(result[3].value).toBe(0)
      expect(result[4].value).toBe(0)
    })
  })

  describe('getDateRange', () => {
    it('应该返回日期范围内的所有日期', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-03')

      const result = getDateRange(startDate, endDate, 'UTC')

      expect(result).toEqual([
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
      ])
    })

    it('应该处理单天范围', () => {
      const date = new Date('2024-01-01')

      const result = getDateRange(date, date, 'UTC')

      expect(result).toEqual(['2024-01-01'])
    })
  })

  describe('formatDateInTimezone', () => {
    it('应该格式化日期为指定时区', () => {
      const date = new Date('2024-01-01T12:00:00Z')

      const result = formatDateInTimezone(date, 'yyyy-MM-dd', 'UTC')

      expect(result).toBe('2024-01-01')
    })

    it('应该使用自定义格式', () => {
      const date = new Date('2024-01-01T12:00:00Z')

      const result = formatDateInTimezone(
        date,
        'yyyy-MM-dd HH:mm:ss',
        'UTC',
      )

      expect(result).toBe('2024-01-01 12:00:00')
    })
  })

  describe('getDaysDifference', () => {
    it('应该计算正确的天数差', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-05')

      const result = getDaysDifference(startDate, endDate)

      expect(result).toBe(4)
    })

    it('应该处理同一天的情况', () => {
      const date = new Date('2024-01-01')

      const result = getDaysDifference(date, date)

      expect(result).toBe(0)
    })

    it('应该处理负数天数差', () => {
      const startDate = new Date('2024-01-05')
      const endDate = new Date('2024-01-01')

      const result = getDaysDifference(startDate, endDate)

      expect(result).toBe(-4)
    })
  })
})
