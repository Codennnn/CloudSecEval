import { Badge } from '~/components/ui/badge'
import { Label } from '~/components/ui/label'
import { formatDate } from '~/utils/date'

import type { RoleDetailResponseDto } from '~api/types.gen'

export function RoleBasicInfo({ role }: { role: RoleDetailResponseDto }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label>角色名称</Label>
          <p className="mt-1 text-sm">{role.name}</p>
        </div>

        <div>
          <Label>角色标识符</Label>
          <p className="mt-1 text-sm font-mono">{role.slug}</p>
        </div>

        <div>
          <Label>描述</Label>
          <p className="mt-1 text-sm">
            {role.description ?? '暂无描述'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>角色类型</Label>
          <div className="mt-1">
            <Badge variant={role.system ? 'secondary' : 'default'}>
              {role.system ? '系统角色' : '自定义角色'}
            </Badge>
          </div>
        </div>

        <div>
          <Label>状态</Label>
          <div className="mt-1">
            <Badge variant={role.isActive ? 'default' : 'destructive'}>
              {role.isActive ? '启用' : '禁用'}
            </Badge>
          </div>
        </div>

        <div>
          <Label>创建时间</Label>
          <p className="mt-1 text-sm">
            {formatDate(role.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
