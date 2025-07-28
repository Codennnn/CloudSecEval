import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Script from 'next/script'

import { StructuredData } from '~/components/StructuredData'
import { ThemeProvider } from '~/components/ThemeProvider'
import { SITE_CONFIG } from '~/constants'
import { cn } from '~/lib/utils'
import { getPageTitle } from '~/utils/common'

import '~/styles/global.css'

const harmonySansSC = localFont({
  src: [
    {
      path: '../../public/assets/fonts/vivoSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/vivoSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/vivoSans-DemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/vivoSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-harmony-os-sans-sc',
  adjustFontFallback: false,
})

const mapleMono = localFont({
  src: [
    {
      path: '../../public/assets/fonts/MapleMonoNormalNL-Regular.woff2',
      weight: '400',
      style: 'normal',
    },

    {
      path: '../../public/assets/fonts/MapleMonoNormalNL-Medium.woff2',
      weight: '500',
      style: 'normal',
    },

    {
      path: '../../public/assets/fonts/MapleMonoNormalNL-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },

    {
      path: '../../public/assets/fonts/MapleMonoNormalNL-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-maple-mono',
  display: 'swap',
  preload: true,
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: getPageTitle(),
  description: SITE_CONFIG.description,
  icons: [
    { url: SITE_CONFIG.logoPath, sizes: '32x32', rel: 'icon' },
    { url: SITE_CONFIG.appTouchIconPath, sizes: '192x192', rel: 'apple-touch-icon' },
  ],
  keywords: ['NestJS', 'Node.js', 'TypeScript', '后端框架', '中文文档', 'JavaScript', 'Express', 'Fastify', '微服务', 'GraphQL', 'REST API'],
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  alternates: {
    canonical: SITE_CONFIG.baseUrl,
    languages: {
      'zh-CN': SITE_CONFIG.baseUrl,
      en: SITE_CONFIG.englishDocsUrl,
    },
  },
  manifest: SITE_CONFIG.manifestPath,
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.language,
    type: 'website',
    images: [
      {
        url: SITE_CONFIG.logoPath,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.logoPath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // 添加搜索引擎验证（需要时取消注释并填入实际值）
    // google: 'your-google-verification-code',
    // bing: 'your-bing-verification-code',
    // baidu: 'your-baidu-verification-code',
  },
}

export default function RootLayout(props: React.PropsWithChildren) {
  return (
    <html suppressHydrationWarning className="h-full" lang="zh-CN">
      <body
        className={cn([
          'h-full antialiased font-sans',
          harmonySansSC.variable,
          mapleMono.variable,
        ])}
      >
        <StructuredData
          description={SITE_CONFIG.description}
          title={SITE_CONFIG.title}
          type="website"
          url={SITE_CONFIG.baseUrl}
        />

        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          {props.children}
        </ThemeProvider>

        {/*
          Umami 网站分析脚本
          - 用于收集网站访问数据和用户行为分析
          - 使用 Next.js Script 组件优化加载性能
          - strategy="afterInteractive" 确保在页面交互就绪后加载，不阻塞渲染
          - data-website-id 是 Umami 分配的唯一网站标识符
          - 隐私友好的 Google Analytics 替代方案
          - 仅在生产环境中加载，避免开发环境的访问数据污染
        */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            data-website-id="17a93541-f99f-43ed-8d7c-3887b4e85693"
            src="https://cloud.umami.is/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
