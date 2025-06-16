import { transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers'
// import { transformerTwoslash } from '@shikijs/twoslash'
import { type BundledLanguage, type CodeToHastOptions, codeToHtml } from 'shiki'

import { CodeContainer } from '~/components/code/CodeContainer'

interface CodeBlockProps {
  code: string
  lang: BundledLanguage
  filename?: string
  title?: string
  showLineNumbers?: boolean
}

export async function CodeBlock(props: CodeBlockProps) {
  const { code, lang, filename, title, showLineNumbers } = props

  const transformers: CodeToHastOptions['transformers'] = [
    // transformerTwoslash(),
    transformerNotationHighlight(),
    transformerNotationWordHighlight(),
  ]

  if (showLineNumbers) {
    transformers.push({ name: 'line-numbers' })
  }

  const out = await codeToHtml(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    transformers,
  })

  return (
    <CodeContainer
      code={code}
      filename={filename}
      lang={lang}
      title={title}
    >
      <div
        dangerouslySetInnerHTML={{ __html: out }}
      />
    </CodeContainer>
  )
}
