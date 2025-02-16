import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User } from "@/types/types"

interface UserTableProps {
  users: User[]
  sortColumn: keyof User | null
  sortDirection: "asc" | "desc"
  handleSort: (column: keyof User) => void
  handleEditUser: (user: User) => void
  handleDeleteUser: (user: User) => void
  isLoading: boolean
}

export function UserTable({
  users,
  sortColumn,
  sortDirection,
  handleSort,
  handleEditUser,
  handleDeleteUser,
  isLoading,
}: UserTableProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("firstName")} className="cursor-pointer">
              First Name {sortColumn === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead onClick={() => handleSort("lastName")} className="cursor-pointer">
              Last Name {sortColumn === "lastName" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
              Email {sortColumn === "email" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Password</TableHead>
            <TableHead onClick={() => handleSort("phone")} className="cursor-pointer">
              Phone {sortColumn === "phone" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead onClick={() => handleSort("role")} className="cursor-pointer">
              Role {sortColumn === "role" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead onClick={() => handleSort("isActive")} className="cursor-pointer">
              Status {sortColumn === "isActive" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.password ? <span className="font-mono">{user.password.substring(0, 10)}...</span> : "N/A"}
                </TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

