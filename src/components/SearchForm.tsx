'use client'

import { useEffect, useState } from 'react'

import { SearchDialog } from '~/components/search/SearchDialog'
import { SearchTrigger } from '~/components/search/SearchTrigger'
import {
  SidebarGroup,
  SidebarGroupContent,
} from '~/components/ui/sidebar'

export function SearchForm() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <SearchTrigger onClick={() => { setSearchOpen(true) }} />
        </SidebarGroupContent>
      </SidebarGroup>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </div>
  )
}
