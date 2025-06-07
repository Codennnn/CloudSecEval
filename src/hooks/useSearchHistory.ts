import { useCallback, useEffect, useState } from 'react'

export interface SearchHistoryItem {
  term: string
  timestamp: number
}

// 搜索历史管理
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('doc-search-history')

    if (saved) {
      try {
        setHistory(JSON.parse(saved) as SearchHistoryItem[])
      }
      catch {
        setHistory([])
      }
    }
  }, [])

  const addToHistory = useCallback((term: string) => {
    if (!term.trim()) {
      return
    }

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.term !== term)
      const newHistory = [
        { term, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 10) // 保留最近 10 条

      localStorage.setItem('doc-search-history', JSON.stringify(newHistory))

      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem('doc-search-history')
  }, [])

  return { history, addToHistory, clearHistory }
}
