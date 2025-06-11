import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { ThemeProvider } from '~/components/ThemeProvider'
import { cn } from '~/lib/utils'
import { getPageTitle } from '~/utils/common'

import '~/styles/global.css'

const harmonySansSC = localFont({
  src: [
    {
      path: '../../public/assets/fonts/HarmonyOS_Sans_SC_Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/HarmonyOS_Sans_SC_Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/HarmonyOS_Sans_SC_Bold.woff2',
      weight: '600',
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
          harmonySansSC.variable,
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
