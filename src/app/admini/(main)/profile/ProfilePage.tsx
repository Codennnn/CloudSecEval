'use client'

import { useEffect, useState } from 'react'

import { CalendarIcon, EditIcon, MailIcon, SaveIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'
import { UserAvatar } from '~/components/UserAvatar'

import { PageHeader } from '~admin/components/PageHeader'
import { useUpdateProfile } from '~admin/hooks/api/useUpdateProfile'
import { useUser } from '~admin/stores/useUserStore'
import type { UpdateProfileDto } from '~api/types.gen'

/**
 * 用户个人资料页面
 * 显示和编辑用户的基本信息
 */
export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const storeUser = useUser()
  const updateProfileMutation = useUpdateProfile()

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
    const user = storeUser

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
  }, [storeUser])

  const handleSave = async () => {
    try {
      const updateData: UpdateProfileDto = {
        name: userProfile.name,
        email: userProfile.email,
      }

      await updateProfileMutation.mutateAsync({
        body: updateData,
      })

      toast.success('保存成功', {
        description: '你的个人资料已更新',
      })

      setIsEditing(false)
    }
    catch {
      toast.error('保存失败', {
        description: '更新个人资料时发生错误，请重试',
      })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)

    // 重置表单数据为原始用户数据
    if (storeUser) {
      setUserProfile({
        name: storeUser.name ?? '',
        email: storeUser.email || '',
        bio: '', // API 中没有 bio 字段，保持为空
        joinDate: storeUser.createdAt ? new Date(storeUser.createdAt).toLocaleDateString('zh-CN') : '',
        role: '管理员', // API 中没有 role 字段，使用默认值
        avatarUrl: storeUser.avatarUrl ?? '',
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
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
                          disabled={updateProfileMutation.isPending}
                          onClick={() => {
                            void handleSave()
                          }}
                        >
                          <SaveIcon />
                          {updateProfileMutation.isPending ? '保存中...' : '保存'}
                        </Button>
                      </>
                    )
                  : (
                      <Button onClick={() => { setIsEditing(true) }}>
                        <EditIcon />
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
                    <UserAvatar
                      avatarUrl={userProfile.avatarUrl}
                      name={userProfile.name}
                      size="2xl"
                    />
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
