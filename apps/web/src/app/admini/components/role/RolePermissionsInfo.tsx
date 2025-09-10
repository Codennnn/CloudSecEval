import { Badge } from '~/components/ui/badge'
import { Label } from '~/components/ui/label'
import { formatDate } from '~/utils/date'

import type { RoleDetailResponseDto } from '~api/types.gen'

export function RolePermissionsInfo({ role }: { role: RoleDetailResponseDto }) {
  const permissions = role.rolePermissions

  if (permissions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-muted-foreground">
          该角色暂无权限
        </div>
      </div>
    )
  }

  const groupedPermissions = permissions.reduce<Record<string, typeof permissions[0]['permission'][] | undefined>>((acc, rolePermission) => {
    const { permission } = rolePermission
    const resource = permission.resource

    acc[resource] ??= []
    acc[resource].push(permission)

    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">权限列表</Label>
        <Badge variant="secondary">
          共 {permissions.length} 个权限
        </Badge>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
          <div key={resource} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Label className="font-medium">{resource}</Label>
              <Badge className="text-xs" variant="outline">
                {resourcePermissions?.length} 个权限
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {resourcePermissions?.map((permission) => (
                <div
                  key={permission.id}
                  className="border border-gray-200 rounded-md p-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      className="text-xs"
                      variant={permission.system ? 'default' : 'secondary'}
                    >
                      {permission.action}
                    </Badge>
                    {permission.system && (
                      <Badge className="text-xs" variant="destructive">
                        系统
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs">
                      <Label className="text-xs">标识符:</Label>
                      <span className="ml-1 font-mono">{permission.slug}</span>
                    </div>

                    {permission.description && (
                      <div className="text-xs">
                        <Label className="text-xs">描述:</Label>
                        <span className="ml-1">{permission.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
