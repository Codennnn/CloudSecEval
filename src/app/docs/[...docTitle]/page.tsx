import { notFound } from 'next/navigation'

import { cn } from '~/lib/utils'
import type { PageProps } from '~/types/common'

type MDXContent = React.ComponentType

export default async function DocsPage({ params }: PageProps<{ docTitle: string[] }>) {
  const { docTitle } = await params

  if (docTitle.length > 0) {
    const docPath = docTitle.join('/')

    try {
      // 添加类型断言以确保导入返回的默认导出符合 MDXContent 类型
      const { default: DocContent } = await import(`~/content/docs/${docPath}.mdx`) as { default: MDXContent }

      return (
        <div className="@container size-full overflow-auto">
          <div className="@lg:p-16 @md:p-6 @sm:p-4">
            <article
              className={cn(
                'prose dark:prose-invert prose-blockquote:font-normal prose-blockquote:not-italic prose-a:underline-offset-4',
                'max-w-[80ch] mx-auto',
              )}
            >
              <DocContent />
            </article>
          </div>
        </div>
      )
    }
    catch (error) {
      console.error(`无法加载文档: ${docPath}`, error)

      notFound()
    }
  }

  return null
}
