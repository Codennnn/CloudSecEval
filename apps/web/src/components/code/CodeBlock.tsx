import { type BundledLanguage } from 'shiki'

import { CodeContainer } from '~/components/code/CodeContainer'

import { highlightCode } from './transformers'

interface CodeBlockProps {
  code: string
  lang: BundledLanguage
  filename?: string
  title?: string
  showLineNumbers?: boolean
}

export async function CodeBlock(props: CodeBlockProps) {
  const { code, lang, filename, title, showLineNumbers } = props

  const htmlOutput = await highlightCode({
    code,
    lang,
    showLineNumbers,
    enableTwoslash: true,
  })

  return (
    <CodeContainer
      code={code}
      filename={filename}
      lang={lang}
      title={title}
    >
      <div
        dangerouslySetInnerHTML={{ __html: htmlOutput }}
      />
    </CodeContainer>
  )
}
