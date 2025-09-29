/**
 * 将数据转换为 Blob 对象
 *
 * @param data - 要转换的数据，可以是字符串或对象
 * @param options - 转换选项
 * @returns Blob 对象
 *
 * @example
 * // 转换 JSON 对象为 Blob
 * const jsonBlob = createBlob({ name: '测试', value: 123 }, {
 *   type: 'application/json',
 *   stringify: true,
 *   formatting: 2
 * })
 *
 * // 转换 CSV 数据为 Blob
 * const csvBlob = createBlob('id,name\n1,测试', { type: 'text/csv' })
 */
export function createBlob(
  data: unknown,
  options: {
    /** MIME 类型，默认为 'application/octet-stream' */
    type?: string
    /** 是否将数据转换为 JSON 字符串，对非字符串数据有效 */
    stringify?: boolean
    /** JSON 格式化缩进，仅当 stringify 为 true 时有效 */
    formatting?: number
    /** 编码方式，默认为 utf-8 */
    charset?: string
  } = {},
): Blob {
  const {
    type = 'application/octet-stream',
    stringify = false,
    formatting = 0,
    charset,
  } = options

  // 处理 MIME 类型，添加编码方式（如果提供）
  const mimeType = charset ? `${type};charset=${charset}` : type

  // 处理数据内容
  let content: string | Blob

  if (data instanceof Blob) {
    return data
  }
  else if (typeof data === 'string') {
    content = data
  }
  else if (stringify) {
    content = JSON.stringify(data, null, formatting)
  }
  else {
    // 如果不是字符串且不需要转换为 JSON，则尝试转为字符串
    content = String(data)
  }

  return new Blob([content], { type: mimeType })
}

/**
 * 触发文件下载
 *
 * @param blob - 要下载的 Blob 对象或数据
 * @param fileName - 下载文件名
 * @param options - 下载选项
 *
 * @example
 * // 下载 JSON 数据
 * downloadBlob({ name: '测试', value: 123 }, '测试数据.json', {
 *   type: 'application/json',
 *   stringify: true,
 *   formatting: 2
 * })
 *
 * // 下载 CSV 数据
 * downloadBlob('id,name\n1,测试', 'data.csv', { type: 'text/csv' })
 */
export function downloadBlob(
  blob: unknown,
  fileName: string,
  options: {
    /** MIME 类型，当 blob 不是 Blob 对象时使用 */
    type?: string
    /** 是否将数据转换为 JSON 字符串，对非 Blob、非字符串数据有效 */
    stringify?: boolean
    /** JSON 格式化缩进，仅当 stringify 为 true 时有效 */
    formatting?: number
    /** 编码方式，默认为 utf-8 */
    charset?: string
  } = {},
): void {
  // 如果不是 Blob 对象，转换为 Blob
  const blobData = blob instanceof Blob
    ? blob
    : createBlob(blob, options)

  const url = URL.createObjectURL(blobData)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)

  link.click()

  URL.revokeObjectURL(url)
  link.remove()
}

/**
 * 清理文件名中的特殊字符
 *
 * @param filename - 原始文件名
 * @param maxLength - 最大长度，默认为 50
 * @returns 清理后的文件名
 */
export function sanitizeFileName(filename: string, maxLength = 50): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '-') // 替换不允许的字符
    .replace(/\s+/g, '-') // 替换空格为连字符
    .substring(0, maxLength) // 限制长度
}

/**
 * 格式化文件大小
 *
 * @param bytes - 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B'
  }

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
