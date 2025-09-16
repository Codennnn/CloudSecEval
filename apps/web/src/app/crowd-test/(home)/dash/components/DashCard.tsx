import { cn } from '~/lib/utils'

import { DashDecoratorImg } from './DashDecoratorImg'

interface DashCardProps extends React.PropsWithChildren<React.ComponentProps<'div'>> {
  title?: string
  contentClassName?: string
}

export function DashCard(props: DashCardProps) {
  const { title, children, contentClassName, ...rest } = props

  return (
    <div
      {...rest}
      className={cn('flex flex-col overflow-hidden', rest.className)}
    >
      <div className="relative">
        <DashDecoratorImg
          className="absolute left-0 top-0 h-full"
          src="/assets/crowd-test/dash-card-header-bg.png"
        />

        <div className="pl-10 pb-2 font-bold text-lg relative z-10">
          {title}
        </div>

        <DashDecoratorImg
          className="absolute inset-0 top-[36px]"
          src="/assets/crowd-test/dash-card-content-bg.png"
        />
      </div>

      <div className={cn('relative z-10 flex-1 p-4 min-h-0 overflow-y-auto', contentClassName)}>
        {children}
      </div>
    </div>
  )
}
