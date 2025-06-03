import type { Metadata } from 'next'
import { Noto_Sans_SC } from 'next/font/google'
import localFont from 'next/font/local'

import { ThemeProvider } from '~/components/ThemeProvider'
import { cn } from '~/lib/utils'
import { getPageTitle } from '~/utils/common'

import '~/styles/global.css'

const notoSansSC = Noto_Sans_SC({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-noto-sans-sc',
  adjustFontFallback: false,
})

const mapleMono = localFont({
  src: [
    {
      path: './fonts/MapleMonoNormalNL-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    // {
    //   path: './fonts/MapleMonoNormalNL-Italic.ttf',
    //   weight: '400',
    //   style: 'italic',
    // },

    {
      path: './fonts/MapleMonoNormalNL-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    // {
    //   path: '/fonts/MapleMonoNormalNL-MediumItalic.ttf',
    //   weight: '500',
    //   style: 'italic',
    // },

    {
      path: './fonts/MapleMonoNormalNL-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    // {
    //   path: './fonts/MapleMonoNormalNL-SemiBoldItalic.ttf',
    //   weight: '600',
    //   style: 'italic',
    // },

    {
      path: './fonts/MapleMonoNormalNL-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    // {
    //   path: './fonts/MapleMonoNormalNL-BoldItalic.ttf',
    //   weight: '700',
    //   style: 'italic',
    // },
  ],
  variable: '--font-maple-mono',
  display: 'swap',
  preload: true,
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: getPageTitle(),
  description: 'NestJS 中文文档 - 用于构建高效、可靠和可扩展的服务端应用程序的渐进式 Node.js 框架',
  icons: [{ url: '/logo.png', sizes: '32x32', rel: 'icon' }],
  keywords: ['NestJS', 'Node.js', 'TypeScript', '后端框架', '中文文档'],
  authors: [{ name: 'NestJS 中文文档团队' }],
}

export default function RootLayout(props: React.PropsWithChildren) {
  return (
    <html suppressHydrationWarning className="h-full" lang="zh-CN">
      <body
        className={cn([
          'h-full antialiased font-sans',
          notoSansSC.variable,
          mapleMono.variable,
        ])}
      >
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          {props.children}
        </ThemeProvider>
      </body>
    </html>
  )
}
