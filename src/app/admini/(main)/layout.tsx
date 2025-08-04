/**
 * 后台管理系统专用布局组件
 * 提供独立的样式和导航结构
 */
export default function AdminLayout(props: React.PropsWithChildren) {
  const { children } = props

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <AdminSidebar /> */}

      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
