import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import rehypeMdxCodeProps from 'rehype-mdx-code-props'
import rehypeMermaid from 'rehype-mermaid'
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
      [
        rehypeMermaid, {
          strategy: 'inline-svg',
          mermaidConfig: {
            theme: 'base',
            themeVariables: {
              primaryColor: '#FFFFFF',
              primaryTextColor: '#252525',
              primaryBorderColor: '#EBEBEB',

              background: '#FFFFFF',
              lineColor: '#8E8E8E',
              textColor: '#252525',

              noteBkgColor: '#F7F7F7',
              noteTextColor: '#8E8E8E',
              noteBorderColor: '#EBEBEB',

              pie1: '#DB5D4F',
              pie2: '#2C9EA7',
              pie3: '#1B5D8C',
              pie4: '#96C03E',
              pie5: '#D48B36',

              actorBkg: '#FFFFFF',
              actorTextColor: '#252525',
              actorLineColor: '#EBEBEB',

              clusterBkg: '#F7F7F7',
              clusterBorder: '#EBEBEB',

              fontSize: '0.85em',

              nodeBorder: '#EBEBEB',
              nodeTextColor: '#252525',
            },
            flowchart: {
              padding: 20,
              nodeSpacing: 60,
              rankSpacing: 60,
              curve: 'basis',
              htmlLabels: true,
              width: 'auto',
              height: 'auto',
            },
            sequence: {
              actorMargin: 80,
              boxMargin: 15,
              boxTextMargin: 20,
              noteMargin: 15,
              messageMargin: 40,
              mirrorActors: true,
              wrap: true,
              wrapPadding: 10,
              width: 'auto',
              height: 'auto',
            },
            er: {
              entityPadding: 25,
              strokeWidth: 1,
              layoutDirection: 'TB',
              minEntityWidth: 100,
              minEntityHeight: 75,
              entityWidth: 'auto',
            },
            gantt: {
              topPadding: 50,
              leftPadding: 75,
              rightPadding: 50,
              bottomPadding: 50,
            },
            pie: {
              textPosition: 0.75,
            },
            wrap: true,
            maxTextSize: 5000,
            fontSize: 16,
            useMaxWidth: false,
            deterministicIds: true,
          },
        },
      ],
    ],
  },
})

export default withMDX(nextConfig)
