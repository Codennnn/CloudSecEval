/**
 * 文件大小格式化选项
 */
export interface FormatFileSizeOptions {
  /** 小数位数，默认为 1 */
  decimalPlaces?: number
  /** 是否移除尾随零，默认为 true */
  removeTrailingZeros?: boolean
  /** 单位格式类型：'short' 使用短格式 (B, KB, MB, GB)，'long' 使用长格式 (Bytes, KB, MB, GB)，或自定义单位数组 */
  format?: 'short' | 'long' | string[]
}

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @param options 格式化选项
 * @returns 格式化后的文件大小字符串
 *
 * @example
 * // 使用默认短格式
 * formatFileSize(1024) // "1 KB"
 *
 * @example
 * // 使用长格式
 * formatFileSize(1024, { format: 'long', decimalPlaces: 2, removeTrailingZeros: false }) // "1.00 KB"
 *
 * @example
 * // 自定义单位
 * formatFileSize(1024, { format: ['字节', '千字节', '兆字节', '吉字节'] }) // "1 千字节"
 */
export function formatFileSize(
  bytes: number,
  options: FormatFileSizeOptions = {},
): string {
  const {
    decimalPlaces = 1,
    removeTrailingZeros = true,
    format = 'short',
  } = options

  // 根据 format 参数确定单位数组
  let units: string[]

  if (Array.isArray(format)) {
    units = format
  }
  else if (format === 'long') {
    units = ['Bytes', 'KB', 'MB', 'GB']
  }
  else {
    // 默认短格式
    units = ['B', 'KB', 'MB', 'GB']
  }

  if (bytes === 0) {
    return `0 ${units[0]}`
  }

  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)

  let formattedValue = value.toFixed(decimalPlaces)

  if (removeTrailingZeros) {
    formattedValue = parseFloat(formattedValue).toString()
  }

  return `${formattedValue} ${units[i]}`
}
