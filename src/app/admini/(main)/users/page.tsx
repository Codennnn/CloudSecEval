import { UsersSide } from './UsersSide'
import { UsersTable } from './UsersTable'

export default function UserPage() {
  return (
    <div className="flex gap-4">
      <UsersSide />
      <UsersTable />
    </div>
  )
}
