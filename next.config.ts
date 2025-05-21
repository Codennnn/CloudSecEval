import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
}

const withMDX = createMDX({
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
