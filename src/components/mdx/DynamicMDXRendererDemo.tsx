'use client'

import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

import { DynamicMDXRenderer } from './DynamicMDXRenderer'

// 模拟流式内容的完整 Markdown 示例
const FULL_MARKDOWN_CONTENT = `# NestJS 中文文档示例

这是一个 **动态 MDX 渲染器** 的测试示例，展示了各种 Markdown 语法元素。

## 基础语法

### 文本格式

- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- \`行内代码\`
- [链接示例](https://nestjs.com)

### 列表

#### 无序列表
- 第一项
- 第二项
  - 嵌套项目 1
  - 嵌套项目 2
- 第三项

#### 有序列表
1. 首先做这个
2. 然后做那个
3. 最后完成这个

### 引用

> 这是一个引用块
> 
> 可以包含多行内容
> 
> > 这是嵌套引用

## 代码示例

### TypeScript 代码

\`\`\`typescript filename="app.controller.ts" showLineNumbers
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }
}
\`\`\`

### JavaScript 代码

\`\`\`javascript filename="config.js"
const config = {
  database: {
    host: 'localhost',
    port: 5432,
    name: 'nestjs_app'
  },
  redis: {
    host: 'localhost',
    port: 6379
  }
};

module.exports = config;
\`\`\`

### JSON 配置

\`\`\`json filename="package.json"
{
  "name": "nestjs-app",
  "version": "1.0.0",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build"
  },
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0"
  }
}
\`\`\`

### Shell 命令

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run start:dev

# 构建项目
npm run build
\`\`\`

## 表格

| 特性 | 描述 | 状态 |
|------|------|------|
| 依赖注入 | 强大的 DI 容器 | ✅ 支持 |
| 装饰器 | TypeScript 装饰器支持 | ✅ 支持 |
| 中间件 | Express/Fastify 中间件 | ✅ 支持 |
| 守卫 | 路由守卫和权限控制 | ✅ 支持 |
| 拦截器 | 请求/响应拦截 | ✅ 支持 |

## Mermaid 图表

\`\`\`mermaid
graph TD
    A[客户端请求] --> B{路由匹配}
    B -->|匹配成功| C[守卫验证]
    B -->|匹配失败| D[404 错误]
    C -->|验证通过| E[拦截器处理]
    C -->|验证失败| F[401/403 错误]
    E --> G[控制器方法]
    G --> H[服务层处理]
    H --> I[数据库操作]
    I --> J[响应拦截器]
    J --> K[返回响应]
\`\`\`

## 任务列表

- [x] 完成基础框架搭建
- [x] 实现用户认证模块
- [ ] 添加权限管理系统
- [ ] 集成缓存机制
- [ ] 编写单元测试
- [ ] 部署到生产环境

## 警告和提示

> ⚠️ **注意**: 在生产环境中使用时，请确保正确配置环境变量。

> 💡 **提示**: 使用 \`@nestjs/config\` 模块来管理配置文件。

> 🚀 **性能优化**: 考虑使用 Redis 来缓存频繁访问的数据。

## 数学公式

行内公式：\\(E = mc^2\\)

块级公式：
\\[
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
\\]

## 分隔线

---

## 结论

这个示例展示了 **DynamicMDXRenderer** 组件的强大功能，能够正确渲染各种 Markdown 语法元素，包括：

1. 基础文本格式化
2. 代码高亮显示
3. 表格和列表
4. Mermaid 图表
5. 数学公式
6. 任务列表

组件支持流式内容更新，非常适合用于聊天应用、文档编辑器等场景。`

/**
 * 动态 MDX 渲染器演示组件
 *
 * 展示如何使用 DynamicMDXRenderer 组件处理流式内容
 * 包含丰富的 Markdown 语法元素测试
 */
export function DynamicMDXRendererDemo() {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamSpeed, setStreamSpeed] = useState(50) // 毫秒

  // 模拟流式内容传输
  const startStreaming = () => {
    setContent('')
    setIsStreaming(true)

    let currentIndex = 0
    const streamInterval = setInterval(() => {
      if (currentIndex >= FULL_MARKDOWN_CONTENT.length) {
        clearInterval(streamInterval)
        setIsStreaming(false)

        return
      }

      // 每次添加一个字符，模拟真实的流式传输
      setContent((prev) => prev + FULL_MARKDOWN_CONTENT[currentIndex])
      currentIndex++
    }, streamSpeed)
  }

  // 重置内容
  const resetContent = () => {
    setContent('')
    setIsStreaming(false)
  }

  // 立即显示完整内容
  const showFullContent = () => {
    setContent(FULL_MARKDOWN_CONTENT)
    setIsStreaming(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* 控制面板 */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">DynamicMDXRenderer 测试示例</h1>
          <p className="text-muted-foreground mt-2">
            演示动态 MDX 渲染器如何处理流式内容和各种 Markdown 语法元素
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isStreaming}
            variant="default"
            onClick={startStreaming}
          >
            {isStreaming ? '流式传输中...' : '开始流式传输'}
          </Button>
          <Button
            variant="outline"
            onClick={showFullContent}
          >
            显示完整内容
          </Button>
          <Button
            variant="secondary"
            onClick={resetContent}
          >
            重置内容
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="speed">
            流式速度:
          </label>
          <input
            className="w-32"
            disabled={isStreaming}
            id="speed"
            max="200"
            min="10"
            type="range"
            value={streamSpeed}
            onChange={(e) => { setStreamSpeed(Number(e.target.value)) }}
          />
          <span className="text-sm text-muted-foreground">
            {streamSpeed}ms/字符
          </span>
        </div>

        <div className="text-sm text-muted-foreground">
          当前内容长度: {content.length} / {FULL_MARKDOWN_CONTENT.length} 字符
          {isStreaming && (
            <span className="ml-2 inline-flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
              流式传输中
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* 渲染结果 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">渲染结果</h2>
          <p className="text-muted-foreground">
            下方展示 DynamicMDXRenderer 的实时渲染效果
          </p>
        </div>

        <div className="border rounded-lg p-4 min-h-[200px] bg-background">
          <DynamicMDXRenderer
            content={content}
            showLoading={true}
          />
          {!content && !isStreaming && (
            <div className="text-center text-muted-foreground py-8">
              点击上方按钮开始测试 MDX 渲染
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* 原始内容 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">原始 Markdown 内容</h2>
          <p className="text-muted-foreground">
            当前传入 DynamicMDXRenderer 的原始内容
          </p>
        </div>

        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap border">
          {content || '暂无内容'}
        </pre>
      </div>
    </div>
  )
}
