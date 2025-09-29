import * as iconv from 'iconv-lite'

// eslint-disable-next-line no-control-regex
const ASCII_PATTERN = /^[\x00-\x7F]+$/
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/

const CANDIDATE_ENCODINGS: readonly string[] = [
  'utf8',
  'gbk',
  'big5',
  'latin1',
]

function isDecodedStringAcceptable(original: string, decoded: string): boolean {
  if (!decoded || decoded === original) {
    return false
  }

  if (CONTROL_CHAR_PATTERN.test(decoded) || decoded.includes('�')) {
    return false
  }

  return decoded.length > 0
}

function toBinaryBuffer(value: string): Buffer {
  // 将字符串转换为二进制缓冲区，用于文件名编码检测

  // eslint-disable-next-line
  const bytes = Uint8Array.from([...value].map((char) => char.charCodeAt(0) & 0xff))

  return Buffer.from(bytes)
}

export function normalizeUploadFilename(raw: string): string {
  if (!raw || ASCII_PATTERN.test(raw)) {
    return raw
  }

  const binaryBuffer = toBinaryBuffer(raw)

  for (const encoding of CANDIDATE_ENCODINGS) {
    if (!iconv.encodingExists(encoding)) {
      continue
    }

    const decoded = iconv.decode(binaryBuffer, encoding)

    if (isDecodedStringAcceptable(raw, decoded)) {
      return decoded
    }
  }

  return raw
}
