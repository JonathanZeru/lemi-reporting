import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "@/types/types"

interface UserStatsProps {
  users: User[]
}

export function UserStats({ users }: UserStatsProps) {
  const activeUsers = users.filter((user) => user.isActive).length
  const inactiveUsers = users.length - activeUsers

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveUsers}</div>
        </CardContent>
      </Card>
    </div>
  )
}

