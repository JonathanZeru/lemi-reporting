'use client'
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Loader, ArrowUpDown, CalendarIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { apiURL } from "@/utils/constants/constants"

// Type definitions (unchanged)
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

interface Report {
  id: number
  name: string
  description: string
  reportedBy: string
  reportedByHiwasId: number | null
  reportedByMDId: number | null
  reportedByWeredaId: number | null
  scheduleId: number
  reportVideo: string
  audio: string
  createdAt: string
  updatedAt: string
}

interface Schedule {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  status: string
  createdByRole: string
  createdById: number
  createdByHiwasId: number | null
  createdByMDId: number | null
  createdByWeredaId: number | null
  createdByWanaId: number | null
  createdAt: string
  updatedAt: string
}

interface WanaNotificationProps {
  id: number
  message: string
  recipientId: number | null
  recipientType: string
  scheduleId: number | null
  reportId: number | null
  isRead: boolean
  createdAt: string
  updatedAt: string
  hiwasId: number | null
  meseretawiDirijetId: number | null
  weredaId: number | null
  hiwas: User | null
  wereda: User | null
  meseretawiDirijet: User | null
  report: Report[] | null
  schedule: Schedule | null
}

// NotificationTables component
interface NotificationTablesProps {
  notifications: WanaNotificationProps[]
}

const Notifications: React.FC<NotificationTablesProps> = ({ notifications }) => {
  const navigate = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedRecipientType, setSelectedRecipientType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const filteredAndSortedNotifications = useMemo(() => {
    return notifications
      .filter((notification) => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          notification.message.toLowerCase().includes(searchLower) ||
          (notification.report && notification.report[0]?.name?.toLowerCase().includes(searchLower)) ||
          (notification.report && notification.report[0]?.description?.toLowerCase().includes(searchLower)) ||
          (notification.schedule?.title?.toLowerCase().includes(searchLower) ?? false) ||
          (notification.schedule?.description?.toLowerCase().includes(searchLower) ?? false)

        const notificationDate = new Date(notification.createdAt)
        const matchesDateRange =
          (!startDate || notificationDate >= startDate) && (!endDate || notificationDate <= endDate)

        const matchesRecipientType =
          selectedRecipientType === "all" || notification.recipientType === selectedRecipientType

        const matchesStatus = selectedStatus === "all" || notification.schedule?.status === selectedStatus

        return matchesSearch && matchesDateRange && matchesRecipientType && matchesStatus
      })
      .sort((a, b) => {
        let aValue, bValue
        switch (sortBy) {
          case "year":
            aValue = new Date(a.createdAt).getFullYear()
            bValue = new Date(b.createdAt).getFullYear()
            break
          case "month":
            aValue = new Date(a.createdAt).getMonth()
            bValue = new Date(b.createdAt).getMonth()
            break
          case "name":
            aValue = a.report?.[0]?.name ?? a.schedule?.title ?? ""
            bValue = b.report?.[0]?.name ?? b.schedule?.title ?? ""
            break
          case "recipientType":
            aValue = a.recipientType
            bValue = b.recipientType
            break
          case "status":
            aValue = a.schedule?.status ?? "N/A"
            bValue = b.schedule?.status ?? "N/A"
            break
          default:
            aValue = a.createdAt
            bValue = b.createdAt
        }
        return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
      })
  }, [notifications, searchTerm, sortBy, sortOrder, startDate, endDate, selectedRecipientType, selectedStatus])

  const groupedNotifications = useMemo(() => {
    if (sortBy === "month") {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      return filteredAndSortedNotifications.reduce(
        (acc, notification) => {
          const month = months[new Date(notification.createdAt).getMonth()]
          if (!acc[month]) {
            acc[month] = []
          }
          acc[month].push(notification)
          return acc
        },
        {} as Record<string, WanaNotificationProps[]>,
      )
    } else {
      return filteredAndSortedNotifications.reduce(
        (acc, notification) => {
          const type = notification.recipientType.includes("Hiwas")
            ? "Hiwas"
            : notification.recipientType === "MeseretawiDirijet"
              ? "MeseretawiDirijet"
              : notification.recipientType === "Wereda"
                ? "Wereda"
                : "Other"

          if (!acc[type]) {
            acc[type] = []
          }
          acc[type].push(notification)
          return acc
        },
        {} as Record<string, WanaNotificationProps[]>,
      )
    }
  }, [filteredAndSortedNotifications, sortBy])

  const handleRowClick = (notification: WanaNotificationProps) => {
    if (notification.recipientType.includes("Hiwas")) {
      if (notification.report === null) {
        navigate.push(`/dashboard/task-detail/${notification.id}`)
      } else {
        navigate.push(`/dashboard/report-detail/${notification.schedule ? notification.schedule.id : 0}`)
      }
    } else if (notification.recipientType === "MeseretawiDirijet") {
      if (notification.report === null) {
        navigate.push(`/dashboard/meseretawi-task-detail/${notification.id}`)
      } else {
        navigate.push(`/dashboard/report-detail/${notification.schedule ? notification.schedule.id : 0}`)
      }
    } else if (notification.recipientType === "Wereda") {
      if (notification.report?.length === 0) {
        navigate.push(`/dashboard/wereda-task-detail/${notification.id}`)
      } else {
        navigate.push(`/dashboard/wereda-report-detail/${notification.schedule ? notification.schedule.id : 0}`)
      }
    }
  }

  const renderTable = (notifications: WanaNotificationProps[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Is Read</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.map((notification) => (
          <TableRow
            key={notification.id}
            onClick={() => handleRowClick(notification)}
            className="cursor-pointer hover:bg-gray-100"
          >
            <TableCell>{notification.id}</TableCell>
            <TableCell>{notification.message}</TableCell>
            <TableCell>{new Date(notification.createdAt).toLocaleString()}</TableCell>
            <TableCell>{notification.isRead ? "Yes" : "No"}</TableCell>
            <TableCell>
              {notification.schedule ? (
                <Badge defaultValue={notification.schedule.status === "Completed" ? "success" : "secondary"}>
                  {notification.schedule.status}
                </Badge>
              ) : (
                "N/A"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[240px] justify-start text-left font-normal", !startDate && "text-white")}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-white" />
              {startDate ? format(startDate, "PPP") : <span>Start date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[240px] justify-start text-left font-normal", !endDate && "text-white")}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-white" />
              {endDate ? format(endDate, "PPP") : <span>End date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
          </PopoverContent>
        </Popover>
        <Select value={selectedRecipientType} onValueChange={setSelectedRecipientType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Recipient Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Hiwas">Hiwas</SelectItem>
            <SelectItem value="MeseretawiDirijet">MeseretawiDirijet</SelectItem>
            <SelectItem value="Wereda">Wereda</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="Under Meseretawi Review">Under Meseretawi Review</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date</SelectItem>
            <SelectItem value="year">Year</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="recipientType">Recipient Type</SelectItem>
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
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(groupedNotifications).map(([type, notifications]) => (
          <AccordionItem key={type} value={type}>
            <AccordionTrigger>
              {type} {sortBy === "month" ? "" : "Notifications"} ({notifications.length})
            </AccordionTrigger>
            <AccordionContent>{renderTable(notifications)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

// WanaNotification component
const WanaNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<WanaNotificationProps[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get<WanaNotificationProps[]>(`${apiURL}api/wana/notification`)
        setNotifications(response.data)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <Notifications notifications={notifications} />
    </div>
  )
}

export default WanaNotification

