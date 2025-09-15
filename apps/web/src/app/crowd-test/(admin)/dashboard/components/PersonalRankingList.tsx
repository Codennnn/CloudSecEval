'use client'

import type { ReactNode } from 'react'

interface PersonalRankingItem {
  name: string
  reports: number
  vulns: number
  score: number
}

interface PersonalRankingListProps {
  data: PersonalRankingItem[]
  maxItems?: number
  isLoading?: boolean
  errorMessage?: string
}

export function PersonalRankingList(props: PersonalRankingListProps) {
  const { data, maxItems = 10, isLoading, errorMessage } = props

  let content: ReactNode = null

  if (isLoading === true) {
    content = (
      <ul aria-live="polite" className="space-y-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-28 bg-muted rounded animate-pulse" />
              <div className="h-2 w-36 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-10 rounded bg-muted animate-pulse" />
          </li>
        ))}
      </ul>
    )
  }
  else if (errorMessage) {
    content = (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
        加载失败：{errorMessage}
      </div>
    )
  }
  else if (data.length === 0) {
    content = (
      <div className="text-sm text-muted-foreground" role="status">
        暂无数据
      </div>
    )
  }
  else {
    const sorted = [...data].sort((a, b) => b.score - a.score)
    const sliced = sorted.slice(0, maxItems)
    const topScore = Math.max(1, sliced[0]?.score ?? 1)

    const getRankBadgeClass = (rank: number) => {
      let base = 'flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold'

      if (rank === 1) {
        base = `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-200`
      }
      else if (rank === 2) {
        base = `${base} bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200`
      }
      else if (rank === 3) {
        base = `${base} bg-orange-50 text-orange-700 ring-1 ring-orange-200`
      }
      else {
        base = `${base} bg-muted text-foreground`
      }

      return base
    }

    content = (
      <ul className="space-y-2">
        {sliced.map((person, index) => {
          const rank = index + 1
          const scorePercent = Math.round((person.score / topScore) * 100)

          return (
            <li key={person.name} className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50">
              <div aria-label={`第${rank}名`} className={getRankBadgeClass(rank)}>
                {rank}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium leading-none">
                    {person.name}
                  </p>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {person.score}
                    </p>
                    <p className="text-[10px] text-muted-foreground">分</p>
                  </div>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {person.reports} 报告 · {person.vulns} 漏洞
                </p>

                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                    <div
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={scorePercent}
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      role="progressbar"
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    相对最高 {scorePercent}%
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div>
      {content}
    </div>
  )
}
