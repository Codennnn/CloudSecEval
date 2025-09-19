import { PagePermissionGuard } from '~admin/components/PagePermissionGuard'

export default function CrowdTestLayout(props: React.PropsWithChildren) {
  const { children } = props

  return (
    <PagePermissionGuard>
      {children}
    </PagePermissionGuard>
  )
}
