"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { UserStats } from "./user-stats"
import { SearchFilter } from "./search-filter"
import { UserTable } from "./user-table"
import { Pagination } from "./pagination"
import { apiURL } from "@/utils/constants/constants"
import { apiEndpoints, User } from "@/types/types"
import { DeleteUserAlert } from "./delete-user"
import { EditUserDialog } from "./edit-user"
import { toast } from "../ui/use-toast"


interface UserManagementPageProps {
  type: string
}

export function UserManagementPage({ type }: UserManagementPageProps) {
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
      const dataToSend = {
        ...updatedUser,
        type: type,
        isActive: updatedUser.isActive
      }
      // Only include password if it's not empty
      if (updatedUser.password) {
        dataToSend.password = updatedUser.password
      }
      const response = await axios.put(`${apiURL}api/auth/update`, dataToSend)
      if (response.status == 200) {
        if (response.data.user) {
          toast({
            title: "Success",
            description: `User updated successfully.`,
          })
        }
      } else {
        toast({
          title: "Failed",
          description: `Failed to update user.`,
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: `An error occurred while updating the user.`,
        variant: "destructive",
      })
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
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserStats users={users} />
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchField={searchField}
        setSearchField={setSearchField}
        setStatusFilter={setStatusFilter}
        clearFilters={clearFilters}
      />
      <UserTable
        users={displayedUsers}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        handleSort={handleSort}
        handleEditUser={handleEditUser}
        handleDeleteUser={handleDeleteUser}
        isLoading={isLoading}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      <EditUserDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveUser}
      />
      <DeleteUserAlert
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirm={confirmDeleteUser}
        userId={typeof userToDelete?.id === "number" ? userToDelete.id : 0}
        userType={type}
      />
    </div>
  )
}



