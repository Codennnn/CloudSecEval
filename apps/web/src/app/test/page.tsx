import Link from 'next/link'

import { FileIconItem } from '~/components/FileIconItem'
import { Button } from '~/components/ui/button'
import { PUBLIC_ROUTES } from '~/constants/routes.client'

export const metadata = {
  title: '测试页面 - NestJS 中文文档',
  description: '各种组件和功能的测试用例集合',
}

/**
 * TestCard 组件的属性接口
 */
interface TestCardProps {
  /** 卡片标题 */
  title: string
  /** 卡片描述文本 */
  description: string
  /** 链接地址 */
  href: string
  /** 是否有独立的测试页面 */
  hasTestPage?: boolean
  /** 按钮文本，默认为 "查看测试" */
  buttonText?: string
  /** 子元素，用于自定义卡片内容 */
  children?: React.ReactNode
}

/**
 * 测试卡片组件
 * 用于在测试页面展示各种测试功能的入口卡片
 *
 * @param props - TestCard 组件的属性
 * @returns 测试卡片组件
 */
export function TestCard(props: TestCardProps) {
  const {
    title,
    description,
    href,
    buttonText = '查看测试',
    hasTestPage = true,
    children,
  } = props

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold">{title}</h3>

      <p className="text-sm text-muted-foreground">{description}</p>

      {children}

      {hasTestPage && (
        <Link href={href}>
          <Button className="w-full" variant="outline">
            {buttonText}
          </Button>
        </Link>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <main className="space-y-test-page">
      <div>
        <h1 className="text-3xl font-bold mb-3">测试页面</h1>
        <div className="text-muted-foreground">
          这里包含了各种组件和功能的测试用例
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-2xl font-semibold">可用测试</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TestCard
            description="测试动态 MDX 渲染器的流式内容处理和各种 Markdown 语法元素渲染"
            href={`${PUBLIC_ROUTES.TEST}/mdx-renderer`}
            title="DynamicMDXRenderer 测试"
          />

          <TestCard
            description="交互式测试 CalloutInfo 组件的各种样式变体和属性配置"
            href={`${PUBLIC_ROUTES.TEST}/callout-info`}
            title="CalloutInfo 组件测试"
          />

          <TestCard
            description="测试 Shiki 代码高亮引擎的各种功能，包括多语言支持、Twoslash 类型提示、主题切换等"
            href={`${PUBLIC_ROUTES.TEST}/shiki-highlight`}
            title="Shiki 代码高亮测试"
          />

          <TestCard
            description="测试根据文件名和语言类型显示对应图标的功能"
            hasTestPage={false}
            href="#"
            title="文件图标测试"
          >
            <div className="grid grid-cols-2 gap-3 pt-2">
              <FileIconItem filename="nest-cli.json" lang="json" />
              <FileIconItem filename="webpack.config.js" lang="js" />
              <FileIconItem filename="Dockerfile" lang="" />
              <FileIconItem filename="docker-compose.yml" lang="yaml" />
              <FileIconItem lang="typescript" />
              <FileIconItem lang="javascript" />
            </div>
          </TestCard>

          <TestCard
            description="测试 FileUploader 组件和批量上传功能，包括拖拽上传、进度追踪、错误处理等"
            href={`${PUBLIC_ROUTES.TEST}/file-upload`}
            title="文件上传功能测试"
          />

          <TestCard
            description="测试 CodeTabs 组件的多标签切换、语法高亮、文件名显示等功能"
            href={`${PUBLIC_ROUTES.TEST}/code-tabs`}
            title="CodeTabs 多标签代码块测试"
          />
        </div>
      </div>
    </main>
  )
}
