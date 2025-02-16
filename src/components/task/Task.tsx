"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { apiURL } from "../../utils/constants/constants"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { useRouter } from "next/navigation"
import type { Schedule } from "@/types/types"
import { toast } from "@/components/ui/use-toast"
import { format, differenceInMinutes, isPast } from "date-fns"
import { useAuthStore } from "@/stores/authStore"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { getContrastingTextColor } from "@/lib/utils"

// Zod schema for task validation (unchanged)
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

const categoryColors = {
  "To Do": "#FF9999",
  "In Progress": "#99CCFF",
  "Under Meseretawi Review": "#FFCC99",
  Completed: "#99FF99",
}

const Task: React.FC = () => {
  const { user, accessToken } = useAuthStore()
  const router = useRouter()
  const [loadingInProgress, setLoadingInProgress] = useState(false)
  const [tasks, setTasks] = useState<Schedule[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Schedule[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchAttribute, setSearchAttribute] = useState<"all" | "title" | "description" | "status">("all")
  const [startDateTime, setStartDateTime] = useState<Date | undefined>(undefined)
  const [endDateTime, setEndDateTime] = useState<Date | undefined>(undefined)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Schedule | null>(null)

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
        setIsAddTaskDialogOpen(false)
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

      const matchesDateRange =
        (!startDateTime || taskStartDate >= startDateTime) && (!endDateTime || taskEndDate <= endDateTime)

      return matchesSearchTerm && matchesDateRange
    })

    setFilteredTasks(filtered)
  }

  useEffect(() => {
    handleSearch()
  }, [searchTerm, searchAttribute, startDateTime, endDateTime, tasks])

  const categorizeTasks = (status: string) => filteredTasks.filter((task) => task.status === status)

  const renderTaskCard = (task: Schedule) => {
    const taskStartTime = new Date(task.startTime)
    const taskEndTime = new Date(task.endTime)
    const now = new Date()
    const timeDifferenceInMinutes = differenceInMinutes(taskStartTime, now)

    const getTaskStatus = () => {
      if (timeDifferenceInMinutes > 0) {
        const hours = Math.floor(timeDifferenceInMinutes / 60)
        const minutes = timeDifferenceInMinutes % 60
        return `Meeting starts in ${hours}h ${minutes}m`
      } else if (isPast(taskEndTime)) {
        return "Meeting has ended"
      } else {
        return "Meeting is in progress"
      }
    }

    const taskStatus = getTaskStatus()
    const isNearMeeting = timeDifferenceInMinutes > 0 && timeDifferenceInMinutes <= 12 * 60
    const isMeetingPassed = isPast(taskEndTime)

    return (
      <motion.div key={task.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        <Card
          className={cn(
            "mb-4 cursor-pointer overflow-hidden",
            isNearMeeting && "animate-pulse",
            isMeetingPassed && "opacity-60",
          )}
          style={{ backgroundColor: categoryColors[task.status as keyof typeof categoryColors] }}
          onClick={() => setSelectedTask(task)}
        >
          <CardHeader className="pb-2">
            <CardTitle
              className="text-lg"
              style={{ color: getContrastingTextColor(categoryColors[task.status as keyof typeof categoryColors]) }}
            >
              {task.title}
            </CardTitle>
            <Badge
              variant="outline"
              style={{
                backgroundColor: getContrastingTextColor(
                  categoryColors[task.status as keyof typeof categoryColors],
                  0.2,
                ),
                color: getContrastingTextColor(categoryColors[task.status as keyof typeof categoryColors]),
              }}
            >
              {task.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <p
              className="line-clamp-2 text-sm"
              style={{ color: getContrastingTextColor(categoryColors[task.status as keyof typeof categoryColors]) }}
            >
              {task.description}
            </p>
            <p
              className="text-xs mt-2"
              style={{
                color: getContrastingTextColor(categoryColors[task.status as keyof typeof categoryColors], 0.7),
              }}
            >
              Start: {format(taskStartTime, "pp PP")}
            </p>
            <p
              className={cn(
                "text-xs font-medium mt-1",
                isNearMeeting && "font-bold",
                isMeetingPassed && "line-through",
              )}
              style={{ color: getContrastingTextColor(categoryColors[task.status as keyof typeof categoryColors]) }}
              aria-live="polite"
            >
              {task.status === "Under Meseretawi Review" ? "Under Review" : taskStatus}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const getReportButtonText = (task: Schedule) => {
    return task.status === "Completed" || task.status === "Under Meseretawi Review" ? "View Report" : "Add Report"
  }

  const getReportButtonUrl = (task: Schedule) => {
    return task.status === "Completed" || task.status === "Under Meseretawi Review"
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
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">Task Management</h1>

      <div className="flex justify-between items-center mb-8">
        <Button onClick={() => setIsAddTaskDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          Add Task
        </Button>
        <div className="flex space-x-2">
          <Select
            value={searchAttribute}
            onValueChange={(value) => setSearchAttribute(value as "all" | "title" | "description" | "status")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Search by" />
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
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {["To Do", "In Progress", "Under Meseretawi Review", "Completed"].map((status) => (
          <div key={status} className="space-y-4">
            <h3
              className="text-xl font-bold sticky top-0 bg-gray-100 z-10 py-2 px-4 rounded-t-lg"
              style={{
                backgroundColor: categoryColors[status as keyof typeof categoryColors],
                color: getContrastingTextColor(categoryColors[status as keyof typeof categoryColors]),
              }}
            >
              {status} ({categorizeTasks(status).length})
            </h3>
            <ScrollArea className="h-[calc(100vh-250px)] rounded-b-lg bg-white p-4">
              {categorizeTasks(status).map(renderTaskCard)}
            </ScrollArea>
          </div>
        ))}
      </div>

      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("title")} placeholder="Task Title" aria-label="Task Title" />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            <Textarea {...register("description")} placeholder="Task Description" aria-label="Task Description" />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => <Input type="datetime-local" {...field} aria-label="Start Time" />}
            />
            {errors.startTime && <p className="text-red-500">{errors.startTime.message}</p>}
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => <Input type="datetime-local" {...field} aria-label="End Time" />}
            />
            {errors.endTime && <p className="text-red-500">{errors.endTime.message}</p>}
            <Button type="submit">Create Task</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">{selectedTask?.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-semibold">ጀምር:</p>
                <p>{selectedTask && format(new Date(selectedTask.startTime), "pp PP")}</p>
              </div>
              <div>
                <p className="font-semibold">ጨርስ:</p>
                <p>{selectedTask && format(new Date(selectedTask.endTime), "pp PP")}</p>
              </div>
            </div>
            <Badge className="mt-2" variant={selectedTask?.status === "Completed" ? "secondary" : "default"}>
              {selectedTask?.status}
            </Badge>
            <div className="flex space-x-4 mt-6">
              {selectedTask?.status === "To Do" && (
                <Button
                  disabled={loadingInProgress}
                  variant="default"
                  className="bg-primary text-white flex-1"
                  onClick={() => selectedTask && handleTaskInProgress(selectedTask)}
                >
                  {loadingInProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  ወደ ስብሰባ ይሂዱ
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (selectedTask) {
                    router.push(getReportButtonUrl(selectedTask))
                  }
                }}
              >
                {selectedTask && getReportButtonText(selectedTask)}
              </Button>
            </div>
            <Button
              variant="destructive"
              className="w-full mt-4 text-red-400"
              onClick={() => selectedTask && handleDeleteTask(selectedTask.id)}
            >
              ተግባሩን ሰርዝ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Task

