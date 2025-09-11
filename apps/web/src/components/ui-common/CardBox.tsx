import { cn } from '~/lib/utils'

function CardBox({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-muted text-card-foreground flex flex-col gap-1 rounded-xl p-1',
        className,
      )}
      data-slot="card"
      {...props}
    />
  )
}

function CardBoxHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:py-4',
        className,
      )}
      data-slot="card-header"
      {...props}
    />
  )
}

function CardBoxTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('leading-none font-semibold', className)}
      data-slot="card-title"
      {...props}
    />
  )
}

function CardBoxDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-muted-foreground text-sm', className)}
      data-slot="card-description"
      {...props}
    />
  )
}

function CardBoxAction({ className, ...props }: React.ComponentProps<'div'>) {
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

function CardBoxContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('p-6 bg-card rounded-lg border border-border shadow-xs', className)}
      data-slot="card-content"
      {...props}
    />
  )
}

function CardBoxFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      data-slot="card-footer"
      {...props}
    />
  )
}

export {
  CardBox,
  CardBoxAction,
  CardBoxContent,
  CardBoxDescription,
  CardBoxFooter,
  CardBoxHeader,
  CardBoxTitle,
}
