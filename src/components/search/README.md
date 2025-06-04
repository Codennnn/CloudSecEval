# NestJS 文档搜索组件

一个功能完整且用户体验优秀的文档搜索弹框面板，专为 NestJS 中文文档项目设计。

## 功能特色

- 🚀 **实时搜索**：输入即搜索，快速响应
- ⌨️ **键盘导航**：完整的键盘操作支持
- 💾 **搜索历史**：自动记录并管理搜索历史
- 📱 **响应式设计**：支持桌面和移动设备
- 🎨 **美观界面**：现代化的设计和流畅的动画

## 快速开始

### 基本使用

```tsx
import React, { useState } from 'react'
import { SearchDialog, SearchTrigger } from '~/components/search'

function MyComponent() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <SearchTrigger onClick={() => setSearchOpen(true)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
```

### 添加全局快捷键

```tsx
import { useEffect } from 'react'

function App() {
  const [searchOpen, setSearchOpen] = useState(false)

  // 注册 Cmd+K / Ctrl+K 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <SearchTrigger onClick={() => setSearchOpen(true)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
```

## 组件 API

### SearchDialog

主要的搜索对话框组件。

**Props:**

- `open: boolean` - 控制对话框的显示/隐藏
- `onOpenChange: (open: boolean) => void` - 对话框状态变化回调

### SearchTrigger

搜索触发按钮组件。

**Props:**

- `onClick: () => void` - 点击回调函数

## 键盘快捷键

- `Cmd+K` / `Ctrl+K` - 打开搜索对话框
- `↑` `↓` - 在搜索结果中导航
- `Enter` - 选择当前高亮的搜索结果
- `Esc` - 关闭搜索对话框

## 搜索功能

### 实时搜索

- 输入关键词即时显示搜索结果
- 支持中英文关键词搜索
- 智能匹配文档标题和内容

### 搜索历史

- 自动保存最近 10 次搜索记录
- 支持快速重复搜索
- 可一键清除搜索历史

### 搜索结果

- 显示文档标题、内容预览和章节信息
- 点击结果直接跳转到对应页面
- 键盘导航支持

## 样式定制

组件使用 Tailwind CSS 构建，你可以通过以下方式定制样式：

1. 修改 `AdvancedSearchDialog.tsx` 中的 className
2. 使用 CSS 变量覆盖默认样式
3. 通过 Tailwind 配置调整主题色彩

## 环境要求

- React 18+
- TypeScript
- Tailwind CSS
- @oramacloud/react-client
- @radix-ui/react-dialog
- lucide-react

## 示例页面

查看 `SearchExample.tsx` 文件了解完整的使用示例。
