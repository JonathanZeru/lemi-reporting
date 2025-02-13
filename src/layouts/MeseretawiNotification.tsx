"use client"

import { useState, useMemo } from "react"
import type { MeseretawiDirijetNotification } from "@/types/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

const MeseretawiNotification = ({
  myMeseretawiNotifications,
}: { myMeseretawiNotifications: MeseretawiDirijetNotification[] }) => {
  const navigate = useRouter()

  // New state for search and sort
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Memoized function for filtered and sorted notifications
  const filteredAndSortedNotifications = useMemo(() => {
    return myMeseretawiNotifications
      .filter((notification) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          (notification.message?.toLowerCase().includes(searchLower) ?? false) ||
          (notification.hiwas?.firstName.toLowerCase().includes(searchLower) ?? false) ||
          (notification.hiwas?.lastName.toLowerCase().includes(searchLower) ?? false) ||
          (notification.hiwas?.email.toLowerCase().includes(searchLower) ?? false) ||
          (notification.report?.name?.toLowerCase().includes(searchLower) ?? false) ||
          (notification.schedule?.title?.toLowerCase().includes(searchLower) ?? false)
        )
      })
      .sort((a, b) => {
        let aValue, bValue
        switch (sortBy) {
          case "message":
            aValue = a.message
            bValue = b.message
            break
          case "hiwasName":
            aValue = `${a.hiwas?.firstName ?? ""} ${a.hiwas?.lastName ?? ""}`
            bValue = `${b.hiwas?.firstName ?? ""} ${b.hiwas?.lastName ?? ""}`
            break
          case "reportName":
            aValue = a.report?.name ?? ""
            bValue = b.report?.name ?? ""
            break
          case "scheduleTitle":
            aValue = a.schedule?.title ?? ""
            bValue = b.schedule?.title ?? ""
            break
          case "status":
            aValue = a.schedule?.status ?? ""
            bValue = b.schedule?.status ?? ""
            break
          default:
            aValue = new Date(a.schedule?.startTime ?? 0).getTime()
            bValue = new Date(b.schedule?.startTime ?? 0).getTime()
        }
        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";
        return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
      })
  }, [myMeseretawiNotifications, searchTerm, sortBy, sortOrder])

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date</SelectItem>
            <SelectItem value="message">Message</SelectItem>
            <SelectItem value="hiwasName">Hiwas Name</SelectItem>
            <SelectItem value="reportName">Report Name</SelectItem>
            <SelectItem value="scheduleTitle">Schedule Title</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white"
          aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="sr-only">{sortOrder === "asc" ? "Sort descending" : "Sort ascending"}</span>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message</TableHead>
            <TableHead>Hiwas Name</TableHead>
            <TableHead>Hiwas Email</TableHead>
            <TableHead>Hiwas Phone</TableHead>
            <TableHead>Report Name</TableHead>
            <TableHead>Schedule Title</TableHead>
            <TableHead>Schedule Status</TableHead>
            <TableHead>Schedule Start Time</TableHead>
            <TableHead>Schedule End Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedNotifications.map((notification) => (
            <TableRow
              key={notification.id}
              className="hover:bg-slate-200"
              onClick={() => {
                if (notification.report == null) {
                  navigate.push(`/dashboard/meseretawi-task-detail/${notification.id}`)
                } else {
                  navigate.push(
                    `/dashboard/report-detail/${notification.schedule != null ? notification.schedule!.id : 0}`,
                  )
                }
              }}
            >
              <TableCell className="line-clamp-2">{notification.message}</TableCell>
              <TableCell>
                {notification.hiwas == null ? "" : `${notification.hiwas.firstName} ${notification.hiwas.lastName}`}
              </TableCell>
              <TableCell>{notification.hiwas == null ? "" : notification.hiwas.email}</TableCell>
              <TableCell>{notification.hiwas == null ? "" : notification.hiwas.phone}</TableCell>
              <TableCell>
                {notification.report == null
                  ? notification.schedule == null
                    ? ""
                    : notification.schedule.status
                  : notification.report.name}
              </TableCell>
              <TableCell>{notification.schedule == null ? "" : notification.schedule.title}</TableCell>
              <TableCell>{notification.schedule == null ? "" : notification.schedule.status}</TableCell>
              <TableCell>
                {format(new Date(notification.schedule?.startTime ?? "2025-01-18T10:59:31.728Z"), "PPpp")}
              </TableCell>
              <TableCell>
                {format(new Date(notification.schedule?.endTime ?? "2025-01-18T10:59:31.728Z"), "PPpp")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default MeseretawiNotification

