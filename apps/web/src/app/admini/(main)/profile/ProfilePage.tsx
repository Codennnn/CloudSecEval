'use client'

import { useEffect, useRef, useState } from 'react'

import { formatDate } from '@mono/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarIcon, EditIcon, HouseIcon, MailIcon, UploadIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'
import { CardBox, CardBoxContent, CardBoxDescription, CardBoxHeader, CardBoxTitle } from '~/components/ui-common/CardBox'
import { UserAvatar } from '~/components/UserAvatar'

import { ChangePasswordForm } from './components/ChangePasswordForm'

import { PageHeader } from '~admin/components/PageHeader'
import { useUpdateProfile } from '~admin/hooks/api/useUpdateProfile'
import { useUser, useUserStore } from '~admin/stores/useUserStore'
import { authControllerGetProfileQueryKey, usersControllerUpdateAvatarMutation } from '~api/@tanstack/react-query.gen'
import { formDataBodySerializer } from '~api/client'
import type { UpdateProfileDto } from '~api/types.gen'

/**
 * 用户个人资料页面
 * 显示和编辑用户的基本信息
 */
export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const storeUser = useUser()
  const updateProfileMutation = useUpdateProfile()
  const queryClient = useQueryClient()
  const { updateUser } = useUserStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 本地编辑状态，用于表单编辑
  const [userProfile, setUserProfile] = useState({
    name: storeUser?.name ?? '',
    email: storeUser?.email ?? '',
    bio: '',
    joinDate: '',
    role: '管理员',
    avatarUrl: storeUser?.avatarUrl,
  })

  const updateAvatarMutation = useMutation({
    ...usersControllerUpdateAvatarMutation(),
    onSuccess: async (res) => {
      const updated = res.data
      updateUser(updated)
      setUserProfile((prev) => ({
        ...prev,
        avatarUrl: updated.avatarUrl ?? prev.avatarUrl,
      }))
      await queryClient.invalidateQueries({ queryKey: authControllerGetProfileQueryKey() })
      toast.success('头像已更新')
    },
    onError: () => {
      toast.error('上传失败，请重试')
    },
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

  const handleOpenAvatarPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAvatarFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files
    const hasFile = Boolean(files && files.length > 0)

    if (hasFile) {
      const file = files![0]
      const isImage = file.type ? file.type.startsWith('image/') : true
      const withinLimit = file.size <= 2 * 1024 * 1024

      if (isImage) {
        if (withinLimit) {
          if (storeUser) {
            try {
              await updateAvatarMutation.mutateAsync({
                path: { id: storeUser.id },
                headers: { 'Content-Type': null },
                bodySerializer: formDataBodySerializer.bodySerializer,
                body: { file },
              })
            }
            catch {
              // 错误提示由 onError 统一处理
            }
          }
          else {
            toast.error('未获取到当前用户信息')
          }
        }
        else {
          toast.error('图片大小不能超过 2 MB')
        }
      }
      else {
        toast.error('请选择图片文件')
      }
    }

    // 重置 input，允许选择同一文件再次触发
    ev.target.value = ''
  }

  return (
    <ScrollGradientContainer>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-admin-content py-admin-content">
          <div className="px-admin-content">
            <PageHeader
              actions={
                isEditing
                  ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          取消
                        </Button>
                        <Button
                          disabled={updateProfileMutation.isPending}
                          size="sm"
                          onClick={() => {
                            void handleSave()
                          }}
                        >
                          {updateProfileMutation.isPending ? '保存中...' : '保存更改'}
                        </Button>
                      </>
                    )
                  : (
                      <Button
                        size="sm"
                        onClick={() => { setIsEditing(true) }}
                      >
                        <EditIcon />
                        编辑资料
                      </Button>
                    )
              }
              className="mb-6"
              description="管理你的账户信息和个人设置"
              title="个人资料"
            />

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <CardBox className="md:col-span-1">
                  <CardBoxHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <UserAvatar
                        avatarUrl={userProfile.avatarUrl}
                        name={userProfile.name}
                        size="2xl"
                      />
                    </div>
                    <CardBoxTitle className="text-xl">{userProfile.name}</CardBoxTitle>
                    <CardBoxDescription>
                      <Badge variant="secondary">{userProfile.role}</Badge>
                    </CardBoxDescription>
                  </CardBoxHeader>

                  {storeUser && (
                    <CardBoxContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <MailIcon className="size-4" />
                        <span>{storeUser.email}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <HouseIcon className="size-4" />
                        <span>{storeUser.organization.name} / {storeUser.department?.name ?? '无部门'}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <CalendarIcon className="size-4" />
                        <span>加入于 {formatDate(storeUser.createdAt)}</span>
                      </div>
                    </CardBoxContent>
                  )}
                </CardBox>
              </div>

              <CardBox className="md:col-span-2">
                <CardBoxHeader>
                  <CardBoxTitle>详细信息</CardBoxTitle>
                  <CardBoxDescription>
                    {isEditing ? '编辑您的个人信息' : '查看您的个人信息'}
                  </CardBoxDescription>
                </CardBoxHeader>

                <CardBoxContent className="space-y-6">
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

                  <div className="flex justify-end">
                    <input
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      type="file"
                      onChange={(ev) => { void handleAvatarFileChange(ev) }}
                    />
                    <Button
                      disabled={updateAvatarMutation.isPending}
                      size="sm"
                      variant="outline"
                      onClick={handleOpenAvatarPicker}
                    >
                      <UploadIcon />
                      {updateAvatarMutation.isPending ? '上传中...' : '更换头像'}
                    </Button>
                  </div>
                </CardBoxContent>
              </CardBox>
            </div>

            {/* 密码管理区域 */}
            <div className="mt-admin-content">
              <CardBox>
                <CardBoxHeader>
                  <CardBoxTitle className="flex items-center gap-2">
                    修改密码
                  </CardBoxTitle>

                  <CardBoxDescription>
                    为了账户安全，请定期更换密码
                  </CardBoxDescription>
                </CardBoxHeader>

                <CardBoxContent>
                  <ChangePasswordForm />
                </CardBoxContent>
              </CardBox>
            </div>
          </div>
        </div>
      </div>
    </ScrollGradientContainer>
  )
}
