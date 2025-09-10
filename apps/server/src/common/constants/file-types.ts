interface FileTypeConfig {
  /** MIME 类型 */
  mimeType: string
  /** 文件扩展名 */
  extensions: string[]
  /** 正则表达式模式 */
  pattern: string
}

/**
 * 支持的文件类型配置
 */
const SUPPORTED_FILE_TYPES: Record<string, FileTypeConfig> = {
  // 图片类型
  JPEG: {
    mimeType: 'image/jpeg',
    extensions: ['jpg', 'jpeg'],
    pattern: 'jpeg|jpg',
  },
  PNG: {
    mimeType: 'image/png',
    extensions: ['png'],
    pattern: 'png',
  },
  GIF: {
    mimeType: 'image/gif',
    extensions: ['gif'],
    pattern: 'gif',
  },
  WEBP: {
    mimeType: 'image/webp',
    extensions: ['webp'],
    pattern: 'webp',
  },

  // 文档类型
  PDF: {
    mimeType: 'application/pdf',
    extensions: ['pdf'],
    pattern: 'pdf',
  },
  DOC: {
    mimeType: 'application/msword',
    extensions: ['doc'],
    pattern: 'doc',
  },
  DOCX: {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['docx'],
    pattern: 'docx',
  },
  TXT: {
    mimeType: 'text/plain',
    extensions: ['txt'],
    pattern: 'txt',
  },

  // 表格类型
  XLSX: {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['xlsx'],
    pattern: 'xlsx',
  },
  XLS: {
    mimeType: 'application/vnd.ms-excel',
    extensions: ['xls'],
    pattern: 'xls',
  },

  // 演示文稿类型
  PPTX: {
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['pptx'],
    pattern: 'pptx',
  },
  PPT: {
    mimeType: 'application/vnd.ms-powerpoint',
    extensions: ['ppt'],
    pattern: 'ppt',
  },

  // 压缩文件类型
  ZIP: {
    mimeType: 'application/zip',
    extensions: ['zip'],
    pattern: 'zip',
  },
  RAR: {
    mimeType: 'application/x-rar-compressed',
    extensions: ['rar'],
    pattern: 'rar',
  },
  SEVEN_ZIP: {
    mimeType: 'application/x-7z-compressed',
    extensions: ['7z'],
    pattern: '7z',
  },

  // 视频类型
  MP4: {
    mimeType: 'video/mp4',
    extensions: ['mp4'],
    pattern: 'mp4',
  },
  AVI: {
    mimeType: 'video/avi',
    extensions: ['avi'],
    pattern: 'avi',
  },
  MOV: {
    mimeType: 'video/quicktime',
    extensions: ['mov'],
    pattern: 'mov',
  },

  // 音频类型
  MP3: {
    mimeType: 'audio/mpeg',
    extensions: ['mp3'],
    pattern: 'mp3',
  },
  WAV: {
    mimeType: 'audio/wav',
    extensions: ['wav'],
    pattern: 'wav',
  },
}

/**
 * 获取所有支持的 MIME 类型
 */
export function getAllowedMimeTypes(): string[] {
  return Object.values(SUPPORTED_FILE_TYPES).map((config) => config.mimeType)
}

/**
 * 获取所有支持的文件扩展名
 */
export function getAllowedExtensions(): string[] {
  return Object.values(SUPPORTED_FILE_TYPES).flatMap((config) => config.extensions)
}

/**
 * 获取文件类型正则表达式模式
 */
export function getFileTypePattern(): RegExp {
  const patterns = Object.values(SUPPORTED_FILE_TYPES).map((config) => config.pattern)

  return new RegExp(patterns.join('|'), 'i')
}

/**
 * 根据 MIME 类型获取对应的文件扩展名
 */
export function getExtensionsByMimeType(mimeType: string): string[] {
  const config = Object.values(SUPPORTED_FILE_TYPES).find(
    (config) => config.mimeType === mimeType,
  )

  return config?.extensions ?? []
}

/**
 * 根据文件扩展名获取对应的 MIME 类型
 */
export function getMimeTypeByExtension(extension: string): string | null {
  const config = Object.values(SUPPORTED_FILE_TYPES).find(
    (config) => config.extensions.includes(extension.toLowerCase()),
  )

  return config?.mimeType ?? null
}
