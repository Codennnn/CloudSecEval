import { transformerTwoslash } from '@shikijs/twoslash'
import type { BundledLanguage } from 'shiki'
import { codeToHtml } from 'shiki'

interface Props {
  children: string
  lang: BundledLanguage
}

async function CodeBlock(props: Props) {
  const out = await codeToHtml(props.children, {
    lang: props.lang,
    theme: 'github-dark',
    transformers: [transformerTwoslash()],
  })

  return <div dangerouslySetInnerHTML={{ __html: out }} />
}

export default function Page() {
  return (
    <main>
      <CodeBlock lang="ts">
        {[
          'console.log("Hello")',
          'console.log("World")',
        ].join('\n')}
      </CodeBlock>
    </main>
  )
}
