import iconv from 'iconv-lite'

// 匹配纯 ASCII 字符的正则表达式（0x00-0x7F）
// eslint-disable-next-line no-control-regex
const ASCII_PATTERN = /^[\x00-\x7F]+$/

// 匹配控制字符的正则表达式（0x00-0x1F 和 0x7F）
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/

/**
 * 候选编码列表
 * 按优先级排序，用于尝试解码文件名
 * - utf8: UTF-8 编码（最常用）
 * - gbk: 简体中文编码
 * - big5: 繁体中文编码
 * - latin1: 西欧字符编码
 */
const CANDIDATE_ENCODINGS: readonly string[] = [
  'utf8',
  'gbk',
  'big5',
  'latin1',
]

/**
 * 检查解码后的字符串是否可接受
 * @param original - 原始字符串
 * @param decoded - 解码后的字符串
 * @returns 如果解码结果可接受则返回 true
 */
function isDecodedStringAcceptable(original: string, decoded: string): boolean {
  // 解码结果为空或与原始字符串相同，则不可接受
  if (!decoded || decoded === original) {
    return false
  }

  // 包含控制字符或替换字符（�）则不可接受
  if (CONTROL_CHAR_PATTERN.test(decoded) || decoded.includes('�')) {
    return false
  }

  // 解码结果长度必须大于 0
  return decoded.length > 0
}

/**
 * 将字符串转换为二进制缓冲区
 * 用于文件名编码检测，将每个字符的低 8 位提取出来形成字节数组
 * @param value - 输入字符串
 * @returns 二进制缓冲区
 */
function toBinaryBuffer(value: string): Buffer {
  // 将字符串转换为二进制缓冲区，用于文件名编码检测

  // eslint-disable-next-line
  const bytes = Uint8Array.from([...value].map((char) => char.charCodeAt(0) & 0xff))

  return Buffer.from(bytes)
}

/**
 * 标准化上传文件名
 *
 * 该函数用于处理上传文件名的编码问题，特别是中文文件名的乱码问题。
 * 当文件名包含非 ASCII 字符时，会尝试使用不同的编码进行解码，
 * 找到最合适的编码方式来正确显示文件名。
 *
 * 处理流程：
 * 1. 如果文件名为空或只包含 ASCII 字符，直接返回
 * 2. 将文件名转换为二进制缓冲区
 * 3. 依次尝试候选编码列表中的编码进行解码
 * 4. 检查解码结果是否可接受（无控制字符、无替换字符等）
 * 5. 返回第一个可接受的解码结果，如果都不可接受则返回原始文件名
 *
 * @param raw - 原始文件名字符串
 * @returns 标准化后的文件名
 */
export function normalizeUploadFilename(raw: string): string {
  // 如果文件名为空或只包含 ASCII 字符，无需处理直接返回
  if (!raw || ASCII_PATTERN.test(raw)) {
    return raw
  }

  // 将文件名转换为二进制缓冲区，用于编码检测
  const binaryBuffer = toBinaryBuffer(raw)

  // 依次尝试候选编码进行解码
  for (const encoding of CANDIDATE_ENCODINGS) {
    // 检查编码是否存在
    if (!iconv.encodingExists(encoding)) {
      continue
    }

    // 使用当前编码解码文件名
    const decoded = iconv.decode(binaryBuffer, encoding)

    // 检查解码结果是否可接受
    if (isDecodedStringAcceptable(raw, decoded)) {
      return decoded
    }
  }

  // 如果所有编码都无法产生可接受的结果，返回原始文件名
  return raw
}
