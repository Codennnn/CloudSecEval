import { MDXRemote } from 'next-mdx-remote-client/rsc'

import { ProseContainer } from '~/components/ProseContainer'
import type { PageProps } from '~/types/common'
import { parseFrontMatter } from '~/utils/frontmatter'

/**
 * 获取远程 Markdown 内容
 *
 * @param docsName - 文档路径数组
 * @returns Markdown 内容
 */
async function fetchDockerDoc(docsName: string[]): Promise<string> {
  const docPath = docsName.join('/')
  const url = `https://cdn.jsdelivr.net/gh/docker/docs/content/${docPath}.md`

  const res = await fetch(url, {
    // 添加缓存策略，避免每次都重新获取
    next: { revalidate: 3600 }, // 1 小时重新验证一次
  })

  if (res.ok) {
    return res.text()
  }

  throw new Error(`Failed to fetch Docker doc: ${url}`)
}

export default async function DockerDocsPage({ params }: PageProps<{ docsName: string[] }>) {
  const { docsName } = await params

  const markdown = await fetchDockerDoc(docsName)
  const { content } = parseFrontMatter(markdown)

  return (
    <div className="max-w-[80ch] mx-auto py-[var(--content-padding)]">
      <ProseContainer as="article">
        <MDXRemote source={content} />
      </ProseContainer>
    </div>
  )
}
