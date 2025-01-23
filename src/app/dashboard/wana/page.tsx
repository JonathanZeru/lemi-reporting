'use client';
import type React from "react"
import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { ArrowUpDown, Loader, CalendarIcon, Clock, User, FileText } from "lucide-react"
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

interface WanaScheduleBody {
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
  reports: Report[]
  createdByHiwas: User | null
  createdByMD: User | null
  createdByWana: User | null
  createdByWereda: User | null
}

const WanaSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<WanaScheduleBody[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSortedView, setShowSortedView] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchAttribute, setSearchAttribute] = useState<"all" | "title" | "description" | "status" | "createdByRole">(
    "all",
  )
  const [sortBy, setSortBy] = useState<string>("startTime")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const { toast } = useToast()
  const navigate = useRouter()

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get<WanaScheduleBody[]>(`${apiURL}api/schedule`)
      setSchedules(response.data)
    } catch (error) {
      console.error("Error fetching schedule data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch schedule data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAndSortedSchedules = useMemo(() => {
    return schedules
      .filter((schedule) => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearchTerm =
          searchAttribute === "all"
            ? schedule.title.toLowerCase().includes(searchLower) ||
              schedule.description.toLowerCase().includes(searchLower) ||
              schedule.createdByRole.toLowerCase().includes(searchLower) ||
              schedule.status.toLowerCase().includes(searchLower)
            : schedule[searchAttribute].toLowerCase().includes(searchLower)

        const scheduleStartDate = new Date(schedule.startTime)
        const scheduleEndDate = new Date(schedule.endTime)

        const matchesDateRange =
          (!startDate || scheduleStartDate >= startDate) && (!endDate || scheduleEndDate <= endDate)

        return matchesSearchTerm && matchesDateRange
      })
      .sort((a, b) => {
        let aValue, bValue
        switch (sortBy) {
          case "startTime":
          case "endTime":
          case "createdAt":
            aValue = new Date(a[sortBy]).getTime()
            bValue = new Date(b[sortBy]).getTime()
            break
          case "title":
          case "status":
          case "createdByRole":
            aValue = a[sortBy].toLowerCase()
            bValue = b[sortBy].toLowerCase()
            break
          default:
            aValue = new Date(a.startTime).getTime()
            bValue = new Date(b.startTime).getTime()
        }
        return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
      })
  }, [schedules, searchTerm, searchAttribute, sortBy, sortOrder, startDate, endDate])

  const groupedSchedules = useMemo(() => {
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
      return filteredAndSortedSchedules.reduce(
        (acc, schedule) => {
          const month = months[new Date(schedule.startTime).getMonth()]
          if (!acc[month]) {
            acc[month] = []
          }
          acc[month].push(schedule)
          return acc
        },
        {} as Record<string, WanaScheduleBody[]>,
      )
    } else {
      return {
        "To Do": filteredAndSortedSchedules.filter((s) => s.status === "To Do"),
        "In Progress": filteredAndSortedSchedules.filter((s) => s.status === "In Progress"),
        "Under Meseretawi Review": filteredAndSortedSchedules.filter((s) => s.status === "Under Meseretawi Review"),
        Completed: filteredAndSortedSchedules.filter((s) => s.status === "Completed" || s.status === "Complete"),
      }
    }
  }, [filteredAndSortedSchedules, sortBy])

  const handleRowClick = (schedule: WanaScheduleBody) => {
    if (schedule.createdByRole === "Hiwas") {
      if (schedule.reports.length === 0) {
        navigate.push(`/dashboard/detail/${schedule.id}`)
      } else {
        navigate.push(`/dashboard/report-detail/${schedule.id}`)
      }
    } else if (schedule.createdByRole === "MeseretawiDirijet") {
      if (schedule.reports.length === 0) {
        navigate.push(`/dashboard/detail/${schedule.id}`)
      } else {
        navigate.push(`/dashboard/report-detail/${schedule.id}`)
      }
    } else if (schedule.createdByRole === "Wereda") {
      if (schedule.reports.length === 0) {
        navigate.push(`/dashboard/detail/${schedule.id}`)
      } else {
        navigate.push(`/dashboard/wereda-report-detail/${schedule.id}`)
      }
    }
  }

  const renderScheduleCard = (schedule: WanaScheduleBody) => (
    <Card
      key={schedule.id}
      className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={() => handleRowClick(schedule)}
    >
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="text-xl font-bold">{schedule.title}</CardTitle>
        <CardDescription className="text-gray-100">
          Status:
          <Badge
            defaultValue={schedule.status === "Completed" || schedule.status === "Complete" ? "success" : "secondary"}
            className="ml-2"
          >
            {schedule.status}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-500" />
            <p>
              <strong>Description:</strong> {schedule.description}
            </p>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
            <p>
              <strong>Start Date:</strong> {format(parseISO(schedule.startTime), "PPPP")}
            </p>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            <p>
              <strong>Start Time:</strong> {format(parseISO(schedule.startTime), "p")}
            </p>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
            <p>
              <strong>End Date:</strong> {format(parseISO(schedule.endTime), "PPPP")}
            </p>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            <p>
              <strong>End Time:</strong> {format(parseISO(schedule.endTime), "p")}
            </p>
          </div>
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            <p>
              <strong>Created By:</strong> {schedule.createdByRole} - {schedule.createdByHiwas?.firstName}{" "}
              {schedule.createdByHiwas?.lastName}
            </p>
          </div>
        </div>
        <Button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
          {schedule.reports.length > 0 ? "View Detailed Report" : "View Schedule Detail"}
        </Button>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen" aria-live="polite" aria-busy="true">
        <Loader className="w-12 h-12 animate-spin text-blue-500" />
        <span className="sr-only">Loading schedules. Please wait.</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 md:mb-0">Schedule Management</h1>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-medium">Kanban View</span>
          <Switch
            checked={!showSortedView}
            onCheckedChange={(checked) => setShowSortedView(!checked)}
            aria-label="Toggle between Kanban and Sorted view"
          />
          <span className="text-lg font-medium">Sorted View</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <Select value={searchAttribute} onValueChange={()=>setSearchAttribute}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Search attribute" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="description">Description</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="createdByRole">Created By</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Search schedules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
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
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort schedules by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startTime">Start Time</SelectItem>
            <SelectItem value="endTime">End Time</SelectItem>
            <SelectItem value="createdAt">Created At</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="createdByRole">Created By</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white"
          aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
        >
          <ArrowUpDown className="h-5 w-5" />
          <span className="sr-only">{sortOrder === "asc" ? "Sort descending" : "Sort ascending"}</span>
        </Button>
      </div>

      {showSortedView ? (
        <ScrollArea className="h-[calc(100vh)] w-full">
          <div className="space-y-8">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(groupedSchedules).map(([group, schedules]) => (
                <AccordionItem key={group} value={group}>
                  <AccordionTrigger className="text-xl font-semibold">
                    {group} ({schedules.length} {schedules.length === 1 ? "schedule" : "schedules"})
                  </AccordionTrigger>
                  <AccordionContent>{schedules.map(renderScheduleCard)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(groupedSchedules).map(([status, schedules]) => (
            <div key={status} className="swim-lane flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {status} ({schedules.length} {schedules.length === 1 ? "schedule" : "schedules"})
              </h2>
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="pr-4">{schedules.map(renderScheduleCard)}</div>
              </ScrollArea>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WanaSchedule

