import { useCallback, useEffect, useState } from 'react'

export interface SearchHistoryItem {
  term: string
  timestamp: number
  resultsCount?: number
  clicked?: boolean
  category?: string
}

// 搜索历史管理
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 加载历史记录
  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem('doc-search-history')

        if (saved) {
          const parsed = JSON.parse(saved) as SearchHistoryItem[]

          // 过滤掉无效的历史记录
          const validHistory = parsed.filter((item) =>
            item.term
            && item.term.trim().length > 0
            && typeof item.timestamp === 'number',
          )

          setHistory(validHistory)
        }
      }
      catch (error) {
        console.warn('Failed to load search history:', error)
        setHistory([])
      }
      finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  // 添加到历史记录
  const addToHistory = useCallback((
    term: string,
    resultsCount?: number,
    category?: string,
  ) => {
    if (!term.trim()) {
      return
    }

    setHistory((prev) => {
      // 移除已存在的相同搜索词
      const filtered = prev.filter((item) => item.term !== term)

      const newItem: SearchHistoryItem = {
        term: term.trim(),
        timestamp: Date.now(),
        resultsCount,
        category,
        clicked: false,
      }

      const newHistory = [newItem, ...filtered].slice(0, 20) // 保留最近 20 条

      try {
        localStorage.setItem('doc-search-history', JSON.stringify(newHistory))
      }
      catch (error) {
        console.warn('Failed to save search history:', error)
      }

      return newHistory
    })
  }, [])

  // 标记搜索词为已点击
  const markAsClicked = useCallback((term: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.term === term ? { ...item, clicked: true } : item,
      )

      try {
        localStorage.setItem('doc-search-history', JSON.stringify(updated))
      }
      catch (error) {
        console.warn('Failed to update search history:', error)
      }

      return updated
    })
  }, [])

  // 删除特定的历史记录
  const removeFromHistory = useCallback((term: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.term !== term)

      try {
        localStorage.setItem('doc-search-history', JSON.stringify(filtered))
      }
      catch (error) {
        console.warn('Failed to remove from search history:', error)
      }

      return filtered
    })
  }, [])

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setHistory([])

    try {
      localStorage.removeItem('doc-search-history')
    }
    catch (error) {
      console.warn('Failed to clear search history:', error)
    }
  }, [])

  // 获取热门搜索词
  const getPopularSearches = useCallback(() => {
    return history
      .filter((item) => item.resultsCount && item.resultsCount > 0)
      .sort((a, b) => (b.resultsCount ?? 0) - (a.resultsCount ?? 0))
      .slice(0, 5)
  }, [history])

  // 获取最近的搜索词
  const getRecentSearches = useCallback(() => {
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
  }, [history])

  // 搜索统计
  const getSearchStats = useCallback(() => {
    const totalSearches = history.length
    const successfulSearches = history.filter((item) =>
      item.resultsCount && item.resultsCount > 0,
    ).length
    const clickedSearches = history.filter((item) => item.clicked).length

    return {
      totalSearches,
      successfulSearches,
      clickedSearches,
      successRate: totalSearches > 0 ? (successfulSearches / totalSearches) * 100 : 0,
      clickRate: totalSearches > 0 ? (clickedSearches / totalSearches) * 100 : 0,
    }
  }, [history])

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    markAsClicked,
    clearHistory,
    getPopularSearches,
    getRecentSearches,
    getSearchStats,
  }
}
