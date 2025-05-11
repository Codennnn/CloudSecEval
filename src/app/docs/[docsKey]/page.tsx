import type { PageProps } from '@/types/common'

export default async function ProjectDetailPage({ params }: PageProps<{ docsKey: string }>) {
  const { docsKey } = await params

  if (!docsKey) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { default: ProjectPost } = await import(`@/docs/${docsKey}.mdx`)

  return (

    <ProjectPost />

  )
}
