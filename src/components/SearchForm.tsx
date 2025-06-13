'use client'

import { useState } from 'react'

import { AnswerDialog } from '~/components/answer/AnswerDialog'
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
        <SidebarGroupContent className="relative space-y-2">
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
        </SidebarGroupContent>
      </SidebarGroup>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />

      <AnswerDialog
        open={answerOpen}
        onOpenChange={setAnswerOpen}
      />
    </div>
  )
}
