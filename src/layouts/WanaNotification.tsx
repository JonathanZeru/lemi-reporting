"use client"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Loader, ArrowUpDown, CalendarIcon, Bell } from "lucide-react"
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// Type definitions
interface WanaNotificationProps {
  id: number
  message: string
  createdAt: string
  isRead: boolean
  schedule?: {
    status: string
  }
  recipientType?: string
  year?: number
  month?: number
  name?: string
  status?: string
}

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

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const messageMatch = notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      const dateMatch =
        (!startDate || new Date(notification.createdAt) >= startDate) &&
        (!endDate || new Date(notification.createdAt) <= endDate)
      const recipientTypeMatch = selectedRecipientType === "all" || notification.recipientType === selectedRecipientType
      const statusMatch = selectedStatus === "all" || notification.status === selectedStatus

      return messageMatch && dateMatch && recipientTypeMatch && statusMatch
    })
  }, [notifications, searchTerm, startDate, endDate, selectedRecipientType, selectedStatus])

  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort((a, b) => {
      const valueA = a[sortBy as keyof WanaNotificationProps] as string | number | undefined
      const valueB = b[sortBy as keyof WanaNotificationProps] as string | number | undefined

      if (valueA !== undefined && valueB !== undefined && valueA < valueB) {
        return sortOrder === "asc" ? -1 : 1
      }
      if (valueA !== undefined && valueB !== undefined && valueA > valueB) {
        return sortOrder === "asc" ? 1 : -1
      }
      return 0
    })
  }, [filteredNotifications, sortBy, sortOrder])

  const groupedNotifications = useMemo(() => {
    return sortedNotifications.reduce(
      (acc, notification) => {
        const type =
          sortBy === "month"
            ? new Date(notification.createdAt).toLocaleString("default", { month: "long" })
            : notification.recipientType || "ሌላ"
        acc[type] = acc[type] || []
        acc[type].push(notification)
        return acc
      },
      {} as { [key: string]: WanaNotificationProps[] },
    )
  }, [sortedNotifications, sortBy])

  const handleRowClick = (notification: WanaNotificationProps) => {
    // Implement your row click logic here
    console.log("Notification clicked:", notification)
    // Example: navigate to a detail page
    // navigate(`/notifications/${notification.id}`)
  }

  const renderTable = (notifications: WanaNotificationProps[]) => (
    <Table>
      <TableHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <TableRow>
          <TableHead className="text-white">መለያ ቁጥር</TableHead>
          <TableHead className="text-white">መልዕክት</TableHead>
          <TableHead className="text-white">የተፈጠረበት ጊዜ</TableHead>
          <TableHead className="text-white">ተነቧል?</TableHead>
          <TableHead className="text-white">ሁኔታ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.map((notification) => (
          <TableRow
            key={notification.id}
            onClick={() => handleRowClick(notification)}
            className="cursor-pointer hover:bg-purple-50 transition-colors duration-200"
          >
            <TableCell>{notification.id}</TableCell>
            <TableCell>{notification.message}</TableCell>
            <TableCell>{new Date(notification.createdAt).toLocaleString()}</TableCell>
            <TableCell>{notification.isRead ? "አዎ" : "አይ"}</TableCell>
            <TableCell>
              {notification.schedule ? (
                <Badge variant={notification.schedule.status === "Completed" ? "default" : "secondary"}>
                  {notification.schedule.status === "Completed" ? "ተጠናቋል" : "በሂደት ላይ"}
                </Badge>
              ) : (
                "ተፈጻሚ አይደለም"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardTitle className="text-2xl font-bold flex items-center">
          <Bell className="mr-2" />
          የአቅም ግንባታ እና ፖለቲካ ዘርፍ ሀላፊ ማሳወቂያዎች
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            type="text"
            placeholder="ማሳወቂያዎችን ይፈልጉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[240px] justify-start text-left font-normal", !startDate && "text-gray-500")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>የመጀመሪያ ቀን</span>}
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
                className={cn("w-[240px] justify-start text-left font-normal", !endDate && "text-gray-500")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>የመጨረሻ ቀን</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>
          <Select value={selectedRecipientType} onValueChange={setSelectedRecipientType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="የተቀባይ ዓይነት" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ሁሉም</SelectItem>
              <SelectItem value="Hiwas">የብልጽግና ቤተሰብ</SelectItem>
              <SelectItem value="MeseretawiDirijet">የብልጽግና ህብረት</SelectItem>
              <SelectItem value="Wereda">ወረዳ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="ሁኔታ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ሁሉም</SelectItem>
              <SelectItem value="In Progress">በሂደት ላይ</SelectItem>
              <SelectItem value="To Do">በእቅድ ላይ</SelectItem>
              <SelectItem value="Under Meseretawi Review">በብልጽግና ህብረት ግምገማ ላይ</SelectItem>
              <SelectItem value="Completed">የተጠናቀቀ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ደርድር በ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">ቀን</SelectItem>
              <SelectItem value="year">ዓመት</SelectItem>
              <SelectItem value="month">ወር</SelectItem>
              <SelectItem value="name">ስም</SelectItem>
              <SelectItem value="recipientType">የተቀባይ ዓይነት</SelectItem>
              <SelectItem value="status">ሁኔታ</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2 bg-purple-500 hover:bg-purple-600 text-white"
            aria-label={`ደርድር ${sortOrder === "asc" ? "ወደታች" : "ወደላይ"}`}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="sr-only">{sortOrder === "asc" ? "ወደታች ደርድር" : "ወደላይ ደርድር"}</span>
          </Button>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(groupedNotifications).map(([type, notifications]) => (
            <AccordionItem key={type} value={type}>
              <AccordionTrigger className="text-lg font-semibold">
                {type} {sortBy === "month" ? "" : "ማሳወቂያዎች"} ({notifications.length})
              </AccordionTrigger>
              <AccordionContent>{renderTable(notifications)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

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
        console.error("ማሳወቂያዎችን በማምጣት ላይ ስህተት ተከስቷል:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-800">የአቅም ግንባታ እና ፖለቲካ ዘርፍ ሀላፊ ማሳወቂያ ሰሌዳ</h1>
      <Notifications notifications={notifications} />
    </div>
  )
}

export default WanaNotification

