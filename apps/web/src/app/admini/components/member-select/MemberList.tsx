import { useEffect, useMemo, useRef, useState } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'
import { SearchIcon } from 'lucide-react'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { SidebarMenuButton, SidebarMenuItem } from '~/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { UserAvatar } from '~/components/UserAvatar'

import { MemberListSkeletons } from './MemberListSkeleton'

import { useUser } from '~admin/stores/useUserStore'
import { usersControllerFindAllUsers } from '~api/sdk.gen'
import type { UserListItemDto, UsersControllerFindAllUsersResponse } from '~api/types.gen'

/**
 * 成员列表组件（包含搜索与滚动加载）
 * - 负责数据获取、搜索、禁用项提示、最大选择数量的本地提示
 * - 不直接修改外部选择，点击后通过 onToggle 通知父级
 */
export interface MemberListProps {
  /** 选择模式 */
  mode?: 'single' | 'multiple'
  /** 当前已选中的 ID 列表（用于高亮与约束判断） */
  selectedIds: string[]
  /** 禁用的用户 ID */
  disabledIds?: string[]
  /** 最大可选数量（多选有效） */
  maxSelect?: number
  /** 搜索占位 */
  searchPlaceholder?: string
  /** 搜索去抖毫秒 */
  debounceMs?: number
  /** 每页条数（默认 20） */
  pageSize?: number
  /** 切换选中回调（父级负责真正修改选择集） */
  onToggle?: (user: UserListItemDto) => void
}

export function MemberList(props: MemberListProps) {
  const {
    mode = 'multiple',
    selectedIds,
    disabledIds = [],
    maxSelect,
    searchPlaceholder = '搜索成员...',
    debounceMs = 300,
    pageSize = 20,
    onToggle,
  } = props

  const user = useUser()

  const isSingle = mode === 'single'
  const disabledSet = useMemo(() => new Set(disabledIds), [disabledIds])

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
    }, debounceMs)

    return () => {
      clearTimeout(t)
    }
  }, [search, debounceMs])

  const queryResult = useInfiniteQuery<UsersControllerFindAllUsersResponse>({
    queryKey: ['member-list', debouncedSearch, pageSize] as const,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await usersControllerFindAllUsers({
        query: {
          orgId: user?.organization.id,
          page: Number(pageParam) || 1,
          pageSize,
          search: debouncedSearch || undefined,
        },
        throwOnError: true,
      })

      return data
    },
    getNextPageParam: (lastPage) => {
      const page = lastPage.pagination

      if (page?.hasNextPage) {
        return page.page + 1
      }

      return undefined
    },
  })

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
  } = queryResult

  const users = data?.pages.flatMap((p) => p.data) ?? []

  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!endRef.current) {
      return
    }

    const el = endRef.current
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      }
    })
    io.observe(el)

    return () => {
      io.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // 上限提示
  const [limitMsg, setLimitMsg] = useState<string | null>(null)

  useEffect(() => {
    if (limitMsg) {
      const t = setTimeout(() => {
        setLimitMsg(null)
      }, 1600)

      return () => {
        clearTimeout(t)
      }
    }
  }, [limitMsg])

  const isSelected = (id: string) => selectedIds.includes(id)

  const handleRowClick = (user: UserListItemDto) => {
    const id = user.id
    const selected = isSelected(id)
    const isDisabled = disabledSet.has(id)

    if (!isDisabled) {
      if (!selected) {
        if (!isSingle && typeof maxSelect === 'number' && selectedIds.length >= maxSelect) {
          setLimitMsg(`最多可选择 ${maxSelect} 人`)
        }
        else {
          onToggle?.(user)
        }
      }
      else {
        onToggle?.(user)
      }
    }
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="relative">
        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(ev) => {
            setSearch(ev.target.value)
          }}
        />
      </div>

      <ScrollGradientContainer className="p-1 pb-4">
        <div className="[--sidebar-accent:var(--secondary)] [--sidebar-accent-foreground:var(--secondary-foreground)]">
          {isLoading && (
            <MemberListSkeletons />
          )}

          {!isLoading && !isError && users.length === 0 && (
            <div className="text-muted-foreground text-sm px-2 py-8">未找到相关成员</div>
          )}

          <div className="space-y-list-item">
            {
              users.map((u) => {
                const disabled = disabledSet.has(u.id)
                const selected = isSelected(u.id)

                const row = (
                  <SidebarMenuItem key={u.id}>
                    <SidebarMenuButton
                      asChild
                      className="h-auto"
                      isActive={selected}
                      onClick={() => {
                        handleRowClick(u)
                      }}
                    >
                      <div>
                        {!isSingle && (
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => {
                              handleRowClick(u)
                            }}
                          />
                        )}

                        <div className="flex items-center gap-2">
                          <UserAvatar avatarUrl={u.avatarUrl} name={u.name} />

                          <div className="flex flex-col text-sm">
                            <span className="font-medium">{u.name ?? '-'}</span>
                            <span className="text-muted-foreground text-xs">{u.department?.name ?? '-'}</span>
                          </div>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )

                if (!disabled) {
                  return row
                }

                return (
                  <Tooltip key={u.id}>
                    <TooltipTrigger asChild>
                      {row}
                    </TooltipTrigger>
                    <TooltipContent>
                      已禁用，无法选择
                    </TooltipContent>
                  </Tooltip>
                )
              })
            }
          </div>

          <div ref={endRef} />

          {isFetchingNextPage && (
            <MemberListSkeletons />
          )}
        </div>
      </ScrollGradientContainer>

      {limitMsg && (
        <div className="text-xs text-muted-foreground">{limitMsg}</div>
      )}
    </div>
  )
}
