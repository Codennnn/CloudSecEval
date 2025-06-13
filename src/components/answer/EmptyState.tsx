import { useMemo } from 'react'

import { MessageCircleIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'

interface EmptyStateProps {
  onQuestionClick?: (question: string) => void
}

const suggestedQuestions = [
  '什么是 NestJS？',
  '如何安装和初始化一个新的 NestJS 项目？',
  'NestJS 控制器和服务有什么区别？',
  '如何创建和使用中间件？',
  '如何实现依赖注入？',
  '如何配置和连接数据库（如 MySQL、PostgreSQL）？',
  '如何使用 TypeORM 或 Prisma？',
  '如何定义和验证 DTO？',
  '如何处理全局异常？',
  'NestJS 如何实现请求的拦截和日志记录？',
  '如何自定义装饰器？',
  '如何实现模块的懒加载？',
  'NestJS 如何进行单元测试和端到端测试？',
  '如何优雅关闭应用（Graceful Shutdown）？',
  'NestJS 常见的依赖注入错误如何排查？',
  '如何解决循环依赖问题？',
  '如何集成 Swagger 生成 API 文档？',
  '如何配置环境变量和多环境支持？',
  '如何实现定时任务（Schedule）？',
  '如何部署 NestJS 应用到生产环境？',
  '如何实现健康检查和监控？',
  '如何处理文件上传和下载？',
  '如何实现 WebSocket 实时通信？',
  '如何使用 Guards 实现权限控制？',
  '如何集成第三方认证（如 JWT、OAuth2）？',
  '如何扩展 NestJS 的日志系统？',
  '如何处理多模块和微服务架构？',
  '如何使用队列处理异步任务？',
  '如何优化 NestJS 应用的性能？',
  'NestJS 支持哪些主流数据库？',
]

export function EmptyState(props: EmptyStateProps) {
  const { onQuestionClick } = props

  const randomSuggestedQuestions = useMemo(() => {
    return suggestedQuestions.sort(() => Math.random() - 0.5).slice(0, 3)
  }, [])

  return (
    <div className="p-panel h-full flex flex-col justify-center">
      <div className="flex flex-col items-center p-5">
        <MessageCircleIcon className="size-8 mb-2 text-muted-foreground mx-auto" />

        <div className="text-sm font-medium mb-1">AI 助手</div>

        <div className="text-xs text-muted-foreground mb-4">
          询问任何关于 NestJS 的问题
        </div>
      </div>

      {/* 建议问题 */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">快速开始：</div>

        {randomSuggestedQuestions.map((question, idx) => (
          <Button
            key={idx}
            className="w-full"
            size="sm"
            variant="outline"
            onClick={() => {
              onQuestionClick?.(question)
            }}
          >
            <span className="text-xs font-normal text-left">{question}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
