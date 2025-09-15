import { cn } from '~/lib/utils'

import { DashDecoratorImg } from './DashDecoratorImg'

interface DashCardProps extends React.PropsWithChildren<React.ComponentProps<'div'>> {
  title?: string
}

export function DashCard(props: DashCardProps) {
  const { className, title, children, ...rest } = props

  return (
    <div
      {...rest}
      className={cn(className)}
    >
      <div className="relative">
        <DashDecoratorImg
          className="absolute left-0 top-0 h-full"
          src="/assets/crowd-test/dash-card-header-bg.png"
        />

        <div className="pl-10 pb-2 font-bold text-lg relative z-10">
          {title}
        </div>
      </div>

      <div className="relative z-10 p-4">
        {children}

        <DashDecoratorImg
          className="absolute inset-0"
          src="/assets/crowd-test/dash-card-content-bg.png"
        />
      </div>
    </div>
  )
}
