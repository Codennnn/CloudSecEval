'use client'

import { useEffect, useRef } from 'react'

type QuillConstructor = new (
  element: Element,
  options: Record<string, unknown>,
) => QuillInstance

interface QuillInstance {
  root: { innerHTML: string }
  clipboard: { dangerouslyPasteHTML: (html: string) => void }
  on: (eventName: 'text-change', handler: () => void) => void
}

declare global {
  interface Window {
    Quill?: QuillConstructor
  }
}

/**
 * 将 HTML 转换为纯文本，便于富文本的“非空”校验。
 */
export function getPlainTextFromHtml(html: string): string {
  if (typeof document === 'undefined') {
    return html
  }

  const div = document.createElement('div')
  div.innerHTML = html

  return div.textContent
}

/**
 * 确保通过 CDN 注入 Quill 所需的样式和脚本。
 */
function ensureQuillAssets(): Promise<QuillConstructor | undefined> {
  if (typeof window === 'undefined') {
    return Promise.resolve(undefined)
  }

  if (window.Quill) {
    return Promise.resolve(window.Quill)
  }

  return new Promise((resolve, reject) => {
    const doc = window.document

    const styleHref = 'https://cdn.quilljs.com/1.3.7/quill.snow.css'
    const existingLink = Array.from(doc.getElementsByTagName('link')).find((l) => l.href.includes('quill.snow.css'))

    if (!existingLink) {
      const link = doc.createElement('link')
      link.rel = 'stylesheet'
      link.href = styleHref
      doc.head.appendChild(link)
    }

    const scriptSrc = 'https://cdn.quilljs.com/1.3.7/quill.js'
    const existingScript = Array.from(doc.getElementsByTagName('script')).find((s) => s.src.includes('quill.js'))

    if (existingScript) {
      if (window.Quill) {
        resolve(window.Quill)

        return
      }

      existingScript.addEventListener('load', () => {
        resolve(window.Quill)
      })
      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load Quill script'))
      })

      return
    }

    const script = doc.createElement('script')
    script.src = scriptSrc
    script.async = true

    script.onload = () => {
      resolve(window.Quill)
    }

    script.onerror = () => {
      reject(new Error('Failed to load Quill script'))
    }

    doc.body.appendChild(script)
  })
}

export interface QuillEditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Quill 富文本编辑器组件（通过 CDN 动态注入资源）。
 */
export function QuillEditor(props: QuillEditorProps) {
  const { id, value, onChange, placeholder, className } = props
  const containerRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<QuillInstance | null>(null)
  const onChangeRef = useRef(onChange)
  const initialValueRef = useRef(value)
  const placeholderRef = useRef(placeholder)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    placeholderRef.current = placeholder
  }, [placeholder])

  useEffect(() => {
    let mounted = true

    void ensureQuillAssets()
      .then((Quill) => {
        if (!mounted || !containerRef.current || !Quill) {
          return
        }

        const quill = new Quill(containerRef.current, {
          theme: 'snow',
          placeholder: placeholderRef.current,
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ header: [1, 2, 3, false] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ color: [] }, { background: [] }],
              [{ align: [] }],
              ['link', 'code-block', 'clean'],
            ],
          },
        })

        quillRef.current = quill

        if (typeof initialValueRef.current === 'string' && initialValueRef.current.length > 0) {
          quill.clipboard.dangerouslyPasteHTML(initialValueRef.current)
        }

        quill.on('text-change', () => {
          const html: string = quill.root.innerHTML
          onChangeRef.current(html)
        })
      })
      .catch(() => {
        // 静默失败以不影响页面其他逻辑
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const quill = quillRef.current

    if (!quill) {
      return
    }

    const currentHtml: string = quill.root.innerHTML
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()

    if (normalize(currentHtml) !== normalize(value)) {
      quill.clipboard.dangerouslyPasteHTML(value)
    }
  }, [value])

  return (
    <div ref={containerRef} className={className ?? 'min-h-[10rem]'} id={id} />
  )
}
