
import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { apiURL } from "../../utils/constants/constants"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Schedule } from "@/types/types"
import { toast } from "@/components/ui/use-toast"
import { format, differenceInMinutes, isPast, parse } from "date-fns"
import { useAuthStore } from "@/stores/authStore"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

// Zod schema for task validation
const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().min(1, "Description is required").max(500, "Description must be 500 characters or less"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start time format",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end time format",
  }),
})

type TaskFormData = z.infer<typeof taskSchema>

const Task: React.FC = () => {
  const { user, accessToken } = useAuthStore()
    const router = useRouter()
  const [loadingInProgress, setLoadingInProgress] = useState(false)
  const [tasks, setTasks] = useState<Schedule[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Schedule[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchAttribute, setSearchAttribute] = useState<"all" | "title" | "description" | "status">("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id)
    }
  }, [user])

  const fetchTasks = (userId: number) => {
    axios
      .get(`${apiURL}api/schedule/hiwas?hiwasId=${userId}`)
      .then((response) => {
        setTasks(response.data)
        setFilteredTasks(response.data)
      })
      .catch((error) => {
        console.error("Error fetching schedule data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch tasks. Please try again.",
          variant: "destructive",
        })
      })
  }

  const onSubmit = async (data: TaskFormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID is not available!",
        variant: "destructive",
      })
      return
    }
    try {
      const response = await axios.post(`${apiURL}api/schedule/hiwas`, {
        ...data,
        creatorId: user.id,
      })
      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Task created successfully!",
        })
        fetchTasks(user.id)
        reset()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the task.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await axios.delete(`${apiURL}api/schedule/delete?id=${taskId}`)
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Task deleted successfully!",
        })
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
        setFilteredTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the task.",
        variant: "destructive",
      })
    }
  }

  const handleTaskInProgress = async (task: Schedule) => {
    setLoadingInProgress(true)
    const form = new FormData()
    form.append("scheduleId", task.id.toString())
    form.append("firstName", user?.firstName || "")
    form.append("lastName", user?.lastName || "")
    form.append("hiwasId", user?.id?.toString() || "")
    form.append("meseretawiDirijetId", user?.mdId?.toString() || "")

    try {
      const response = await axios.post(`${apiURL}api/schedule/in-progress`, form, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Task in progress!",
        })
        fetchTasks(user?.id || 0)
      } else {
        toast({
          title: "Error",
          description: "Failed to add task to in progress!",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding task to in progress.",
        variant: "destructive",
      })
    } finally {
      setLoadingInProgress(false)
    }
  }

  const handleSearch = () => {
    const filtered = tasks.filter((task) => {
      const matchesSearchTerm =
        searchAttribute === "all"
          ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.status.toLowerCase().includes(searchTerm.toLowerCase())
          : (searchAttribute === "title" || searchAttribute === "description" || searchAttribute === "status") &&
            task[searchAttribute].toLowerCase().includes(searchTerm.toLowerCase())

      const taskStartDate = new Date(task.startTime)
      const taskEndDate = new Date(task.endTime)

      const matchesDateRange = (!startDate || taskStartDate >= startDate) && (!endDate || taskEndDate <= endDate)

      return matchesSearchTerm && matchesDateRange
    })

    setFilteredTasks(filtered)
  }

  useEffect(() => {
    handleSearch()
  }, [searchTerm, searchAttribute, startDate, endDate, tasks])

  const categorizeTasks = (status: string) => filteredTasks.filter((task) => task.status === status)

  const renderTaskCard = (task: Schedule) => {
    const taskStartTime = new Date(task.startTime)
    const taskEndTime = new Date(task.endTime)
    const now = new Date()
    const timeDifferenceInMinutes = differenceInMinutes(taskStartTime, now)

    const taskStatus =
      timeDifferenceInMinutes > 0
        ? `Meeting starts in ${Math.floor(timeDifferenceInMinutes / 60)}h ${timeDifferenceInMinutes % 60}m`
        : isPast(taskEndTime)
          ? "Meeting has ended"
          : "Meeting is in progress"

    const buttonText =
      task.status === "Completed" || task.status === "Under Meseretawi Review" ? "View Report" : "Add Report"

    const buttonUrl =
      task.status === "Completed" || task.status === "Under Meseretawi Review"
        ? `/dashboard/report-detail/${task.id}`
        : `/dashboard/report/${task.createdByRole}/${
            task.createdByRole === "Hiwas"
              ? task.createdByHiwasId
              : task.createdByRole === "MD"
                ? task.createdByMDId
                : task.createdByRole === "Wereda"
                  ? task.createdByWeredaId
                  : task.createdByRole === "Wana"
                    ? task.createdByWanaId
                    : ""
          }/${task.id}`

    return (
      <Card key={task.id} className="mb-4">
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <Badge variant={task.status === "Completed" ? "secondary" : "default"}>{task.status}</Badge>
        </CardHeader>
        <CardContent>
          <p>{task.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start: {format(taskStartTime, "pp PP")} <br />
            End: {format(taskEndTime, "pp PP")}
          </p>
          <p className="text-sm font-medium mt-2" aria-live="polite">
            {taskStatus}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href={buttonUrl}>
            <Button variant="outline">{buttonText}</Button>
          </Link>
          {task.status === "To Do" && timeDifferenceInMinutes <= 0 && (
            <Button
              disabled={loadingInProgress}
              variant={"default"}
              className="bg-primary text-white"
              onClick={() => handleTaskInProgress(task)}
            >
              Go To Meeting
            </Button>
          )}
          <Button variant="destructive" className="text-red-600" onClick={() => handleDeleteTask(task.id)}>
            Delete Task
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Task Management</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4">
        <h2 className="text-2xl font-bold mb-4">Create a New Task</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input {...register("title")} placeholder="Task Title" aria-label="Task Title" />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <Textarea {...register("description")} placeholder="Task Description" aria-label="Task Description" />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
          </div>
          <div>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => <Input type="datetime-local" {...field} aria-label="Start Time" />}
            />
            {errors.startTime && <p className="text-red-500">{errors.startTime.message}</p>}
          </div>
          <div>
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => <Input type="datetime-local" {...field} aria-label="End Time" />}
            />
            {errors.endTime && <p className="text-red-500">{errors.endTime.message}</p>}
          </div>
        </div>
        <Button type="submit" className="w-full md:w-auto">
          Create Task
        </Button>
      </form>

      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold">Search Tasks</h2>
        <div className="flex flex-wrap gap-4">
          <Select value={searchAttribute} onValueChange={()=>setSearchAttribute}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Search attribute" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Search term"
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
                <CalendarIcon className="mr-2 h-4 w-4text-white" />
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {["To Do", "In Progress", "Under Meseretawi Review", "Completed"].map((status) => (
          <div key={status} className="space-y-4">
            <h3 className="text-xl font-bold">
              {status} ({categorizeTasks(status).length})
            </h3>
            {categorizeTasks(status).map(renderTaskCard)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Task

