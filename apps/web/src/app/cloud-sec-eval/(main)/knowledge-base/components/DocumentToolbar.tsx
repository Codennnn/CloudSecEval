'use client'

import { useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { FilterIcon, SearchIcon, SortAscIcon, SortDescIcon, XIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'

import { useKnowledgeBaseStore } from '../stores/useKnowledgeBaseStore'
import { DocumentType, SortBy, SortOrder } from '../types'

/**
 * 文档工具栏组件
 */
export function DocumentToolbar() {
  const searchKeyword = useKnowledgeBaseStore((state) => state.searchKeyword)
  const setSearchKeyword = useKnowledgeBaseStore((state) => state.setSearchKeyword)
  const addSearchHistory = useKnowledgeBaseStore((state) => state.addSearchHistory)
  const filter = useKnowledgeBaseStore((state) => state.filter)
  const setFilter = useKnowledgeBaseStore((state) => state.setFilter)
  const resetFilter = useKnowledgeBaseStore((state) => state.resetFilter)
  const sortBy = useKnowledgeBaseStore((state) => state.sortBy)
  const setSortBy = useKnowledgeBaseStore((state) => state.setSortBy)
  const sortOrder = useKnowledgeBaseStore((state) => state.sortOrder)
  const setSortOrder = useKnowledgeBaseStore((state) => state.setSortOrder)
  const categories = useKnowledgeBaseStore((state) => state.categories)
  const tags = useKnowledgeBaseStore((state) => state.tags)

  const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword)
  const [filterOpen, setFilterOpen] = useState(false)

  /**
   * 处理搜索
   */
  const handleSearch = useEvent(() => {
    setSearchKeyword(localSearchKeyword)

    if (localSearchKeyword.trim()) {
      addSearchHistory(localSearchKeyword.trim())
    }
  })

  /**
   * 清除搜索
   */
  const handleClearSearch = useEvent(() => {
    setLocalSearchKeyword('')
    setSearchKeyword('')
  })

  /**
   * 切换排序方向
   */
  const handleToggleSortOrder = useEvent(() => {
    setSortOrder(sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc)
  })

  /**
   * 计算激活的筛选条件数量
   */
  const activeFilterCount = [
    filter.types?.length ?? 0,
    filter.tags?.length ?? 0,
    filter.categoryIds?.length ?? 0,
    filter.onlyFavorites ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0)

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 p-4">
        {/* 搜索框 */}
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder="搜索文档..."
              value={localSearchKeyword}
              onChange={(e) => { setLocalSearchKeyword(e.target.value) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            {localSearchKeyword && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-accent rounded p-0.5"
                type="button"
                onClick={handleClearSearch}
              >
                <XIcon className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button variant="outline" onClick={handleSearch}>
            搜索
          </Button>
        </div>

        {/* 排序 */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => { setSortBy(value as SortBy) }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SortBy.Name}>按名称</SelectItem>
              <SelectItem value={SortBy.CreatedAt}>按创建时间</SelectItem>
              <SelectItem value={SortBy.UpdatedAt}>按更新时间</SelectItem>
              <SelectItem value={SortBy.ViewCount}>按查看次数</SelectItem>
              <SelectItem value={SortBy.LastViewedAt}>按最后查看</SelectItem>
            </SelectContent>
          </Select>
          <Button size="icon" variant="outline" onClick={handleToggleSortOrder}>
            {sortOrder === SortOrder.Asc
              ? <SortAscIcon className="size-4" />
              : <SortDescIcon className="size-4" />}
          </Button>
        </div>

        {/* 筛选 */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <FilterIcon className="size-4" />
              筛选
              {activeFilterCount > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">筛选条件</h4>
                {activeFilterCount > 0 && (
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      resetFilter()
                      setFilterOpen(false)
                    }}
                  >
                    清除
                  </Button>
                )}
              </div>

              <Separator />

              {/* 只显示收藏 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="only-favorites">
                  只显示收藏
                </label>
                <Switch
                  checked={filter.onlyFavorites ?? false}
                  id="only-favorites"
                  onCheckedChange={(checked) => { setFilter({ onlyFavorites: checked }) }}
                />
              </div>

              <Separator />

              {/* 文档类型 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">文档类型</label>
                <div className="space-y-2">
                  {Object.values(DocumentType).map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <input
                        checked={filter.types?.includes(type) ?? false}
                        className="rounded border-gray-300"
                        id={`type-${type}`}
                        type="checkbox"
                        onChange={(e) => {
                          const currentTypes = filter.types ?? []

                          if (e.target.checked) {
                            setFilter({ types: [...currentTypes, type] })
                          }
                          else {
                            setFilter({ types: currentTypes.filter((t) => t !== type) })
                          }
                        }}
                      />
                      <label className="text-sm" htmlFor={`type-${type}`}>
                        {type === DocumentType.Markdown && 'Markdown'}
                        {type === DocumentType.Text && '纯文本'}
                        {type === DocumentType.PDF && 'PDF'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 分类筛选 */}
              {categories.length > 0 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">文档分类</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center gap-2">
                          <input
                            checked={filter.categoryIds?.includes(category.id) ?? false}
                            className="rounded border-gray-300"
                            id={`category-${category.id}`}
                            type="checkbox"
                            onChange={(e) => {
                              const currentCategories = filter.categoryIds ?? []

                              if (e.target.checked) {
                                setFilter({ categoryIds: [...currentCategories, category.id] })
                              }
                              else {
                                setFilter({
                                  categoryIds: currentCategories.filter((c) => c !== category.id),
                                })
                              }
                            }}
                          />
                          <label className="text-sm" htmlFor={`category-${category.id}`}>
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 标签筛选 */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">文档标签</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isSelected = filter.tags?.includes(tag.name) ?? false

                      return (
                        <Badge
                          key={tag.id}
                          className="cursor-pointer"
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={() => {
                            const currentTags = filter.tags ?? []

                            if (isSelected) {
                              setFilter({ tags: currentTags.filter((t) => t !== tag.name) })
                            }
                            else {
                              setFilter({ tags: [...currentTags, tag.name] })
                            }
                          }}
                        >
                          {tag.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
