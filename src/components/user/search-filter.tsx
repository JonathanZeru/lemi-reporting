import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw } from "lucide-react"
import { User } from "@/types/types"

interface SearchFilterProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchField: keyof User
  setSearchField: (field: keyof User) => void
  setStatusFilter: (status: boolean | null) => void
  clearFilters: () => void
}

export function SearchFilter({
  searchTerm,
  setSearchTerm,
  searchField,
  setSearchField,
  setStatusFilter,
  clearFilters,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-grow space-y-2">
        <label htmlFor="search" className="text-sm font-medium">
          Search Users
        </label>
        <div className="flex gap-2">
          <Select value={searchField} onValueChange={(value) => setSearchField(value as keyof User)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="firstName">First Name</SelectItem>
              <SelectItem value="lastName">Last Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="role">Role</SelectItem>
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
          <RefreshCw className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  )
}

