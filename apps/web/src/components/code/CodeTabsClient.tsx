'use client'

import { useState } from 'react'

import { CodeContainer } from '~/components/code/CodeContainer'
import type { TabData } from '~/components/code/CodeTabs'
import { cn } from '~/lib/utils'

interface CodeTabsClientProps {
  /** 所有 tab 的数据 */
  tabs: TabData[]
}

/**
 * CodeTabs 客户端组件
 *
 * 负责：
 * 1. 管理当前激活的 tab 状态
 * 2. 渲染 tab 按钮列表
 * 3. 使用 CodeContainer 展示当前激活的代码
 */
export function CodeTabsClient(props: CodeTabsClientProps) {
  const { tabs } = props

  // 管理当前激活的 tab 索引
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  // 获取当前激活的 tab 数据
  const currentTab = tabs[activeTabIndex]

  // 渲染 tab 按钮列表
  const tabButtons = (
    <div className="flex items-center gap-1 ml-auto">
      {tabs.map((tab, index) => (
        <button
          key={index}
          aria-selected={index === activeTabIndex}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded transition-all duration-200',
            'hover:bg-secondary/80',
            index === activeTabIndex
              ? 'bg-secondary text-secondary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          role="tab"
          type="button"
          onClick={() => {
            setActiveTabIndex(index)
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )

  return (
    <CodeContainer
      code={currentTab.code}
      filename={currentTab.filename}
      headerContent={tabButtons}
      lang={currentTab.lang}
    >
      <div
        dangerouslySetInnerHTML={{ __html: currentTab.htmlOutput }}
      />
    </CodeContainer>
  )
}
