import { Badge } from '~/components/ui/badge'
import { FormItem } from '~/components/ui/form'
import { Label } from '~/components/ui/label'
import { formatDate } from '~/utils/date'

import type { RoleDetailResponseDto } from '~api/types.gen'

export function RoleBasicInfo({ role }: { role: RoleDetailResponseDto }) {
  return (
    <div className="grid grid-cols-1 @md/card-content:grid-cols-2 gap-6">
      <FormItem>
        <Label>角色名称</Label>
        <p className="text-sm">{role.name}</p>
      </FormItem>

      <div>
        <Label>角色标识符</Label>
        <p className="mt-1 text-sm font-mono">{role.slug}</p>
      </div>

      <FormItem>
        <Label>描述</Label>
        <p className="text-sm">
          {role.description ?? '暂无描述'}
        </p>
      </FormItem>

      <FormItem>
        <Label>角色类型</Label>
        <Badge variant={role.system ? 'secondary' : 'default'}>
          {role.system ? '系统角色' : '自定义角色'}
        </Badge>
      </FormItem>

      <FormItem>
        <Label>状态</Label>
        <Badge variant={role.isActive ? 'secondary' : 'destructive'}>
          {role.isActive ? '启用' : '禁用'}
        </Badge>
      </FormItem>

      <FormItem>
        <Label>创建时间</Label>
        <p className="text-sm">
          {formatDate(role.createdAt)}
        </p>
      </FormItem>
    </div>
  )
}
