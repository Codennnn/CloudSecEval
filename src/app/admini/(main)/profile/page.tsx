'use client'

import { useEffect, useState } from 'react'

import { CalendarIcon, EditIcon, MailIcon, SaveIcon, UserIcon } from 'lucide-react'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'

import { PageHeader } from '~admin/components/PageHeader'
import { useProfile } from '~admin/hooks/api/useAuth'
import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'
import { useUser } from '~admin/stores/useUserStore'

/**
 * 用户个人资料页面
 * 显示和编辑用户的基本信息
 */
export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: user, isLoading, error } = useProfile()

  const storeUser = useUser()

  // 设置页面标题
  useEffect(() => {
    document.title = generatePageTitle(AdminRoutes.Profile)
  }, [])

  // 本地编辑状态，用于表单编辑
  const [userProfile, setUserProfile] = useState({
    name: storeUser?.name ?? '',
    email: storeUser?.email ?? '',
    bio: '',
    joinDate: '',
    role: '管理员',
    avatarUrl: storeUser?.avatarUrl,
  })

  /**
   * 当用户数据加载完成时，更新本地状态
   */
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name ?? '',
        email: user.email || '',
        bio: '', // API 中没有 bio 字段，保持为空
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '',
        role: '管理员', // API 中没有 role 字段，使用默认值
        avatarUrl: user.avatarUrl ?? '',
      })
    }
  }, [user])

  const handleSave = () => {
    // TODO: 实现保存逻辑
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // TODO: 重置表单数据
  }

  /**
   * 处理输入变化
   */
  const handleInputChange = (field: string, value: string) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="size-full flex flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">加载用户信息中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="size-full flex flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">加载用户信息失败</p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ScrollGradientContainer>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-admin-content-md py-admin-content-md md:gap-admin-content md:py-admin-content">
          <div className="px-admin-content-md lg:px-admin-content">
            <PageHeader
              actions={
                isEditing
                  ? (
                      <>
                        <Button variant="outline" onClick={handleCancel}>
                          取消
                        </Button>
                        <Button
                          onClick={() => {
                            handleSave()
                          }}
                        >
                          <SaveIcon className="size-4" />
                          保存
                        </Button>
                      </>
                    )
                  : (
                      <Button onClick={() => { setIsEditing(true) }}>
                        <EditIcon className="size-4" />
                        编辑资料
                      </Button>
                    )
              }
              className="mb-6"
              description="管理您的账户信息和个人设置"
              title="个人资料"
            />

            <div className="grid gap-6 md:grid-cols-3">
              {/* 头像和基本信息卡片 */}
              <Card className="md:col-span-1">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="size-24">
                      <AvatarImage alt={userProfile.name} src={userProfile.avatarUrl} />
                      <AvatarFallback className="text-2xl">
                        <UserIcon className="size-12" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{userProfile.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{userProfile.role}</Badge>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MailIcon className="size-4" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="size-4" />
                    <span>加入于 {userProfile.joinDate}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 详细信息编辑卡片 */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>详细信息</CardTitle>
                  <CardDescription>
                    {isEditing ? '编辑您的个人信息' : '查看您的个人信息'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      {isEditing
                        ? (
                            <Input
                              id="name"
                              placeholder="请输入姓名"
                              value={userProfile.name}
                              onChange={(e) => { handleInputChange('name', e.target.value) }}
                            />
                          )
                        : (
                            <div className="px-3 py-2 bg-muted rounded-md">{userProfile.name}</div>
                          )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      {isEditing
                        ? (
                            <Input
                              id="email"
                              placeholder="请输入邮箱"
                              type="email"
                              value={userProfile.email}
                              onChange={(e) => { handleInputChange('email', e.target.value) }}
                            />
                          )
                        : (
                            <div className="px-3 py-2 bg-muted rounded-md">{userProfile.email}</div>
                          )}
                    </div>

                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="bio">个人简介</Label>
                    {isEditing
                      ? (
                          <Textarea
                            id="bio"
                            placeholder="请输入个人简介"
                            rows={4}
                            value={userProfile.bio}
                            onChange={(e) => { handleInputChange('bio', e.target.value) }}
                          />
                        )
                      : (
                          <div className="px-3 py-2 bg-muted rounded-md min-h-[100px]">
                            {userProfile.bio}
                          </div>
                        )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ScrollGradientContainer>
  )
}
