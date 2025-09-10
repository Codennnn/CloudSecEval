import { randomBytes } from 'crypto'

/**
 * 创建自定义字母表的随机字符串生成器
 * @param alphabet 字符集
 * @param size 长度
 * @returns 随机字符串生成函数
 */
function createCustomAlphabet(alphabet: string, size: number): () => string {
  return () => {
    const bytes = randomBytes(size)
    let result = ''

    for (let i = 0; i < size; i++) {
      result += alphabet[bytes[i] % alphabet.length]
    }

    return result
  }
}

/**
 * 授权码生成配置接口
 */
export interface LicenseGeneratorConfig {
  /** 字符集 */
  charset?: string
  /** 每个部分的长度 */
  partLength?: number
  /** 部分数量 */
  partCount?: number
  /** 分隔符 */
  separator?: string
  /** 最大重试次数 */
  maxAttempts?: number
  /** 授权码总长度（不包含分隔符和校验位） */
  totalLength?: number
  /** 是否启用校验位 */
  enableChecksum?: boolean
}

/**
 * 默认授权码生成配置
 */
export const DEFAULT_LICENSE_GENERATOR_CONFIG: Required<LicenseGeneratorConfig> = {
  charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  partLength: 4,
  partCount: 4,
  separator: '-',
  maxAttempts: 10,
  totalLength: 16,
  enableChecksum: true,
}

/**
 * 授权码唯一性检查函数类型
 */
export type LicenseCodeChecker = (code: string) => Promise<boolean>

/**
 * 计算字符的数值（用于校验位计算）
 * @param char 字符
 * @returns 数值
 */
function getCharValue(char: string): number {
  if (char >= '0' && char <= '9') {
    return parseInt(char, 10)
  }

  if (char >= 'A' && char <= 'Z') {
    return char.charCodeAt(0) - 'A'.charCodeAt(0) + 10
  }

  return 0
}

/**
 * 使用简化的 Luhn 算法计算校验位
 * @param code 不含校验位的授权码
 * @param charset 字符集
 * @returns 校验位字符
 */
function calculateChecksum(code: string, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
  const cleanCode = code.replace(/[-_]/g, '')
  let sum = 0
  let isEven = false

  // 从右到左遍历
  for (let i = cleanCode.length - 1; i >= 0; i--) {
    let value = getCharValue(cleanCode[i])

    if (isEven) {
      value *= 2

      if (value > charset.length - 1) {
        value = Math.floor(value / charset.length) + value % charset.length
      }
    }

    sum += value
    isEven = !isEven
  }

  const checksum = (charset.length - sum % charset.length) % charset.length

  return charset[checksum]
}

/**
 * 格式化授权码（按指定长度分组）
 * @param code 原始授权码
 * @param partLength 每组长度
 * @param separator 分隔符
 * @returns 格式化后的授权码
 */
function formatLicenseCode(code: string, partLength: number, separator: string): string {
  const parts: string[] = []

  for (let i = 0; i < code.length; i += partLength) {
    parts.push(code.slice(i, i + partLength))
  }

  return parts.join(separator)
}

/**
 * 生成单个授权码（格式: XXXX-XXXX-XXXX-XXXX）
 * @param config 生成配置
 * @returns 生成的授权码
 */
export function generateLicenseCode(
  config: LicenseGeneratorConfig = {},
): string {
  const {
    charset,
    partLength,
    separator,
    totalLength,
    enableChecksum,
  } = { ...DEFAULT_LICENSE_GENERATOR_CONFIG, ...config }

  // 计算实际需要生成的字符长度（不包含校验位）
  const actualLength = enableChecksum ? totalLength : totalLength

  // 使用自定义字母表生成指定长度的随机字符串
  const generateRandom = createCustomAlphabet(charset, actualLength)
  let code = generateRandom()

  // 如果启用校验位，添加校验位
  if (enableChecksum) {
    const checksum = calculateChecksum(code, charset)
    code += checksum
  }

  // 格式化输出
  return formatLicenseCode(code, partLength, separator)
}

/**
 * 生成唯一授权码
 * @param checker 唯一性检查函数，返回 true 表示授权码已存在
 * @param config 生成配置
 * @returns 唯一的授权码
 * @throws Error 当无法生成唯一授权码时抛出错误
 */
export async function generateUniqueLicenseCode(
  checker: LicenseCodeChecker,
  config: LicenseGeneratorConfig = {},
): Promise<string> {
  const { maxAttempts } = { ...DEFAULT_LICENSE_GENERATOR_CONFIG, ...config }
  let attempts = 0

  while (attempts < maxAttempts) {
    const code = generateLicenseCode(config)
    attempts++

    // checker 返回 true 表示授权码已存在，false 表示不存在（可用）
    const exists = await checker(code)

    if (!exists) {
      return code
    }
  }

  throw new Error('无法生成唯一授权码，请稍后重试')
}

/**
 * 批量生成授权码
 * @param count 生成数量
 * @param config 生成配置
 * @returns 授权码数组
 */
export function generateLicenseCodes(
  count: number,
  config: LicenseGeneratorConfig = {},
): string[] {
  if (count <= 0) {
    return []
  }

  return Array.from({ length: count }, () => generateLicenseCode(config))
}

/**
 * 批量生成唯一授权码
 * @param count 生成数量
 * @param checker 唯一性检查函数
 * @param config 生成配置
 * @returns 唯一授权码数组
 * @throws Error 当无法生成足够数量的唯一授权码时抛出错误
 */
export async function generateUniqueLicenseCodes(
  count: number,
  checker: LicenseCodeChecker,
  config: LicenseGeneratorConfig = {},
): Promise<string[]> {
  if (count <= 0) {
    return []
  }

  const codes: string[] = []
  const generatedCodes = new Set<string>()

  for (let i = 0; i < count; i++) {
    let attempts = 0
    const { maxAttempts } = { ...DEFAULT_LICENSE_GENERATOR_CONFIG, ...config }

    while (attempts < maxAttempts) {
      const code = generateLicenseCode(config)
      attempts++

      // 检查是否在当前批次中重复
      if (generatedCodes.has(code)) {
        continue
      }

      // 检查数据库中是否存在
      const exists = await checker(code)

      if (!exists) {
        codes.push(code)
        generatedCodes.add(code)
        break
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error(`无法生成第 ${i + 1} 个唯一授权码，请稍后重试`)
    }
  }

  return codes
}

/**
 * 验证授权码的校验位是否正确
 * @param code 完整的授权码（包含校验位）
 * @param config 验证配置
 * @returns 校验位是否正确
 */
export function validateLicenseCodeChecksum(
  code: string,
  config: LicenseGeneratorConfig = {},
): boolean {
  if (!code || typeof code !== 'string') {
    return false
  }

  const { enableChecksum, separator, charset } = { ...DEFAULT_LICENSE_GENERATOR_CONFIG, ...config }

  if (!enableChecksum) {
    return true // 如果未启用校验位，则认为有效
  }

  const cleanCode = code.replace(new RegExp(separator, 'g'), '')

  if (cleanCode.length < 2) {
    return false
  }

  // 分离主体部分和校验位
  const mainPart = cleanCode.slice(0, -1)
  const providedChecksum = cleanCode.slice(-1)

  // 计算期望的校验位
  const expectedChecksum = calculateChecksum(mainPart, charset)

  return providedChecksum === expectedChecksum
}

/**
 * 验证授权码格式是否符合标准
 * @param code 授权码
 * @param config 验证配置
 * @returns 是否符合标准格式
 */
export function validateLicenseCodeFormat(
  code: string,
  config: LicenseGeneratorConfig = {},
): boolean {
  if (!code || typeof code !== 'string') {
    return false
  }

  const {
    charset,
    partLength,
    separator,
    totalLength,
    enableChecksum,
  } = { ...DEFAULT_LICENSE_GENERATOR_CONFIG, ...config }

  const parts = code.split(separator)

  // 计算期望的总长度（包含校验位）
  const expectedTotalLength = enableChecksum ? totalLength + 1 : totalLength

  // 计算期望的分组数量
  const expectedPartCount = Math.ceil(expectedTotalLength / partLength)

  // 检查部分数量
  if (parts.length !== expectedPartCount) {
    return false
  }

  // 检查每个部分的长度和字符（最后一个部分可能长度不足）
  const isValidFormat = parts.every((part, index) => {
    const isLastPart = index === parts.length - 1
    const expectedLength = isLastPart
      ? expectedTotalLength - index * partLength
      : partLength

    if (part.length !== expectedLength) {
      return false
    }

    return part.split('').every((char) => charset.includes(char))
  })

  if (!isValidFormat) {
    return false
  }

  // 如果启用校验位，验证校验位
  if (enableChecksum) {
    return validateLicenseCodeChecksum(code, config)
  }

  return true
}

/**
 * 完整验证授权码（格式 + 校验位）
 * @param code 授权码
 * @param config 验证配置
 * @returns 是否为有效的授权码
 */
export function validateLicenseCode(
  code: string,
  config: LicenseGeneratorConfig = {},
): boolean {
  // 首先验证格式
  if (!validateLicenseCodeFormat(code, config)) {
    return false
  }

  // 然后验证校验位
  return validateLicenseCodeChecksum(code, config)
}
