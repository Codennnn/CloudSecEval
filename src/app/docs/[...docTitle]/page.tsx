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
        <article
          className={cn(
            'prose dark:prose-invert prose-blockquote:font-normal prose-blockquote:text-sm prose-blockquote:not-italic prose-a:underline-offset-4',
            '@container p-10 @md:p-8 @sm:p-4 max-w-[75ch] mx-auto',
          )}
        >
          <DocContent />
        </article>
      )
    }
    catch (error) {
      console.error(`无法加载文档: ${docPath}`, error)

      notFound()
    }
  }

  return null
}
