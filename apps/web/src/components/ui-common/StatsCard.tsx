import { cn } from '~/lib/utils'

function StatsCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-1 rounded-xl border border-border shadow-xs',
        className,
      )}
      data-slot="card"
      {...props}
    />
  )
}

function StatsCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-card-box-header has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:py-card-box-header',
        className,
      )}
      data-slot="card-header"
      {...props}
    />
  )
}

function StatsCardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('leading-none font-semibold', className)}
      data-slot="card-title"
      {...props}
    />
  )
}

function StatsCardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-muted-foreground text-sm', className)}
      data-slot="card-description"
      {...props}
    />
  )
}

function StatsCardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      data-slot="card-action"
      {...props}
    />
  )
}

function StatsCardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('@container/card-content p-card-box-content rounded-lg', className)}
      data-slot="card-content"
      {...props}
    />
  )
}

function StatsCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center px-card-box-header [.border-t]:pt-card-box-header', className)}
      data-slot="card-footer"
      {...props}
    />
  )
}

export {
  StatsCardFooter as CardBoxFooter,
  StatsCard,
  StatsCardAction,
  StatsCardContent,
  StatsCardDescription,
  StatsCardHeader,
  StatsCardTitle,
}
