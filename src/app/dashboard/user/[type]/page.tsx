"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiURL } from "@/utils/constants/constants"

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  userName: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const apiEndpoints: { [key: string]: string } = {
  "1": "api/hiwas",
  "2": "api/meseretawi",
  "3": "api/wana",
  "4": "api/wereda",
}

interface EditUserDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedUser: User) => void
}

function EditUserDialog({ user, isOpen, onClose, onSave }: EditUserDialogProps) {
  const [editedUser, setEditedUser] = useState<User | null>(null)

  useEffect(() => {
    setEditedUser(user)
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [e.target.name]: e.target.value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [name]: value })
    }
  }

  const handleSave = () => {
    if (editedUser) {
      onSave(editedUser)
    }
    onClose()
  }

  if (!editedUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ተጠቃሚዉን ያስተካክሉ</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
            የመጀመሪያ ስም
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={editedUser.firstName}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
            የበአባት ስም
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={editedUser.lastName}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
            ኢሜል
            </Label>
            <Input
              id="email"
              name="email"
              value={editedUser.email}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
            ስልክ
            </Label>
            <Input
              id="phone"
              name="phone"
              value={editedUser.phone}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
            ሚና
            </Label>
            <Select value={editedUser.role} onValueChange={(value) => handleSelectChange("role", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Hiwas">የብልጽግና ቤተሰብ</SelectItem>
                <SelectItem value="Meseretawi Derejit">የብልጽግና ህብረት</SelectItem>
                <SelectItem value="Wana">የፖለቲካ ዘርፍ ሀላፊ</SelectItem>
                <SelectItem value="Wereda">ወረዳ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
            ሁኔታ
            </Label>
            <Select
              value={editedUser.isActive ? "active" : "inactive"}
              onValueChange={(value) => handleSelectChange("isActive", value === "active" ? "true" : "false")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
          ለውጡን ያስቀምጡ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const UserPage = () => {
  const { type } = useParams() as { type: string }
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<keyof User | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchField, setSearchField] = useState<keyof User>("firstName")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const endpoint = apiEndpoints[type] || "api/hiwas"
      const response = await axios.get<User[]>(`${apiURL}${endpoint}`)
      setUsers(response.data)
      setFilteredUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let result = users

    if (searchTerm) {
      result = result.filter((user) => user[searchField].toString().toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (roleFilter) {
      result = result.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== null) {
      result = result.filter((user) => user.isActive === statusFilter)
    }

    if (sortColumn) {
      result = result.sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    setFilteredUsers(result)
    setCurrentPage(1)
  }, [users, searchTerm, sortColumn, sortDirection, roleFilter, statusFilter, searchField])

  const handleSort = (column: keyof User) => {
    setSortColumn(column)
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter(null)
    setStatusFilter(null)
    setSortColumn(null)
    setSortDirection("asc")
    setFilteredUsers(users)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = async (updatedUser: User) => {
    try {
      const endpoint = apiEndpoints[type] || "api/hiwas"
      await axios.put(`${apiURL}${endpoint}/${updatedUser.id}`, updatedUser)
      const updatedUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      setUsers(updatedUsers)
      setFilteredUsers(updatedUsers)
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteAlertOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        const endpoint = apiEndpoints[type] || "api/hiwas"
        await axios.delete(`${apiURL}${endpoint}/${userToDelete.id}`)
        const updatedUsers = users.filter((user) => user.id !== userToDelete.id)
        setUsers(updatedUsers)
        setFilteredUsers(updatedUsers)
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
    setIsDeleteAlertOpen(false)
  }

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const displayedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">የተጠቃሚ አስተዳደርt</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">አጠቃላይ ተጠቃሚዎች</CardTitle>
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
            <div className="text-2xl font-bold">{users.filter((user) => user.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((user) => !user.isActive).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-grow space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
          ተጠቃሚዎችን ይፈልጉ
          </label>
          <div className="flex gap-2">
            <Select value={searchField} onValueChange={(value) => setSearchField(value as keyof User)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="firstName">የመጀመሪያ ስም</SelectItem>
                <SelectItem value="lastName">የበአባት ስም</SelectItem>
                <SelectItem value="email">ኢሜል</SelectItem>
                <SelectItem value="phone">ስልክ</SelectItem>
                <SelectItem value="role">ሚና </SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-grow">
              <Input
                id="search"
                type="text"
                placeholder={`Search by ${searchField}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Select onValueChange={(value) => setStatusFilter(value === "active")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={clearFilters}>
            <RefreshCw className="mr-2 h-4 w-4" /> አፅዳ
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("firstName")} className="cursor-pointer">
              የመጀመሪያ ስም {sortColumn === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("lastName")} className="cursor-pointer">
              የአባት ስም  {sortColumn === "lastName" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
              ኢሜል {sortColumn === "email" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("phone")} className="cursor-pointer">
              ስልክ {sortColumn === "phone" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("role")} className="cursor-pointer">
              ሚና {sortColumn === "role" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("isActive")} className="cursor-pointer">
              ሁኔታ {sortColumn === "isActive" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                በመካሄድ ላይ...
                </TableCell>
              </TableRow>
            ) : displayedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                ምንም ተጠቃሚ አልተገኘም።
                </TableCell>
              </TableRow>
            ) : (
              displayedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                    አስተካክል
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)}>
                    ሰርዝ
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
         ቀዳሚ
        </Button>
        <span>
        ገጽ {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          ቀጥሎ
        </Button>
      </div>

      <EditUserDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveUser}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ተጠቃሚዉን መሰረዝ እደፈለጉ ያረጋግጠዋል?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove their data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ተዉ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>ሰርዝ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default UserPage

