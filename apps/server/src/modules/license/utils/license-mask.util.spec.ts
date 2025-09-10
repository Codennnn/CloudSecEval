import type { UnsafeAny } from '~/types/common'

import {
  getLicenseMaskPreview,
  isStandardLicenseFormat,
  type MaskConfig,
  maskLicenseCode,
  maskLicensesData,
} from './license-mask.util'

describe('LicenseMaskUtil', () => {
  describe('maskLicenseCode', () => {
    describe('标准格式授权码', () => {
      it('应该正确脱敏3段格式的授权码', () => {
        expect(maskLicenseCode('abc-123-def')).toBe('a*c-1*3-d*f')
        expect(maskLicenseCode('act-001-ive')).toBe('a*t-0*1-i*e')
        expect(maskLicenseCode('exp-002-ire')).toBe('e*p-0*2-i*e')
      })

      it('应该正确脱敏4段+校验位格式的授权码', () => {
        expect(maskLicenseCode('ABCD-EFGH-IJKL-MNOP-Q')).toBe('A**D-E**H-I**L-M**P-*')
        expect(maskLicenseCode('1234-5678-90AB-CDEF-G')).toBe('1**4-5**8-9**B-C**F-*')
        expect(maskLicenseCode('TEST-CODE-MASK-DEMO-X')).toBe('T**T-C**E-M**K-D**O-*')
      })

      it('应该正确脱敏使用下划线分隔符的授权码', () => {
        expect(maskLicenseCode('ABCD_EFGH_IJKL_MNOP_Q')).toBe('A**D_E**H_I**L_M**P_*')
        expect(maskLicenseCode('TEST_CODE_MASK_X')).toBe('T**T_C**E_M**K_*')
      })

      it('应该处理包含不同长度段的授权码', () => {
        expect(maskLicenseCode('a-1-b')).toBe('*-*-*') // 每段只有1个字符
        expect(maskLicenseCode('ab-12-cd')).toBe('**-**-**') // 每段2个字符
        expect(maskLicenseCode('abcd-1234-efgh')).toBe('a**d-1**4-e**h') // 每段4个字符
      })

      it('应该处理空段的情况', () => {
        // 包含空段的授权码被视为非标准格式，进行整体脱敏
        expect(maskLicenseCode('abc--def')).toBe('a******f')
        expect(maskLicenseCode('-123-')).toBe('-***-')
      })
    })

    describe('非标准格式授权码', () => {
      it('应该对非标准格式进行简单脱敏', () => {
        expect(maskLicenseCode('short')).toBe('s***t')
        expect(maskLicenseCode('invalid-format')).toBe('i************t')
        expect(maskLicenseCode('single')).toBe('s****e')
      })

      it('应该处理包含多个连字符的字符串', () => {
        // 5段格式被视为标准格式，进行分段脱敏
        expect(maskLicenseCode('a-b-c-d-e')).toBe('*-*-*-*-*')
        // 6段格式被视为标准格式，进行分段脱敏
        expect(maskLicenseCode('test-with-many-dashes')).toBe('t**t-w**h-m**y-d****s')
      })
    })

    describe('边界情况', () => {
      it('应该处理空字符串和null值', () => {
        expect(maskLicenseCode('')).toBe('')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect(maskLicenseCode(null as UnsafeAny)).toBe(null)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect(maskLicenseCode(undefined as UnsafeAny)).toBe(undefined)
      })

      it('应该处理长度小于最小值的字符串', () => {
        expect(maskLicenseCode('a')).toBe('a')
        expect(maskLicenseCode('ab')).toBe('ab')
        expect(maskLicenseCode('abc')).toBe('a*c') // 刚好等于最小长度
      })

      it('应该处理只包含连字符的字符串', () => {
        expect(maskLicenseCode('-')).toBe('-')
        expect(maskLicenseCode('--')).toBe('--')
        expect(maskLicenseCode('---')).toBe('-*-')
      })
    })

    describe('自定义配置', () => {
      it('应该使用自定义脱敏字符', () => {
        const config: MaskConfig = { maskChar: '#' }
        expect(maskLicenseCode('abc-123-def', config)).toBe('a#c-1#3-d#f')
        expect(maskLicenseCode('short', config)).toBe('s###t')
      })

      it('应该支持不保留首尾字符', () => {
        const config: MaskConfig = { preserveEdges: false }
        expect(maskLicenseCode('abc-123-def', config)).toBe('***-***-***')
        expect(maskLicenseCode('short', config)).toBe('*****')
      })

      it('应该使用自定义最小长度', () => {
        const config: MaskConfig = { minLength: 5 }
        expect(maskLicenseCode('abc')).toBe('a*c') // 默认最小长度3
        expect(maskLicenseCode('abc', config)).toBe('abc') // 自定义最小长度5
        expect(maskLicenseCode('abcde', config)).toBe('a***e')
      })

      it('应该支持组合配置', () => {
        const config: MaskConfig = {
          maskChar: '#',
          preserveEdges: false,
          minLength: 4,
        }
        expect(maskLicenseCode('abc', config)).toBe('abc') // 长度不足
        expect(maskLicenseCode('abcd', config)).toBe('####') // 不保留首尾
        expect(maskLicenseCode('abc-123-def', config)).toBe('###-###-###')
      })
    })
  })

  describe('maskLicensesData', () => {
    it('应该对授权码数组进行批量脱敏', () => {
      const licenses = [
        { id: '1', code: 'abc-123-def', email: 'test1@example.com' },
        { id: '2', code: 'exp-456-ire', email: 'test2@example.com' },
        { id: '3', code: 'short', email: 'test3@example.com' },
      ]

      const result = maskLicensesData(licenses)

      expect(result).toEqual([
        { id: '1', code: 'a*c-1*3-d*f', email: 'test1@example.com' },
        { id: '2', code: 'e*p-4*6-i*e', email: 'test2@example.com' },
        { id: '3', code: 's***t', email: 'test3@example.com' },
      ])
    })

    it('应该支持自定义字段名', () => {
      const data = [
        { licenseCode: 'abc-123-def', name: 'Test' },
        { licenseCode: 'exp-456-ire', name: 'Test2' },
      ]

      const result = maskLicensesData(data, 'licenseCode')

      expect(result).toEqual([
        { licenseCode: 'a*c-1*3-d*f', name: 'Test' },
        { licenseCode: 'e*p-4*6-i*e', name: 'Test2' },
      ])
    })

    it('应该支持自定义脱敏配置', () => {
      const licenses = [
        { code: 'abc-123-def' },
        { code: 'short' },
      ]
      const config: MaskConfig = { maskChar: '#' }

      const result = maskLicensesData(licenses, 'code', config)

      expect(result).toEqual([
        { code: 'a#c-1#3-d#f' },
        { code: 's###t' },
      ])
    })

    it('应该处理空数组', () => {
      expect(maskLicensesData([])).toEqual([])
    })

    it('应该处理不存在指定字段的对象', () => {
      const data = [{ name: 'Test', code: undefined }]
      const result = maskLicensesData(data, 'code')

      expect(result).toEqual([{ name: 'Test', code: undefined }])
    })
  })

  describe('isStandardLicenseFormat', () => {
    it('应该正确识别标准格式', () => {
      // 3段格式
      expect(isStandardLicenseFormat('abc-123-def')).toBe(true)
      expect(isStandardLicenseFormat('a-b-c')).toBe(true)
      expect(isStandardLicenseFormat('test-001-code')).toBe(true)

      // 4段+校验位格式
      expect(isStandardLicenseFormat('ABCD-EFGH-IJKL-MNOP-Q')).toBe(true)
      expect(isStandardLicenseFormat('1234-5678-90AB-CDEF-G')).toBe(true)

      // 5段格式
      expect(isStandardLicenseFormat('ABC-DEF-GHI-JKL-MNO-P')).toBe(true)

      // 下划线分隔符
      expect(isStandardLicenseFormat('ABCD_EFGH_IJKL_MNOP_Q')).toBe(true)
      expect(isStandardLicenseFormat('TEST_CODE_MASK')).toBe(true)
    })

    it('应该正确识别非标准格式', () => {
      expect(isStandardLicenseFormat('abc-123')).toBe(false) // 只有两段
      expect(isStandardLicenseFormat('abc123def')).toBe(false) // 无分隔符
      expect(isStandardLicenseFormat('abc--def')).toBe(false) // 空段
      expect(isStandardLicenseFormat('-123-def')).toBe(false) // 空段
      expect(isStandardLicenseFormat('abc_-def_ghi')).toBe(false) // 混合分隔符
    })

    it('应该处理边界情况', () => {
      expect(isStandardLicenseFormat('')).toBe(false)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(isStandardLicenseFormat(null as UnsafeAny)).toBe(false)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(isStandardLicenseFormat(undefined as UnsafeAny)).toBe(false)
      expect(isStandardLicenseFormat('--')).toBe(false)
    })
  })

  describe('getLicenseMaskPreview', () => {
    it('应该返回完整的脱敏预览信息', () => {
      const result = getLicenseMaskPreview('abc-123-def')

      expect(result).toEqual({
        original: 'abc-123-def',
        masked: 'a*c-1*3-d*f',
        isStandardFormat: true,
      })
    })

    it('应该正确处理新格式授权码', () => {
      const result = getLicenseMaskPreview('ABCD-EFGH-IJKL-MNOP-Q')

      expect(result).toEqual({
        original: 'ABCD-EFGH-IJKL-MNOP-Q',
        masked: 'A**D-E**H-I**L-M**P-*',
        isStandardFormat: true,
      })
    })

    it('应该正确处理下划线分隔符格式', () => {
      const result = getLicenseMaskPreview('TEST_CODE_MASK_X')

      expect(result).toEqual({
        original: 'TEST_CODE_MASK_X',
        masked: 'T**T_C**E_M**K_*',
        isStandardFormat: true,
      })
    })

    it('应该处理非标准格式', () => {
      const result = getLicenseMaskPreview('short')

      expect(result).toEqual({
        original: 'short',
        masked: 's***t',
        isStandardFormat: false,
      })
    })

    it('应该支持自定义配置', () => {
      const config: MaskConfig = { maskChar: '#' }
      const result = getLicenseMaskPreview('abc-123-def', config)

      expect(result).toEqual({
        original: 'abc-123-def',
        masked: 'a#c-1#3-d#f',
        isStandardFormat: true,
      })
    })

    it('应该处理空字符串', () => {
      const result = getLicenseMaskPreview('')

      expect(result).toEqual({
        original: '',
        masked: '',
        isStandardFormat: false,
      })
    })
  })
})
