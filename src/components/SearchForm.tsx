'use client'

import { useState } from 'react'

import { AnswerPanel } from '~/components/answer/AnswerPanel'
import { AnswerTrigger } from '~/components/answer/AnswerTrigger'
import { SearchDialog } from '~/components/search/SearchDialog'
import { SearchTrigger } from '~/components/search/SearchTrigger'
import {
  SidebarGroup,
  SidebarGroupContent,
} from '~/components/ui/sidebar'

export function SearchForm() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [answerOpen, setAnswerOpen] = useState(false)

  return (
    <div>
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <div className="space-y-1.5">
            <SearchTrigger
              onTriggerOpen={() => {
                setSearchOpen(true)
              }}
            />

            <AnswerTrigger
              onTriggerOpen={() => {
                setAnswerOpen(true)
              }}
            />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />

      {/* AI 问答面板 */}
      {answerOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg z-50">
          <AnswerPanel
            isVisible={answerOpen}
            onClose={() => { setAnswerOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}
