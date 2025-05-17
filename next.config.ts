import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
// import remarkGfm from 'remark-gfm'

const nextConfig: NextConfig = {
}

const withMDX = createMDX({
  extension: /\.mdx$/,
  options: {
    remarkPlugins: [
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      ['remark-gfm', { strict: true, throwOnError: true }],
    ],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
