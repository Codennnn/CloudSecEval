import { Badge } from '~/components/ui/badge'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'

import type { RoleDetailResponseDto } from '~api/types.gen'

interface RolePermissionsInfoProps {
  role: RoleDetailResponseDto
}

/**
 * 角色权限信息组件
 * 展示角色的权限列表，按资源分组显示
 */
export function RolePermissionsInfo({ role }: RolePermissionsInfoProps) {
  const permissions = role.rolePermissions

  if (permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          该角色尚未分配任何权限
        </p>
      </div>
    )
  }

  // 按资源分组权限
  const groupedPermissions = permissions.reduce<Record<string, typeof permissions[0]['permission'][] | undefined>>((acc, rolePermission) => {
    const { permission } = rolePermission
    const resource = permission.resource

    acc[resource] ??= []
    acc[resource].push(permission)

    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Label>当前权限</Label>

        <Badge className="font-medium" variant="secondary">
          共 {permissions.length} 个权限
        </Badge>
      </div>

      <Separator className="my-2.5" />

      {/* 权限分组列表 */}
      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
          <div key={resource} className="group">
            {/* 资源组标题 */}
            <Label className="text-base font-semibold text-foreground mb-2">{resource}</Label>

            {/* 权限卡片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {resourcePermissions?.map((permission) => (
                <div
                  key={permission.id}
                  className="bg-card border border-border rounded-md p-2 overflow-hidden"
                >
                  {permission.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 truncate">
                      {permission.description}
                    </p>
                  )}

                  <div className="text-xs font-mono text-muted-foreground truncate">
                    {permission.slug}
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
