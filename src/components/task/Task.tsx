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
  title: z.string().min(1, "ርዕስ ያስፈልጋል").max(100, "ርዕሱ 100 ፊደላት ወይም ከዚያ በታች መሆን አለበት"),
  description: z.string().min(1, "መግለጫ ያስፈልጋል").max(500, "መግለጫው 500 ፊደላት ወይም ከዚያ በታች መሆን አለበት"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "የተሳሳተ የመጀመሪያ ሰዓት ቅርጸት",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "የተሳሳተ የመጨረሻ ሰዓት ቅርጸት",
  }),
})

type TaskFormData = z.infer<typeof taskSchema>

const categoryColors = {
  ለመስራት: "#FF9999",
  "በሂደት ላይ": "#99CCFF",
  "በመሰረታዊ ግምገማ ላይ": "#FFCC99",
  ተጠናቅቋል: "#99FF99",
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
        console.error("የስራ መርሃ ግብር መረጃን በማምጣት ላይ ስህተት ተከስቷል:", error)
        toast({
          title: "ስህተት",
          description: "የስራ መርሃ ግብሮችን ማምጣት አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
          variant: "destructive",
        })
      })
  }

  const onSubmit = async (data: TaskFormData) => {
    if (!user?.id) {
      toast({
        title: "ስህተት",
        description: "የተጠቃሚ መለያ አልተገኘም!",
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
          title: "ተሳክቷል",
          description: "የስራ መርሃ ግብር በተሳካ ሁኔታ ተፈጥሯል!",
        })
        fetchTasks(user.id)
        reset()
        setIsAddTaskDialogOpen(false)
      }
    } catch (error) {
      toast({
        title: "ስህተት",
        description: "የስራ መርሃ ግብር በመፍጠር ላይ ስህተት ተከስቷል።",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await axios.delete(`${apiURL}api/schedule/delete?id=${taskId}`)
      if (response.status === 200) {
        toast({
          title: "ተሳክቷል",
          description: "የስራ መርሃ ግብር በተሳካ ሁኔታ ተሰርዟል!",
        })
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
        setFilteredTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
      }
    } catch (error) {
      toast({
        title: "ስህተት",
        description: "የስራ መርሃ ግብር በመሰረዝ ላይ ስህተት ተከስቷል።",
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
          title: "ተሳክቷል",
          description: "የስራ መርሃ ግብር በሂደት ላይ ነው!",
        })
        fetchTasks(user?.id || 0)
      } else {
        toast({
          title: "ስህተት",
          description: "የስራ መርሃ ግብርን በሂደት ላይ ማስገባት አልተሳካም!",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "ስህተት",
        description: "የስራ መርሃ ግብርን በሂደት ላይ በማስገባት ላይ ስህተት ተከስቷል።",
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
  }, [searchTerm, searchAttribute, startDateTime, endDateTime]) //Corrected dependencies

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
        return `ስብሰባው በ ${hours}ሰ ${minutes}ደ ይጀምራል`
      } else if (isPast(taskEndTime)) {
        return "ስብሰባው አብቅቷል"
      } else {
        return "ስብሰባው በሂደት ላይ ነው"
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
              ጀምር: {format(taskStartTime, "pp PP")}
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
              {task.status === "በመሰረታዊ ግምገማ ላይ" ? "በግምገማ ላይ" : taskStatus}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const getReportButtonText = (task: Schedule) => {
    return task.status === "ተጠናቅቋል" || task.status === "በመሰረታዊ ግምገማ ላይ" ? "ሪፖርት ይመልከቱ" : "ሪፖርት ያክሉ"
  }

  const getReportButtonUrl = (task: Schedule) => {
    return task.status === "ተጠናቅቋል" || task.status === "በመሰረታዊ ግምገማ ላይ"
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
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">የስራ መርሃ ግብር አስተዳደር</h1>

      <div className="flex justify-between items-center mb-8">
        <Button onClick={() => setIsAddTaskDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          የስራ መርሃ ግብር ጨምር
        </Button>
        <div className="flex space-x-2">
          <Select
            value={searchAttribute}
            onValueChange={(value) => setSearchAttribute(value as "all" | "title" | "description" | "status")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="በ ይፈልጉ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ሁሉም</SelectItem>
              <SelectItem value="title">ርዕስ</SelectItem>
              <SelectItem value="description">መግለጫ</SelectItem>
              <SelectItem value="status">ሁኔታ</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="የስራ መርሃ ግብሮችን ይፈልጉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {["ለመስራት", "በሂደት ላይ", "በመሰረታዊ ግምገማ ላይ", "ተጠናቅቋል"].map((status) => (
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
            <DialogTitle>አዲስ የስራ መርሃ ግብር ይፍጠሩ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("title")} placeholder="የስራ መርሃ ግብር ርዕስ" aria-label="የስራ መርሃ ግብር ርዕስ" />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            <Textarea {...register("description")} placeholder="የስራ መርሃ ግብር መግለጫ" aria-label="የስራ መርሃ ግብር መግለጫ" />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => <Input type="datetime-local" {...field} aria-label="የመጀመሪያ ሰዓት" />}
            />
            {errors.startTime && <p className="text-red-500">{errors.startTime.message}</p>}
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => <Input type="datetime-local" {...field} aria-label="የመጨረሻ ሰዓት" />}
            />
            {errors.endTime && <p className="text-red-500">{errors.endTime.message}</p>}
            <Button type="submit">የስራ መርሃ ግብር ፍጠር</Button>
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
            <Badge className="mt-2" variant={selectedTask?.status === "ተጠናቅቋል" ? "secondary" : "default"}>
              {selectedTask?.status}
            </Badge>
            <div className="flex space-x-4 mt-6">
              {selectedTask?.status === "ለመስራት" && (
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

