'use client'

import { useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'

import {
  MemberSelectDialog,
  openMemberSelectDialog,
} from '~admin/components/member-select/MemberSelectDialog'
import type { UserListItemDto } from '~api/types.gen'

/**
 * 成员选择对话框测试页面
 */
export default function MemberSelectDialogTestPage() {
  // 基础状态
  const [selectedMembers, setSelectedMembers] = useState<UserListItemDto[]>([])
  const [mode, setMode] = useState<'single' | 'multiple'>('multiple')
  const [maxSelect, setMaxSelect] = useState<number | undefined>(undefined)
  const [enableMaxSelect, setEnableMaxSelect] = useState(false)

  // 自定义配置
  const [customTitle, setCustomTitle] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [searchPlaceholder, setSearchPlaceholder] = useState('')

  /**
   * 测试基础功能
   */
  const handleBasicTest = useEvent(async () => {
    try {
      const selected = await openMemberSelectDialog({
        title: '选择成员',
        description: '请选择要添加的成员',
        mode,
        maxSelect: enableMaxSelect ? maxSelect : undefined,
        searchPlaceholder: '搜索成员...',
      })

      if (selected && selected.length > 0) {
        setSelectedMembers(selected)
        toast.success(`成功选择了 ${selected.length} 个成员`)
      }
    }
    catch {
      toast.error('选择成员失败')
    }
  })

  /**
   * 测试自定义配置
   */
  const handleCustomTest = useEvent(async () => {
    try {
      const selected = await openMemberSelectDialog({
        title: customTitle || '自定义标题',
        description: customDescription || '自定义描述',
        mode,
        maxSelect: enableMaxSelect ? maxSelect : undefined,
        searchPlaceholder: searchPlaceholder || '搜索成员...',
      })

      if (selected && selected.length > 0) {
        setSelectedMembers(selected)
        toast.success(`成功选择了 ${selected.length} 个成员`)
      }
    }
    catch {
      toast.error('选择成员失败')
    }
  })

  /**
   * 边界测试：最大选择数量（5个）
   */
  const handleMaxSelectTest = useEvent(async () => {
    try {
      const selected = await openMemberSelectDialog({
        title: '最大选择测试',
        description: '测试最大选择数量限制（最多选择 5 个）',
        mode: 'multiple',
        maxSelect: 5,
        searchPlaceholder: '搜索成员...',
      })

      if (selected && selected.length > 0) {
        setSelectedMembers(selected)
        toast.success(`成功选择了 ${selected.length} 个成员`)
      }
    }
    catch {
      toast.error('选择成员失败')
    }
  })

  /**
   * 边界测试：极限选择数量（最小值）
   */
  const handleMinSelectTest = useEvent(async () => {
    try {
      const selected = await openMemberSelectDialog({
        title: '最小选择测试',
        description: '测试最小选择数量限制（设置为 1）',
        mode: 'multiple',
        maxSelect: 1,
        searchPlaceholder: '搜索成员...',
      })

      if (selected && selected.length > 0) {
        setSelectedMembers(selected)
        toast.success(`成功选择了 ${selected.length} 个成员`)
      }
    }
    catch {
      toast.error('选择成员失败')
    }
  })

  /**
   * 边界测试：特殊字符和长文本
   */
  const handleSpecialCharTest = useEvent(async () => {
    try {
      const selected = await openMemberSelectDialog({
        title: '特殊字符测试 🚀 & <script>alert("test")</script> 测试',
        description: '这是一个非常长的描述文本，用来测试对话框在处理长文本时的表现。包含特殊字符：@#$%^&*()_+-=[]{}|;\':",./<>? 以及 Unicode 字符：你好世界 🌍 🎉 ✨ 💫 🔥 ⭐ 🌟 💎 🎯 🚀 📱 💻 🖥️ ⌚ 📷 🎮 🎵 🎬 📚 ✏️ 🔍 💡 🔧 ⚙️ 🛠️ 🔨 ⚡ 🌈 🦄 🐉 🦋 🌸 🌺 🌻 🌷 🌹 🌿 🍀 🌱 🌳 🌲 🌴 🌵 🌾 🌽 🍎 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥒 🌶️ 🌽 🥕 🥔 🍠 🥐 🍞 🥖 🥨 🧀 🥚 🍳 🥞 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🥙 🌮 🌯 🥗 🥘 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍘 🍥 🥠 🍢 🍡 🍧 🍨 🍦 🥧 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 🍼 ☕ 🍵 🥤 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🍾 🥄 🍴 🍽️',
        mode: 'multiple',
        maxSelect: 5,
        searchPlaceholder: '搜索特殊字符测试 🔍 & <input>test</input>...',
      })

      if (selected && selected.length > 0) {
        setSelectedMembers(selected)
        toast.success(`成功选择了 ${selected.length} 个成员`)
      }
    }
    catch {
      toast.error('选择成员失败')
    }
  })

  /**
   * 边界测试：空字符串配置
   */
  const handleEmptyConfigTest = useEvent(async () => {
    try {
      const selected = await openMemberSelectDialog({
        title: '',
        description: '',
        mode: 'single',
        maxSelect: undefined,
        searchPlaceholder: '',
      })

      if (selected && selected.length > 0) {
        setSelectedMembers(selected)
        toast.success(`成功选择了 ${selected.length} 个成员`)
      }
    }
    catch {
      toast.error('选择成员失败')
    }
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">成员选择对话框测试</h1>
        <p className="text-muted-foreground">
          测试成员选择对话框的各种功能和配置选项
        </p>
      </div>

      {/* 基础配置 */}
      <Card>
        <CardHeader>
          <CardTitle>基础配置</CardTitle>
          <CardDescription>配置对话框的基本参数</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 选择模式 */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={mode === 'multiple'}
              onCheckedChange={(checked) => { setMode(checked ? 'multiple' : 'single') }}
            />
            <Label>多选模式 (当前: {mode === 'multiple' ? '多选' : '单选'})</Label>
          </div>

          {/* 最大选择数量 */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={enableMaxSelect}
              onCheckedChange={setEnableMaxSelect}
            />
            <Label>启用最大选择数量限制</Label>
          </div>

          {enableMaxSelect && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="max-select">最大选择数量:</Label>
              <Input
                className="w-20"
                id="max-select"
                max="100"
                min="1"
                type="number"
                value={maxSelect ?? ''}
                onChange={(e) => {
                  setMaxSelect(e.target.value ? Number(e.target.value) : undefined)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 自定义配置 */}
      <Card>
        <CardHeader>
          <CardTitle>自定义配置</CardTitle>
          <CardDescription>自定义对话框的文本内容</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-title">自定义标题</Label>
              <Input
                id="custom-title"
                placeholder="输入自定义标题"
                value={customTitle}
                onChange={(e) => { setCustomTitle(e.target.value) }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-placeholder">搜索占位符</Label>
              <Input
                id="search-placeholder"
                placeholder="输入搜索占位符"
                value={searchPlaceholder}
                onChange={(e) => { setSearchPlaceholder(e.target.value) }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-description">自定义描述</Label>
            <Textarea
              id="custom-description"
              placeholder="输入自定义描述"
              value={customDescription}
              onChange={(e) => { setCustomDescription(e.target.value) }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 测试按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>基础测试功能</CardTitle>
          <CardDescription>点击按钮测试不同的对话框配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => { void handleBasicTest() }}>
              <PlusIcon />
              基础测试
            </Button>

            <Button variant="outline" onClick={() => { void handleCustomTest() }}>
              <PlusIcon />
              自定义配置测试
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 边界测试 */}
      <Card>
        <CardHeader>
          <CardTitle>边界测试</CardTitle>
          <CardDescription>测试组件在极端情况下的表现和稳定性</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { void handleMaxSelectTest() }}
            >
              最大选择数量 (5)
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => { void handleMinSelectTest() }}
            >
              最小选择数量 (1)
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => { void handleSpecialCharTest() }}
            >
              特殊字符 & 长文本
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => { void handleEmptyConfigTest() }}
            >
              空配置测试
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>测试说明：</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>最大选择数量：</strong>
                测试最大选择数量限制的处理（最多 5 个）
              </li>
              <li>
                <strong>最小选择数量：</strong>
                测试最小选择数量限制的处理
              </li>
              <li>
                <strong>特殊字符 & 长文本：</strong>
                测试特殊字符、HTML 标签、Emoji 和超长文本的处理
              </li>
              <li>
                <strong>空配置测试：</strong>
                测试空字符串配置的默认行为
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 选择结果 */}
      {selectedMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>选择结果</CardTitle>
            <CardDescription>当前选中的成员列表</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{member.name ?? '未设置姓名'}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 对话框组件 */}
      <MemberSelectDialog />
    </div>
  )
}
