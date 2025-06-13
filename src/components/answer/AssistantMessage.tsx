'use client'

import { useMemo } from 'react'

import type { Interaction } from '@oramacloud/client'
import { BookOpenIcon } from 'lucide-react'

import { SearchDocument } from '~/types/doc'

interface Source {
  document: SearchDocument
}

interface AssistantMessageProps {
  content: string
  interaction?: Interaction
  onSourceClick: (path: string) => void
  onRelatedQuestionClick: (question: string) => void
}

// 相关来源组件
interface SourcesListProps {
  sources: Source[]
  onSourceClick: (path: string) => void
}

function SourcesList(props: SourcesListProps) {
  const { sources, onSourceClick } = props

  if (sources.length === 0) {
    return null
  }

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <div className="text-xs font-medium mb-1 flex items-center gap-1">
        <BookOpenIcon className="size-2.5" />
        参考：
      </div>
      <div className="space-y-0.5">
        {sources.map((hit: Source, sourceIdx: number) => (
          <button
            key={sourceIdx}
            className="block text-xs text-blue-600 hover:underline text-left"
            onClick={() => {
              onSourceClick(hit.document.path ?? '#')
            }}
          >
            {hit.document.title}
          </button>
        ))}
      </div>
    </div>
  )
}

// 相关问题组件
interface RelatedQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
}

function RelatedQuestions(props: RelatedQuestionsProps) {
  const { questions, onQuestionClick } = props

  if (questions.length === 0) {
    return null
  }

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <div className="text-xs font-medium mb-1">相关问题：</div>
      <div className="space-y-0.5">
        {questions.map((query: string, queryIdx: number) => (
          <button
            key={queryIdx}
            className="block text-xs text-blue-600 hover:underline text-left"
            onClick={() => {
              onQuestionClick(query)
            }}
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  )
}

export function AssistantMessage(props: AssistantMessageProps) {
  const { content, interaction, onSourceClick, onRelatedQuestionClick } = props

  return (
    <div className="text-sm">
      {content}
      {/* <MarkdownRenderer content={content} /> */}

      {/* 显示相关来源 */}
      <SourcesList
        sources={interaction?.sources?.hits || []}
        onSourceClick={onSourceClick}
      />

      {/* 显示相关问题 */}
      <RelatedQuestions
        questions={interaction?.relatedQueries || []}
        onQuestionClick={onRelatedQuestionClick}
      />
    </div>
  )
}
