import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import rehypeMdxCodeProps from 'rehype-mdx-code-props'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@shikijs/twoslash'],

  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeMdxCodeProps,
      rehypeSlug,
    ],
  },
})

export default withMDX(nextConfig)
