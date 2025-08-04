import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'

/**
 * 登录表单组件
 * 提供用户登录功能的表单界面
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>登录您的账户</CardTitle>
          <CardDescription>
            请输入您的邮箱和密码来登录账户
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">邮箱地址</Label>
                <Input
                  required
                  id="email"
                  placeholder="请输入您的邮箱地址"
                  type="email"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">密码</Label>
                <Input
                  required
                  id="password"
                  placeholder="请输入您的密码"
                  type="password"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full" type="submit">
                  立即登录
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
