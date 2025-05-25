'use client'

import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

export function ThemeModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" title="切换主题" variant="outline">
          <SunIcon className="rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all" size={18} />
          <MoonIcon className="absolute rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all" size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem variant={theme === 'light' ? 'default' : 'highlight'} onClick={() => { setTheme('light') }}>
          亮色
        </DropdownMenuItem>
        <DropdownMenuItem variant={theme === 'dark' ? 'default' : 'highlight'} onClick={() => { setTheme('dark') }}>
          暗色
        </DropdownMenuItem>
        <DropdownMenuItem variant={theme === 'system' ? 'default' : 'highlight'} onClick={() => { setTheme('system') }}>
          跟随系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
