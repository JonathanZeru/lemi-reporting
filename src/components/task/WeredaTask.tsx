"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { apiURL } from "../../utils/constants/constants"
import type React from "react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"
import type { Schedule } from "@/types/types"
import { toast } from "@/components/ui/use-toast"
import { format, differenceInMinutes } from "date-fns"
import { useAuthStore } from "@/stores/authStore"

const WeredaTask = () => {
  const { user, accessToken } = useAuthStore()
  const [loadingInProgress, setLoadingInProgress] = useState(false)
  const [formData] = useState({
    firstName: user?.firstName,
    lastName: user?.lastName,
    weredaId: user?.id,
    scheduleId: 0,
  })

  const [tasks, setTasks] = useState<Schedule[]>([])
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    weredaId: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
  })

  useEffect(() => {
    if (user && user.id) {
      setNewTask((prevTask) => ({
        ...prevTask,
        creatorId: user.id,
      }))
      fetchTasks(user?.id)
    }
  }, [user])

  const fetchTasks = (userId: number) => {
    console.log("የተጠቃሚ መለያ= ", userId)
    console.log(`${apiURL}api/schedule/wereda?weredaId=${userId}`)
    axios
      .get(`${apiURL}api/schedule/wereda?weredaId=${userId}`)
      .then((response) => {
        console.log(response.data)
        setTasks(response.data)
      })
      .catch((error) => {
        console.error("የስራ መርሃ ግብር መረጃን በማምጣት ላይ ስህተት ተከስቷል:", error)
      })
    console.log("ተግባራት = = == = =", tasks, " ====")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.weredaId) {
      toast({
        title: "ስህተት",
        description: "የተጠቃሚ መለያ አልተገኘም!",
      })
      return
    }
    try {
      const response = await axios.post(`${apiURL}api/schedule/wereda`, newTask)
      if (response.status === 201) {
        toast({
          title: "ተሳክቷል",
          description: "የስራ መርሃ ግብር በተሳካ ሁኔታ ተፈጥሯል!",
        })
        fetchTasks(user?.id || 0)
      } else {
        toast({
          title: "ስህተት",
          description: "የስራ መርሃ ግብር መፍጠር አልተሳካም!",
        })
      }
    } catch (error) {
      toast({
        title: "ስህተት",
        description: "የስራ መርሃ ግብር በመፍጠር ላይ ስህተት ተከስቷል።",
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
      } else {
        toast({
          title: "ስህተት",
          description: "የስራ መርሃ ግብር መሰረዝ አልተሳካም!",
        })
      }
    } catch (error) {
      toast({
        title: "ስህተት",
        description: "የስራ መርሃ ግብር በመሰረዝ ላይ ስህተት ተከስቷል።",
      })
    }
  }

  const categorizeTasks = (status: string) => {
    console.log(status)
    return tasks.filter((task) => task.status == status)
  }

  const handleTaskInProgress = async (task: Schedule) => {
    setLoadingInProgress(true)
    console.log("ere 2")

    console.log("ere 3")

    const form = new FormData()
    formData.scheduleId = task.id
    console.log("ere 4")

    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value as string)
    })

    try {
      const response = await axios.post(`${apiURL}api/schedule/wereda-in-progress`, form, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.status === 201) {
        toast({
          title: "ተሳክቷል",
          description: "የስራ መርሃ ግብር በሂደት ላይ ነው!",
        })
        fetchTasks(task.id)
      } else {
        toast({
          title: "ስህተት",
          description: "የስራ መርሃ ግብርን በሂደት ላይ ማስገባት አልተሳካም!",
        })
      }
    } catch (error) {
      toast({
        title: "ስህተት",
        description: "የስራ መርሃ ግብርን በሂደት ላይ በማስገባት ላይ ስህተት ተከስቷል።",
      })
    }
  }

  const renderTaskCard = (task: Schedule) => {
    console.log(task)
    const taskStartTime = new Date(task.startTime)
    const taskEndTime = new Date(task.endTime)
    const timeDifferenceInMinutes = differenceInMinutes(taskEndTime, taskStartTime)

    const taskStatus =
      timeDifferenceInMinutes > 0
        ? `ስብሰባው በ ${format(new Date(task.startTime), "pp PP")} መጀመር ነበረበት!`
        : timeDifferenceInMinutes == 0
          ? `አሁን በሂደት ላይ መሆን አለበት!!`
          : "ወቅታዊ"

    const buttonText =
      task.status === "Completed" ? "ሪፖርት ይመልከቱ" : task.status == "Under Meseretawi Review" ? "ሪፖርት ይመልከቱ" : "ሪፖርት ያክሉ"

    const buttonUrl =
      task.status === "Completed"
        ? `/dashboard/wereda-report-detail/${task.id}`
        : task.status === "Under Meseretawi Review"
          ? `/dashboard/wereda-report-detail/${task.id}`
          : `/dashboard/wereda-report/${task.createdByRole}/${
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
      <div
        key={task.id}
        draggable="true"
        className="relative flex flex-col justify-between rounded-sm border p-7 shadow-default hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[150px]"
      >
        <div>
          <h5 className="mb-4 text-lg font-medium">{task.title}</h5>
          <p>{task.description}</p>
          <p>{task.status}</p>
          <p className="text-sm text-gray-500 mt-2">
            ጀምር: {new Date(task.startTime).toLocaleString()} <br />
            ጨርስ: {new Date(task.endTime).toLocaleString()}
          </p>
          <Link to={buttonUrl}>
            <Button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
              {buttonText}
            </Button>
          </Link>

          {task.status == "To Do" ? (
            <>
              <h1 className="mb-4 text-lg font-medium text-red-500">{taskStatus}</h1>
              {timeDifferenceInMinutes >= 0 ? (
                <div>
                  <Button
                    disabled={loadingInProgress}
                    onClick={() => {
                      handleTaskInProgress(task)
                    }}
                  >
                    ወደ ስብሰባ ይሂዱ
                  </Button>
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
        <Button
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
          onClick={() => handleDeleteTask(task.id)}
        >
          ተግባሩን ሰርዝ
        </Button>
      </div>
    )
  }
  return (
    <div className="container mx-auto p-6">
      <form className="mb-8" onSubmit={handleFormSubmit}>
        <h2 className="text-2xl font-bold mb-4">አዲስ የወረዳ የስራ መርሃ ግብር ይፍጠሩ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="የስራ መርሃ ግብር ርዕስ"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="የስራ መርሃ ግብር መግለጫ"
            className="p-2 border rounded"
            required
          />
          <input
            type="datetime-local"
            name="startTime"
            value={newTask.startTime}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="datetime-local"
            name="endTime"
            value={newTask.endTime}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />
        </div>
        <Button type="submit" className="mt-4 px-6 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600">
          የስራ መርሃ ግብር ፍጠር
        </Button>
      </form>

      <div className="flex gap-6 justify-between items-stretch">
        <div className="swim-lane flex flex-col gap-5.5 w-1/3">
          <h4 className="text-xl font-bold">የታቀደ ({categorizeTasks("To Do").length})</h4>
          {categorizeTasks("To Do").map((task) => renderTaskCard(task))}
        </div>

        <div className="swim-lane flex flex-col gap-5.5 w-1/3">
          <h4 className="text-xl font-bold">በሂደት ላይ ({categorizeTasks("In Progress").length})</h4>
          {categorizeTasks("In Progress").map((task) => renderTaskCard(task))}
        </div>

        <div className="swim-lane flex flex-col gap-5.5 w-1/3">
          <h4 className="text-xl font-bold">የጠናቀቀ ({categorizeTasks("Completed").length})</h4>
          {categorizeTasks("Completed").map((task) => renderTaskCard(task))}
        </div>
      </div>
    </div>
  )
}

export default WeredaTask

