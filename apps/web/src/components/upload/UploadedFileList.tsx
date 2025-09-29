import { formatFileSize } from '@mono/utils'
import { ArchiveIcon, CodeIcon, DatabaseIcon, DownloadIcon, FileIcon, FileSpreadsheetIcon, FileTextIcon, ImageIcon, MusicIcon, PresentationIcon, VideoIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { downloadBlob } from '~/utils/file'

import { uploadsControllerDownloadFile } from '~api/sdk.gen'
import type { FileUploadResponseDataDto } from '~api/types.gen'

export type UploadedFileItem = FileUploadResponseDataDto

interface UploadedFileListProps {
  /** 已上传的文件 */
  files?: UploadedFileItem[]
  /** 是否只读，控制是否展示删除按钮 */
  readonly?: boolean
  /** 是否显示下载按钮 */
  showDownload?: boolean
  /** 删除回调，传入文件对象 */
  onRemove?: (file: UploadedFileItem) => void | Promise<void>
  /** 自定义下载回调 */
  onDownload?: (file: UploadedFileItem) => void | Promise<void>
}

// 获取文件类型图标
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''

  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif', 'avif', 'jfif'].includes(ext)) {
    return ImageIcon
  }

  // 视频文件
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'ogv', 'asf', 'rm', 'rmvb', 'f4v', 'ts', 'mts'].includes(ext)) {
    return VideoIcon
  }

  // 音频文件
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'aiff', 'au', 'ra', 'amr', 'ac3'].includes(ext)) {
    return MusicIcon
  }

  // 压缩文件
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'lzma', 'cab', 'iso', 'dmg', 'deb', 'rpm'].includes(ext)) {
    return ArchiveIcon
  }

  // 数据库文件
  if (['sql', 'db', 'sqlite', 'sqlite3', 'mdb', 'accdb'].includes(ext)) {
    return DatabaseIcon
  }

  // 代码文件 - 使用专用代码图标
  if ([
    // Web 技术
    'js', 'ts', 'jsx', 'tsx', 'vue', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'styl',
    // 服务端语言
    'php', 'py', 'java', 'c', 'cpp', 'cc', 'h', 'hpp', 'cs', 'go', 'rs', 'rb', 'pl', 'sh', 'bat',
    // 其他编程语言
    'r', 'matlab', 'm', 'swift', 'kt', 'scala', 'dart', 'lua', 'vb', 'asm',
  ].includes(ext)) {
    return CodeIcon
  }

  // 电子表格文件
  if (['xls', 'xlsx', 'xlsm', 'xlsb', 'ods', 'csv', 'tsv'].includes(ext)) {
    return FileSpreadsheetIcon
  }

  // 演示文稿文件
  if (['ppt', 'pptx', 'pptm', 'pps', 'ppsx', 'odp', 'key'].includes(ext)) {
    return PresentationIcon
  }

  // 文本和文档文件
  if ([
    // 纯文本和配置文件
    'txt', 'md', 'log', 'json', 'xml', 'yaml', 'yml', 'ini', 'cfg', 'conf', 'toml',
    // 标记语言和文档
    'rtf', 'tex', 'latex', 'doc', 'docx', 'odt', 'pdf', 'epub', 'mobi',
    // 数据文件
    'jsonl', 'ndjson', 'properties', 'env',
  ].includes(ext)) {
    return FileTextIcon
  }

  return FileIcon
}

async function downloadFileFromAPI(fileId: string, fileName: string): Promise<void> {
  try {
    // 使用生成的SDK函数下载文件
    const { data, error } = await uploadsControllerDownloadFile({
      path: { id: fileId },
      parseAs: 'blob', // 指定解析为blob格式
    })

    // 检查是否有错误
    if (error) {
      throw new Error('文件下载失败')
    }

    const blob = data as Blob
    downloadBlob(blob, fileName)
    toast.success('文件下载成功')
  }
  catch (error: unknown) {
    console.error('文件下载失败:', error)
    const errorMessage = error instanceof Error ? error.message : '文件下载失败，请重试'
    toast.error(errorMessage)
  }
}

export function UploadedFileList(props: UploadedFileListProps) {
  const { files, readonly, showDownload = true, onRemove, onDownload } = props

  const handleDownload = (file: UploadedFileItem) => {
    void onDownload?.(file)
    void downloadFileFromAPI(file.id, file.originalName)
  }

  if (!Array.isArray(files) || files.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20">
        <p className="text-sm text-muted-foreground">暂无附件</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => {
        const FileIconComponent = getFileIcon(file.originalName)

        return (
          <div
            key={file.id}
            className="group/file-item relative overflow-hidden rounded-lg border bg-card shadow-xs hover:shadow-sm transition-all"
          >
            {/* 操作按钮组 */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover/file-item:opacity-100 transition-opacity duration-200">
              {/* 下载按钮 */}
              {showDownload && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="iconSm"
                      type="button"
                      variant="outline"
                      onClick={() => { handleDownload(file) }}
                    >
                      <DownloadIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">下载文件</TooltipContent>
                </Tooltip>
              )}

              {/* 删除按钮 */}
              {!readonly && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="hover:bg-destructive/15 hover:text-destructive"
                      size="iconSm"
                      type="button"
                      variant="outline"
                      onClick={() => { void onRemove?.(file) }}
                    >
                      <XIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">删除文件</TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* 文件内容 */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* 文件图标 */}
                <div className="flex-shrink-0 size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileIconComponent className="size-5 text-primary" />
                </div>

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-1">
                    <div
                      className="font-medium text-sm leading-tight truncate text-foreground"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size, { format: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
