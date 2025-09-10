import { Suspense } from 'react'

import { notFound } from 'next/navigation'
import { consola } from 'consola'
import type { MDXContent } from 'mdx/types'

import { DocLoadingSkeleton } from '~/components/DocLoadingSkeleton'
import { ProseContainer } from '~/components/ProseContainer'
import type { PageProps } from '~/types/common'

async function DocContent({ docPath }: { docPath: string }) {
  try {
    const { default: DocComponent } = await import(`~/content/project-docs/${docPath}.mdx`) as { default: MDXContent }

    return <DocComponent />
  }
  catch (err) {
    consola.error(`无法加载文档: ${docPath}`, err)
    notFound()
  }
}

export default async function DocsPage({ params }: PageProps<{ docPath: string[] }>) {
  const { docPath } = await params

  if (docPath.length === 0) {
    notFound()
  }

  return (
    <div className="p-admin-content">
      <ProseContainer as="article">
        <Suspense fallback={<DocLoadingSkeleton />}>
          <DocContent docPath={docPath.map((item) => decodeURIComponent(item)).join('/')} />
        </Suspense>
      </ProseContainer>
    </div>
  )
}
