import { cn } from '~/lib/utils'

export function DashDecoratorImg(props: React.PropsWithChildren<React.ComponentProps<'img'>>) {
  const { className, ...rest } = props

  return (
    <img
      alt="dash decorator img"
      {...rest}
      className={cn('pointer-events-none select-none', className)}
    />
  )
}
