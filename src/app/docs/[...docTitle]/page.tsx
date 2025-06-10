import { Suspense } from 'react'

import { notFound } from 'next/navigation'

import { DocNavigation } from '~/components/DocNavigation'
import { Skeleton } from '~/components/ui/skeleton'
import { cn } from '~/lib/utils'
import type { PageProps } from '~/types/common'
import { getAllDocPaths, getDocNavigation } from '~/utils/docs'

type MDXContent = React.ComponentType

// 生成静态参数，预构建所有文档页面
export async function generateStaticParams() {
  try {
    const paths = await getAllDocPaths()

    return paths.map((path) => ({
      docTitle: path.split('/'),
    }))
  }
  catch (error) {
    console.error('生成静态参数失败:', error)

    return []
  }
}

// 内容加载组件
async function DocContent({ docPath }: { docPath: string }) {
  try {
    // 动态导入 MDX 内容
    const { default: DocComponent } = await import(`~/content/docs/${docPath}.mdx`) as { default: MDXContent }

    return <DocComponent />
  }
  catch (error) {
    console.error(`无法加载文档: ${docPath}`, error)
    notFound()
  }
}

// 加载指示器组件
function LoadingSpinner() {
  return (
    <div className="flex flex-col space-y-8">
      <Skeleton className="h-12 w-1/3" />

      <div className="space-y-4">
        <Skeleton className="h-5" />
        <Skeleton className="h-5" />
        <Skeleton className="h-5" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  )
}

export default async function DocsPage({ params }: PageProps<{ docTitle: string[] }>) {
  const { docTitle } = await params

  if (docTitle.length === 0) {
    notFound()
  }

  const docPath = docTitle.join('/')

  // 获取导航信息
  const navigation = getDocNavigation(`/${docPath}`)

  return (
    <div className="max-w-[80ch] mx-auto">
      <article
        className={cn(
          'prose',
          'prose-blockquote:font-normal prose-blockquote:not-italic',
          'prose-a:font-normal prose-a:decoration-dotted prose-a:hover:decoration-solid prose-a:underline-offset-4',
          'prose-figure:my-5',
          'text-current prose-headings:text-current prose-strong:text-current prose-a:text-current',
          'prose-table:my-1',
          'max-w-none',
        )}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <DocContent docPath={docPath} />
        </Suspense>
      </article>

      <DocNavigation
        next={navigation.next}
        prev={navigation.prev}
      />
    </div>
  )
}
