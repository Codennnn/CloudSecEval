import { cn } from '~/lib/utils'

/**
 * 页面标题组件的属性接口
 */
interface PageHeaderProps {
  /** 页面主标题 */
  title: string
  /** 页面描述文字 */
  description?: string
  /** 标题右侧的操作按钮或内容 */
  actions?: React.ReactNode
  /** 自定义样式类名 */
  className?: string
}

/**
 * 通用页面标题组件
 * 用于管理后台页面的标题区域，包含标题、描述和操作按钮
 *
 * @param props - 组件属性
 * @returns 页面标题组件
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>

        {description && (
          <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
