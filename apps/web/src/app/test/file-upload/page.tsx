'use client'

import { useCallback, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { AlertCircleIcon, CheckCircleIcon, FileIcon, TrashIcon, XCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'
import { FileUploader } from '~/components/upload/FileUploader'
import { useBatchFileUpload } from '~/hooks/useBatchFileUpload'
import { formatFileSize } from '~/utils/file'

import type { FileUploadResponseDataDto } from '~api/types.gen'

interface UploadLog {
  id: string
  timestamp: Date
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  details?: string
}

interface TestConfig {
  maxFiles: number
  concurrency: number
  accept: string
  simulateError: boolean
  simulateDelay: boolean
  readonlyMode: boolean
}

export default function FileUploadTestPage() {
  const [files, setFiles] = useState<FileUploadResponseDataDto[]>([])
  const [logs, setLogs] = useState<UploadLog[]>([])
  const [testConfig, setTestConfig] = useState<TestConfig>({
    maxFiles: 10,
    concurrency: 3,
    accept: '*',
    simulateError: false,
    simulateDelay: false,
    readonlyMode: false,
  })

  const { uploadFiles, isUploading, progress } = useBatchFileUpload()

  const addLog = useCallback((type: UploadLog['type'], message: string, details?: string) => {
    const newLog: UploadLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details,
    }
    setLogs((prev) => [newLog, ...prev.slice(0, 99)])
  }, [])

  const handleFilesSelected = useEvent(async (selectedFiles: File[]) => {
    if (testConfig.simulateError && Math.random() > 0.7) {
      addLog('error', '模拟上传失败', '这是模拟的网络错误')
      toast.error('模拟上传失败')

      return
    }

    addLog('info', `开始上传 ${selectedFiles.length} 个文件`)

    if (testConfig.simulateDelay) {
      addLog('info', '模拟网络延迟...')
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    try {
      const uploadedFiles = await uploadFiles(selectedFiles)
      setFiles((prev) => [...prev, ...uploadedFiles])
      addLog('success', `成功上传 ${uploadedFiles.length} 个文件`)
      toast.success(`成功上传 ${uploadedFiles.length} 个文件`)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      addLog('error', '文件上传失败', errorMessage)
      toast.error('文件上传失败')
    }
  })

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleFileRemove = useEvent(async (fileToRemove: FileUploadResponseDataDto) => {
    try {
      setFiles((prev) => prev.filter((f) => f.id !== fileToRemove.id))
      addLog('info', `已删除文件: ${fileToRemove.originalName}`)
      toast.success('文件删除成功')
    }
    catch (error) {
      addLog('error', '文件删除失败', error instanceof Error ? error.message : '未知错误')
      toast.error('文件删除失败')
    }
  })

  const handleClearAll = useEvent(() => {
    setFiles([])
    setLogs([])
    addLog('info', '已清空所有文件和日志')
  })

  const handleConfigChange = useEvent((key: keyof TestConfig, value: unknown) => {
    setTestConfig((prev) => ({ ...prev, [key]: value }))
    addLog('info', `配置更新: ${key} = ${String(value)}`)
  })

  const getLogIcon = (type: UploadLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />

      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />

      case 'warning':
        return <AlertCircleIcon className="h-4 w-4 text-yellow-500" />

      default:
        return <FileIcon className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">文件上传功能测试</h1>
        <p className="text-muted-foreground">
          这个页面用于测试 FileUploader 组件和文件上传相关的 Hook 功能，包括批量上传、进度追踪、错误处理等。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 控制面板 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>测试配置</CardTitle>
              <CardDescription>配置文件上传参数和测试选项</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="maxFiles">最大文件数量</Label>
                <Input
                  id="maxFiles"
                  max={50}
                  min={1}
                  type="number"
                  value={testConfig.maxFiles}
                  onChange={(e) => { handleConfigChange('maxFiles', parseInt(e.target.value)) }}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="accept">接受的文件类型</Label>
                <Select
                  value={testConfig.accept}
                  onValueChange={(value) => { handleConfigChange('accept', value) }}
                >
                  <SelectTrigger id="accept">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">所有文件</SelectItem>
                    <SelectItem value="image/*">图片文件</SelectItem>
                    <SelectItem value=".pdf,.doc,.docx">文档文件</SelectItem>
                    <SelectItem value=".js,.ts,.json">代码文件</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="concurrency">并发上传数</Label>
                <Input
                  id="concurrency"
                  max={10}
                  min={1}
                  type="number"
                  value={testConfig.concurrency}
                  onChange={(e) => { handleConfigChange('concurrency', parseInt(e.target.value)) }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="readonlyMode">只读模式</Label>
                <Switch
                  checked={testConfig.readonlyMode}
                  id="readonlyMode"
                  onCheckedChange={(checked) => { handleConfigChange('readonlyMode', checked) }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="simulateError">模拟上传错误</Label>
                <Switch
                  checked={testConfig.simulateError}
                  id="simulateError"
                  onCheckedChange={(checked) => { handleConfigChange('simulateError', checked) }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="simulateDelay">模拟网络延迟</Label>
                <Switch
                  checked={testConfig.simulateDelay}
                  id="simulateDelay"
                  onCheckedChange={(checked) => { handleConfigChange('simulateDelay', checked) }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>上传统计</CardTitle>
              <CardDescription>当前上传状态和统计信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">上传状态</span>
                <Badge variant={isUploading ? 'default' : 'secondary'}>
                  {isUploading ? '上传中' : '空闲'}
                </Badge>
              </div>

              {isUploading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>进度</span>
                    <span>{progress.completed}/{progress.total}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                    />
                  </div>

                  {progress.failed > 0 && (
                    <div className="text-sm text-red-600">
                      失败: {progress.failed} 个文件
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>已上传文件</span>
                  <Badge variant="outline">{files.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>日志记录</span>
                  <Badge variant="outline">{logs.length}</Badge>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={files.length === 0 && logs.length === 0}
                variant="outline"
                onClick={handleClearAll}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                清空所有
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 功能测试区域 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>文件上传测试</CardTitle>
              <CardDescription>测试 FileUploader 组件的各种功能</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                accept={testConfig.accept}
                loading={isUploading}
                maxFiles={testConfig.maxFiles}
                multiple={true}
                readonly={testConfig.readonlyMode}
                value={files}
                onChange={setFiles}
                onFileRemove={handleFileRemove}
                onFilesSelected={handleFilesSelected}
              />
            </CardContent>
          </Card>

          {/* 日志输出区域 */}
          <Card>
            <CardHeader>
              <CardTitle>操作日志</CardTitle>
              <CardDescription>实时显示上传操作的状态和结果</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {logs.length === 0
                  ? (
                      <div className="text-center text-muted-foreground py-8">
                        暂无操作日志
                      </div>
                    )
                  : (
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="mt-0.5">{getLogIcon(log.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">{log.message}</div>
                              {log.details && (
                                <div className="text-xs text-muted-foreground mt-1">{log.details}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {log.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 文件列表详情 */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>已上传文件详情</CardTitle>
                <CardDescription>显示所有成功上传的文件信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{file.originalName}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)} • {file.mimeType}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">ID: {file.id.slice(0, 8)}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            void handleFileRemove(file)
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
