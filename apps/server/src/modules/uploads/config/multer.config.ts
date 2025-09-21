import type { MulterModuleOptions } from '@nestjs/platform-express'
import type { Request } from 'express'
import { memoryStorage } from 'multer'

import { getFileTypePattern } from '~/common/constants/file-types'

const MAX_SIZE_50MB = 50 * 1024 * 1024
const MAX_FILES = 20

/**
 * 修复文件名编码的辅助函数
 * 将 Latin-1 误编码的 UTF-8 字符修复为正确的中文字符
 */
function fixFilenameEncoding(filename: string): string {
  try {
    // 检测是否已经是正确的 UTF-8 编码（纯 ASCII 字符）
    if (/^[ -~]*$/.test(filename)) {
      return filename
    }

    // 尝试将 Latin-1 解码的字符重新编码为 UTF-8
    const latin1Buffer = Buffer.from(filename, 'latin1')
    const utf8String = latin1Buffer.toString('utf8')

    // 验证转换结果是否包含有效的中文字符
    if (/[\u4e00-\u9fff]/.test(utf8String)) {
      return utf8String
    }

    // 如果转换失败，返回原始字符串
    return filename
  }
  catch (error) {
    // 转换出错时返回原始字符串
    console.warn('文件名编码修复失败:', filename, error)

    return filename
  }
}

export const multerConfig: MulterModuleOptions = {
  storage: memoryStorage(),

  limits: {
    fileSize: MAX_SIZE_50MB,
    files: MAX_FILES,
  },

  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    // 修复文件名编码
    file.originalname = fixFilenameEncoding(file.originalname)

    // 基本文件类型验证（详细验证在 pipe 中进行）
    const allowedTypes = getFileTypePattern()
    const extName = allowedTypes.test(file.originalname.toLowerCase())
    const mimeType = /^(image|application|text|video|audio)\//.test(file.mimetype)

    if (mimeType && extName) {
      cb(null, true)
    }
    else {
      cb(new Error('不支持的文件类型'), false)
    }
  },
}
