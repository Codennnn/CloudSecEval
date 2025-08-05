import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
// import rehypeShiki from '@shikijs/rehype'
import rehypeMdxCodeProps from 'rehype-mdx-code-props'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@shikijs/twoslash'],

  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // 添加安全头和缓存策略
  // eslint-disable-next-line @typescript-eslint/require-await
  async headers() {
    return [
      {
        // 为所有页面添加 SEO 相关的安全头
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // 为所有静态资源添加安全头
        source: '/assets/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        // 为图片文件添加额外的保护头
        source: '/assets/:path*\\.(jpg|jpeg|png|gif|bmp|ico|svg|webp)',
        headers: [
          {
            key: 'X-Image-Protection',
            value: 'hotlink-protected',
          },
        ],
      },
    ]
  },

  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 如果你有自定义域名，可以在这里添加
    domains: [],
    // 允许优化的路径
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 压缩配置
  compress: true,

  // 启用实验性功能
  experimental: {
    // 优化字体加载
    optimizePackageImports: ['lucide-react'],
  },

  // 性能优化
  poweredByHeader: false, // 移除 X-Powered-By 头

  // eslint-disable-next-line @typescript-eslint/require-await
  async rewrites() {
    const source = `${process.env.NEXT_PUBLIC_API_PROXY_SOURCE}/:path*`
    const destination = `${process.env.NEXT_PUBLIC_API_PROXY_DESTINATION}/:path*`

    return [
      {
        source,
        destination,
      },
    ]
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeMdxCodeProps,
      rehypeSlug,
      // [
      //   rehypeShiki,
      //   {
      //     themes: {
      //       light: 'github-light',
      //       dark: 'github-dark',
      //     },
      //     inline: 'tailing-curly-colon',
      //   },
      // ],
    ],
  },
})

export default withMDX(nextConfig)
