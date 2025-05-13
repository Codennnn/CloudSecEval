import { notFound } from 'next/navigation'

import type { PageProps } from '@/types/common'

// 为MDX文档内容定义类型
type MDXContent = React.ComponentType

export default async function ProjectDetailPage({ params }: PageProps<{ docTitle: string[] }>) {
  const { docTitle } = await params

  if (docTitle.length > 0) {
    const docPath = docTitle.join('/')

    try {
      // 添加类型断言以确保导入返回的默认导出符合 MDXContent 类型
      const { default: DocContent } = await import(`@/docs/${docPath}.mdx`) as { default: MDXContent }

      return (
        <article className="prose">
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
