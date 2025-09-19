import { UserAvatar } from '~/components/UserAvatar'

interface MemberInfoProps {
  avatarUrl?: string
  name?: string
  email?: string
}

export function MemberInfo(props: MemberInfoProps) {
  const { avatarUrl, name, email } = props

  return (
    <div className="flex items-center gap-2">
      <UserAvatar avatarUrl={avatarUrl} />

      <div className="flex flex-col gap-0.5">
        <div className="font-medium">
          {name ?? '-'}
        </div>
        <div className="text-xs text-muted-foreground">
          {email}
        </div>
      </div>
    </div>
  )
}
