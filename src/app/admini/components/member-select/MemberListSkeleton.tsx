export function MemberListSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md border hover:bg-muted/50">
      <div className="size-4 rounded-full border flex items-center justify-center">
        <div className="size-3 bg-muted rounded-full" />
      </div>

      <div className="flex flex-col text-sm">
        <div className="h-4 w-full bg-muted rounded-md" />
        <div className="h-4 w-full bg-muted rounded-md" />
      </div>
    </div>
  )
}

export function MemberListSkeletons() {
  return (
    <div className="flex flex-col gap-list-item">
      {
        Array.from({ length: 5 }).map((_, idx) => {
          return (
            <MemberListSkeleton key={idx} />
          )
        })
      }
    </div>
  )
}
