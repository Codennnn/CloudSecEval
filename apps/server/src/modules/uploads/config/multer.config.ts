import type { MulterModuleOptions } from '@nestjs/platform-express'
import type { Request } from 'express'
import { memoryStorage } from 'multer'

import { getFileTypePattern } from '~/common/constants/file-types'

const MAX_SIZE_50MB = 50 * 1024 * 1024
const MAX_FILES = 20

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
