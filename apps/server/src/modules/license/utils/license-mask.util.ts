/**
 * 授权码数据脱敏工具
 * 提供授权码敏感信息的脱敏处理功能
 */

import type { AnyType } from '~/types/common'

/**
 * 脱敏配置接口
 */
export interface MaskConfig {
  /** 脱敏字符，默认为 '*' */
  maskChar?: string
  /** 是否保留首尾字符，默认为 true */
  preserveEdges?: boolean
  /** 最小保留长度，小于此长度的字符串不进行脱敏，默认为 3 */
  minLength?: number
}

/**
 * 默认脱敏配置
 */
const DEFAULT_MASK_CONFIG: Required<MaskConfig> = {
  maskChar: '*',
  preserveEdges: true,
  minLength: 3,
}

/**
 * 对字符串进行脱敏处理
 *
 * @param str 原始字符串
 * @param maskChar 脱敏字符
 * @param preserveEdges 是否保留首尾字符
 * @returns 脱敏后的字符串
 */
function maskString(str: string, maskChar: string, preserveEdges: boolean): string {
  if (!str) {
    return str
  }

  if (str.length <= 2) {
    // 对于长度小于等于2的字符串，全部脱敏
    return maskChar.repeat(str.length)
  }

  if (!preserveEdges) {
    // 如果不保留首尾字符，全部脱敏
    return maskChar.repeat(str.length)
  }

  // 保留首尾字符，中间用脱敏字符替换
  const firstChar = str.charAt(0)
  const lastChar = str.charAt(str.length - 1)
  const middleLength = Math.max(0, str.length - 2)

  return firstChar + maskChar.repeat(middleLength) + lastChar
}

/**
 * 对授权码进行数据脱敏处理
 * 将授权码格式 abc-123-def 脱敏为 a*c-1*3-d*f
 *
 * @param code 原始授权码
 * @param config 脱敏配置
 * @returns 脱敏后的授权码
 *
 * @example
 * ```typescript
 * maskLicenseCode('abc-123-def') // 返回: 'a*c-1*3-d*f'
 * maskLicenseCode('short') // 返回: 's***t'
 * maskLicenseCode('ab') // 返回: 'ab' (长度小于最小值)
 * ```
 */
export function maskLicenseCode(code: string, config: MaskConfig = {}): string {
  if (!code) {
    return code
  }

  const mergedConfig = { ...DEFAULT_MASK_CONFIG, ...config }
  const { maskChar, preserveEdges, minLength } = mergedConfig

  // 如果字符串长度小于最小长度，不进行脱敏
  if (code.length < minLength) {
    return code
  }

  // 检测分隔符（支持 - 和 _ 等常见分隔符）
  const separators = ['-', '_']
  let separator = '-' // 默认分隔符
  let parts: string[] = []
  let isValidFormat = false

  // 尝试不同的分隔符
  for (const sep of separators) {
    const testParts = code.split(sep)

    // 检查是否为有效的分段格式：至少3段且每段都不为空
    if (testParts.length >= 3 && testParts.every((part) => part.length > 0)) {
      separator = sep
      parts = testParts
      isValidFormat = true
      break
    }
  }

  // 如果没有找到有效的分隔符格式，对整个字符串进行简单脱敏
  if (!isValidFormat) {
    return maskString(code, maskChar, preserveEdges)
  }

  // 对每个部分进行脱敏
  const maskedParts = parts.map((part) => maskString(part, maskChar, preserveEdges))

  return maskedParts.join(separator)
}

/**
 * 对授权码数组进行批量数据脱敏处理
 *
 * @param licenses 包含授权码的对象数组
 * @param codeField 授权码字段名，默认为 'code'
 * @param config 脱敏配置
 * @returns 脱敏后的对象数组
 *
 * @example
 * ```typescript
 * const licenses = [{ code: 'abc-123-def', email: 'test@example.com' }]
 * const masked = maskLicensesData(licenses)
 * // 返回: [{ code: 'a*c-1*3-d*f', email: 'test@example.com' }]
 * ```
 */
export function maskLicensesData<T extends Record<string, AnyType>>(
  licenses: T[],
  codeField: keyof T = 'code',
  config: MaskConfig = {},
): T[] {
  return licenses.map((license) => ({
    ...license,
    [codeField]: maskLicenseCode(license[codeField], config),
  }))
}

/**
 * 验证授权码格式是否为标准格式
 *
 * @param code 授权码
 * @returns 是否为标准格式 (支持多段格式，如 xxxx-xxxx-xxxx-xxxx-x)
 */
export function isStandardLicenseFormat(code: string): boolean {
  if (!code) {
    return false
  }

  // 检测分隔符（支持 - 和 _ 等常见分隔符）
  const separators = ['-', '_']

  for (const separator of separators) {
    const parts = code.split(separator)

    // 标准格式要求：
    // 1. 至少3段
    // 2. 每段都不为空
    // 3. 不能包含其他分隔符（避免混合分隔符）
    if (parts.length >= 3 && parts.every((part) => part.length > 0)) {
      // 检查是否包含其他分隔符
      const otherSeparators = separators.filter((sep) => sep !== separator)
      const hasOtherSeparators = otherSeparators.some((otherSep) => code.includes(otherSep))

      if (!hasOtherSeparators) {
        return true
      }
    }
  }

  return false
}

/**
 * 获取授权码的脱敏预览
 * 用于在UI中显示脱敏效果预览
 *
 * @param code 原始授权码
 * @param config 脱敏配置
 * @returns 包含原始码和脱敏码的对象
 */
export function getLicenseMaskPreview(code: string, config: MaskConfig = {}): {
  original: string
  masked: string
  isStandardFormat: boolean
} {
  return {
    original: code,
    masked: maskLicenseCode(code, config),
    isStandardFormat: isStandardLicenseFormat(code),
  }
}
