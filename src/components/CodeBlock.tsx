import { transformerNotationHighlight } from '@shikijs/transformers'
// import { transformerTwoslash } from '@shikijs/twoslash'
import { type BundledLanguage, type CodeToHastOptions, codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang: BundledLanguage
  filename?: string
  showLineNumbers?: boolean
}

export async function CodeBlock(props: CodeBlockProps) {
  const { code, lang, filename, showLineNumbers } = props

  const transformers: CodeToHastOptions['transformers'] = [
    // transformerTwoslash(),
    transformerNotationHighlight(),
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
    <div>
      <div>{filename}</div>
      <div dangerouslySetInnerHTML={{ __html: out }} />
    </div>
  )
}
