import { transformerNotationHighlight } from '@shikijs/transformers'
// import { transformerTwoslash } from '@shikijs/twoslash'
import { type BundledLanguage, type CodeToHastOptions, codeToHtml } from 'shiki'

import { LanguageIcon } from '~/components/LanguageIcon'

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
    <div className="not-prose not-first:mt-5 border border-border rounded-lg overflow-hidden max-w-full w-full">
      {!!filename && (
        <div className="flex items-center gap-2 text-sm px-4 py-3 bg-muted">
          <LanguageIcon className="size-4" lang={lang} />
          {filename && <span className="font-medium">{filename}</span>}
        </div>
      )}

      <div
        dangerouslySetInnerHTML={{ __html: out }}
      />
    </div>
  )
}
