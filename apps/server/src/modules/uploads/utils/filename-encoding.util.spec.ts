import * as iconv from 'iconv-lite'

import { normalizeUploadFilename } from './filename-encoding.util'

function toBinaryString(buffer: Buffer): string {
  return Array.from(buffer).map((byte) => String.fromCharCode(byte)).join('')
}

describe('normalizeUploadFilename', () => {
  it('保持 ASCII 文件名不变', () => {
    const original = 'report-2025.txt'

    expect(normalizeUploadFilename(original)).toBe(original)
  })

  it('纠正 UTF-8 被按 Latin-1 解析的中文文件名', () => {
    const expected = '中文资料.pdf'
    const raw = toBinaryString(Buffer.from(expected, 'utf8'))

    expect(raw).not.toBe(expected)
    expect(normalizeUploadFilename(raw)).toBe(expected)
  })

  it('纠正 GBK 编码的中文文件名', () => {
    const expected = '文档说明.docx'
    const raw = toBinaryString(iconv.encode(expected, 'gbk'))

    expect(raw).not.toBe(expected)
    expect(normalizeUploadFilename(raw)).toBe(expected)
  })

  it('无法确定编码时回退原始文件名', () => {
    const raw = toBinaryString(Buffer.from([0xff, 0xfe, 0xfd]))

    expect(normalizeUploadFilename(raw)).toBe(raw)
  })
})
