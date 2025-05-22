import { transformerTwoslash } from '@shikijs/twoslash'
import { type BundledLanguage, codeToHtml } from 'shiki'

interface Props {
  code: string
  lang: BundledLanguage
}

export async function CodeBlockServer(props: Props) {
  const out = await codeToHtml(props.code, {
    lang: props.lang,
    theme: 'github-dark',
    transformers: [transformerTwoslash()],
  })

  return <div dangerouslySetInnerHTML={{ __html: out }} />
}
