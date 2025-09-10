import type { AnyType } from '~/types/common'

import {
  generateLicenseCode,
  generateLicenseCodes,
  generateUniqueLicenseCode,
  generateUniqueLicenseCodes,
  type LicenseCodeChecker,
  type LicenseGeneratorConfig,
  validateLicenseCode,
  validateLicenseCodeChecksum,
  validateLicenseCodeFormat,
} from './license-generator.util'

describe('LicenseGeneratorUtil', () => {
  describe('generateLicenseCode', () => {
    it('应该生成默认格式的授权码', () => {
      const code = generateLicenseCode()

      // 默认格式：XXXX-XXXX-XXXX-XXXX-X（16位+1位校验位，分4组）
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]$/)
      expect(code.split('-')).toHaveLength(5)
      expect(code.split('-').slice(0, 4).every((part) => part.length === 4)).toBe(true)
      expect(code.split('-')[4].length).toBe(1) // 校验位
    })

    it('应该支持自定义配置', () => {
      const config: LicenseGeneratorConfig = {
        charset: 'ABCDEF123456',
        partLength: 3,
        totalLength: 6,
        separator: '_',
        enableChecksum: true,
      }

      const code = generateLicenseCode(config)

      // 6位主体+1位校验位，按3位分组：XXX_XXX_X
      expect(code).toMatch(/^[ABCDEF123456]{3}_[ABCDEF123456]{3}_[ABCDEF123456]$/)
      expect(code.split('_')).toHaveLength(3)
      expect(code.split('_').slice(0, 2).every((part) => part.length === 3)).toBe(true)
      expect(code.split('_')[2].length).toBe(1) // 校验位
    })

    it('应该生成不同的授权码', () => {
      const codes = Array.from({ length: 100 }, () => generateLicenseCode())
      const uniqueCodes = new Set(codes)

      // 由于随机性，100个授权码应该大部分都是唯一的
      expect(uniqueCodes.size).toBeGreaterThan(90)
    })

    it('应该处理单字符字符集', () => {
      const config: LicenseGeneratorConfig = {
        charset: 'A',
        partLength: 2,
        totalLength: 4,
        enableChecksum: true,
      }

      const code = generateLicenseCode(config)
      expect(code).toMatch(/^A{2}-A{2}-A$/) // 4位主体+1位校验位
      expect(code.replace(/-/g, '')).toHaveLength(5) // 总长度应为5（4+1校验位）
    })

    it('应该处理空分隔符', () => {
      const config: LicenseGeneratorConfig = {
        separator: '',
        partLength: 4,
        totalLength: 8,
        enableChecksum: true,
      }

      const code = generateLicenseCode(config)
      expect(code).toMatch(/^[A-Z0-9]{9}$/) // 8位主体+1位校验位，无分隔符
      expect(code.length).toBe(9)
    })

    it('应该支持禁用校验位', () => {
      const config: LicenseGeneratorConfig = {
        totalLength: 8,
        partLength: 4,
        enableChecksum: false,
      }

      const code = generateLicenseCode(config)
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/) // 仅8位，无校验位
      expect(code.split('-')).toHaveLength(2)
    })
  })

  describe('generateUniqueLicenseCode', () => {
    it('应该生成唯一的授权码', async () => {
      const existingCodes = new Set(['ABCD-EFGH-IJKL-MNOP-Q', 'WXYZ-1234-5678-9ABC-D'])
      const checker: LicenseCodeChecker = (code) => Promise.resolve(existingCodes.has(code))

      const code = await generateUniqueLicenseCode(checker)

      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]$/)
      expect(existingCodes.has(code)).toBe(false)
    })

    it('应该在达到最大尝试次数时抛出错误', async () => {
      // 模拟所有授权码都已存在的情况
      const checker: LicenseCodeChecker = () => Promise.resolve(true)
      const config: LicenseGeneratorConfig = { maxAttempts: 3 }

      await expect(generateUniqueLicenseCode(checker, config))
        .rejects
        .toThrow('无法生成唯一授权码，请稍后重试')
    })

    it('应该支持自定义配置', async () => {
      const checker: LicenseCodeChecker = () => Promise.resolve(false)
      const config: LicenseGeneratorConfig = {
        charset: 'ABC123',
        partLength: 2,
        totalLength: 4,
        separator: '_',
        enableChecksum: true,
      }

      const code = await generateUniqueLicenseCode(checker, config)

      expect(code).toMatch(/^[ABC123]{2}_[ABC123]{2}_[ABC123]$/)
    })

    it('应该在第一次尝试成功时立即返回', async () => {
      let attempts = 0

      const checker: LicenseCodeChecker = () => {
        attempts++

        return Promise.resolve(false) // 总是返回不存在
      }

      await generateUniqueLicenseCode(checker)

      expect(attempts).toBe(1)
    })
  })

  describe('generateLicenseCodes', () => {
    it('应该生成指定数量的授权码', () => {
      const codes = generateLicenseCodes(5)

      expect(codes).toHaveLength(5)
      codes.forEach((code) => {
        expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]$/)
      })
    })

    it('应该处理零数量', () => {
      const codes = generateLicenseCodes(0)
      expect(codes).toEqual([])
    })

    it('应该处理负数量', () => {
      const codes = generateLicenseCodes(-5)
      expect(codes).toEqual([])
    })

    it('应该支持自定义配置', () => {
      const config: LicenseGeneratorConfig = {
        partLength: 2,
        totalLength: 4,
        enableChecksum: false,
      }

      const codes = generateLicenseCodes(3, config)

      expect(codes).toHaveLength(3)
      codes.forEach((code) => {
        expect(code).toMatch(/^[A-Z0-9]{2}-[A-Z0-9]{2}$/)
      })
    })
  })

  describe('generateUniqueLicenseCodes', () => {
    it('应该生成指定数量的唯一授权码', async () => {
      const existingCodes = new Set(['ABCD-EFGH-IJKL-MNOP-Q'])
      const checker: LicenseCodeChecker = (code) => Promise.resolve(existingCodes.has(code))

      const codes = await generateUniqueLicenseCodes(3, checker)

      expect(codes).toHaveLength(3)
      expect(new Set(codes).size).toBe(3) // 确保批次内唯一
      codes.forEach((code) => {
        expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]$/)
        expect(existingCodes.has(code)).toBe(false)
      })
    })

    it('应该处理零数量', async () => {
      const checker: LicenseCodeChecker = () => Promise.resolve(false)
      const codes = await generateUniqueLicenseCodes(0, checker)

      expect(codes).toEqual([])
    })

    it('应该处理负数量', async () => {
      const checker: LicenseCodeChecker = () => Promise.resolve(false)
      const codes = await generateUniqueLicenseCodes(-3, checker)

      expect(codes).toEqual([])
    })

    it('应该在无法生成足够唯一授权码时抛出错误', async () => {
      const checker: LicenseCodeChecker = () => Promise.resolve(true) // 所有都已存在
      const config: LicenseGeneratorConfig = { maxAttempts: 2 }

      await expect(generateUniqueLicenseCodes(2, checker, config))
        .rejects
        .toThrow('无法生成第 1 个唯一授权码，请稍后重试')
    })

    it('应该避免批次内重复', async () => {
      const checker: LicenseCodeChecker = () => Promise.resolve(false)

      // 使用小字符集增加重复概率
      const config: LicenseGeneratorConfig = {
        charset: 'AB',
        partLength: 1,
        partCount: 1,
        maxAttempts: 100,
      }

      const codes = await generateUniqueLicenseCodes(2, checker, config)

      expect(codes).toHaveLength(2)
      expect(new Set(codes).size).toBe(2)
    })
  })

  describe('validateLicenseCodeFormat', () => {
    it('应该验证标准格式的授权码', () => {
      // 生成一些有效的授权码进行测试
      const validCode1 = 'ABCD-EFGH-IJKL-MNOP-M'
      const validCode2 = 'WXYZ-1234-5678-90AB-V'
      const validCode3 = 'CDEF-GHIJ-KLMN-OPQR-9'

      expect(validateLicenseCodeFormat(validCode1)).toBe(true)
      expect(validateLicenseCodeFormat(validCode2)).toBe(true)
      expect(validateLicenseCodeFormat(validCode3)).toBe(true)
    })

    it('应该拒绝无效格式的授权码', () => {
      expect(validateLicenseCodeFormat('ABCD-EFGH-IJKL-MNOP')).toBe(false) // 缺少校验位
      expect(validateLicenseCodeFormat('ABCD-EFGH-IJKL-MNOP-Q-R')).toBe(false) // 多余部分
      expect(validateLicenseCodeFormat('ABC-EFGH-IJKL-MNOP-Q')).toBe(false) // 部分长度不对
      expect(validateLicenseCodeFormat('ABCD_EFGH_IJKL_MNOP_Q')).toBe(false) // 分隔符不对
      expect(validateLicenseCodeFormat('abcd-efgh-ijkl-mnop-q')).toBe(false) // 小写字母
      expect(validateLicenseCodeFormat('ABCD-EF@H-IJKL-MNOP-Q')).toBe(false) // 特殊字符
    })

    it('应该处理边界情况', () => {
      expect(validateLicenseCodeFormat('')).toBe(false)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(validateLicenseCodeFormat(null as AnyType)).toBe(false)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(validateLicenseCodeFormat(undefined as AnyType)).toBe(false)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(validateLicenseCodeFormat(123 as AnyType)).toBe(false)
    })

    it('应该支持自定义配置验证', () => {
      const config: LicenseGeneratorConfig = {
        charset: 'ABCDEF123456',
        partLength: 3,
        totalLength: 6,
        separator: '_',
        enableChecksum: true,
      }

      expect(validateLicenseCodeFormat('ABC_DEF_E', config)).toBe(true) // 6位主体+1位校验位=7位总长度
      expect(validateLicenseCodeFormat('abc_def_1', config)).toBe(false) // 小写
      expect(validateLicenseCodeFormat('ABC-DEF-1', config)).toBe(false) // 分隔符不对
      expect(validateLicenseCodeFormat('AB_DEF_1', config)).toBe(false) // 长度不对
    })
  })

  describe('validateLicenseCodeChecksum', () => {
    it('应该验证正确的校验位', () => {
      // 生成一个授权码并验证其校验位
      const code = generateLicenseCode()
      expect(validateLicenseCodeChecksum(code)).toBe(true)
    })

    it('应该拒绝错误的校验位', () => {
      const config: LicenseGeneratorConfig = {
        enableChecksum: true,
      }

      // 手动构造一个错误校验位的授权码
      const invalidCode = 'ABCD-EFGH-IJKL-MNOP-Z' // Z 很可能不是正确的校验位
      expect(validateLicenseCodeChecksum(invalidCode, config)).toBe(false)
    })

    it('应该在禁用校验位时返回 true', () => {
      const config: LicenseGeneratorConfig = {
        enableChecksum: false,
      }

      expect(validateLicenseCodeChecksum('ABCD-EFGH-IJKL-MNOP', config)).toBe(true)
    })
  })

  describe('validateLicenseCode', () => {
    it('应该验证完整的授权码（格式+校验位）', () => {
      const code = generateLicenseCode()
      expect(validateLicenseCode(code)).toBe(true)
    })

    it('应该拒绝格式错误的授权码', () => {
      expect(validateLicenseCode('INVALID-FORMAT')).toBe(false)
    })

    it('应该拒绝校验位错误的授权码', () => {
      const invalidCode = 'ABCD-EFGH-IJKL-MNOP-Z'
      expect(validateLicenseCode(invalidCode)).toBe(false)
    })

    it('应该支持自定义配置', () => {
      const config: LicenseGeneratorConfig = {
        enableChecksum: false,
        totalLength: 8,
        partLength: 4,
      }

      const code = generateLicenseCode(config)
      expect(validateLicenseCode(code, config)).toBe(true)
    })
  })
})
