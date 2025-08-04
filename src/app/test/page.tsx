import Link from 'next/link'
import { transformerTwoslash } from '@shikijs/twoslash'
import { type BundledLanguage, codeToHtml } from 'shiki'

import { LanguageIcon } from '~/components/LanguageIcon'
import { Button } from '~/components/ui/button'

interface Props {
  children: string
  lang: BundledLanguage
}

async function CodeBlock(props: Props) {
  const out = await codeToHtml(props.children, {
    lang: props.lang,
    theme: 'github-dark',
    transformers: [transformerTwoslash()],
  })

  return <div dangerouslySetInnerHTML={{ __html: out }} />
}

export default function Page() {
  return (
    <main className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">测试页面</h1>
        <p className="text-muted-foreground mb-6">
          这里包含了各种组件和功能的测试用例
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">可用测试</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">DynamicMDXRenderer 测试</h3>
            <p className="text-sm text-muted-foreground">
              测试动态 MDX 渲染器的流式内容处理和各种 Markdown 语法元素渲染
            </p>
            <Link href="/test/mdx-renderer">
              <Button className="w-full" variant="outline">
                查看测试
              </Button>
            </Link>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Shiki 代码高亮测试</h3>
            <p className="text-sm text-muted-foreground">
              测试 Shiki 代码高亮和 Twoslash 类型提示功能
            </p>
            <div className="pt-2">
              <CodeBlock lang="ts">
                {[
                  'console.log("Hello")',
                  'console.log("World")',
                ].join('\n')}
              </CodeBlock>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">文件图标测试</h3>
            <p className="text-sm text-muted-foreground">
              测试根据文件名和语言类型显示对应图标的功能
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* 特定文件名图标 */}
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <LanguageIcon className="size-5" filename="nest-cli.json" lang="json" />
                <span className="text-sm font-mono">nest-cli.json</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <LanguageIcon className="size-5" filename="webpack.config.js" lang="js" />
                <span className="text-sm font-mono">webpack.config.js</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <LanguageIcon className="size-5" filename="Dockerfile" lang="" />
                <span className="text-sm font-mono">Dockerfile</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <LanguageIcon className="size-5" filename="docker-compose.yml" lang="yaml" />
                <span className="text-sm font-mono">docker-compose.yml</span>
              </div>

              {/* 语言类型图标 */}
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <LanguageIcon className="size-5" lang="typescript" />
                <span className="text-sm font-mono">TypeScript</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <LanguageIcon className="size-5" lang="javascript" />
                <span className="text-sm font-mono">JavaScript</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export const metadata = {
  title: '测试页面 - NestJS 中文文档',
  description: '各种组件和功能的测试用例集合',
}
