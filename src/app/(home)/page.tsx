import { redirect } from 'next/navigation'

export default function HomePage() {
  // 当用户访问根路径时，自动重定向到文档页面
  redirect('/docs')
}
