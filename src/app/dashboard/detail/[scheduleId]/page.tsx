'use client';
import { useEffect, useState } from "react"
import axios from "axios"
import { format, differenceInMinutes } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiURL } from "@/utils/constants/constants"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/stores/authStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface CommonTaskDetailProps {
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
  reports: any[] // You might want to define a more specific type for reports
  createdByHiwas: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    userName: string
    role: string
    isActive: boolean
    mdId: number
    createdAt: string
    updatedAt: string
  } | null
  createdByMD: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    userName: string
    role: string
    isActive: boolean
    mdId: number
    createdAt: string
    updatedAt: string
  } | null // Define a type for MD if available
  createdByWana: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    userName: string
    role: string
    isActive: boolean
    mdId: number
    createdAt: string
    updatedAt: string
  } | null // Define a type for Wana if available
  createdByWereda: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    userName: string
    role: string
    isActive: boolean
    mdId: number
    createdAt: string
    updatedAt: string
  } | null // Define a type for Wereda if available
}

const CommonTaskDetail = () => {
  const { scheduleId } = useParams()
  const [taskDetail, setTaskDetail] = useState<CommonTaskDetailProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const { user, accessToken } = useAuthStore()

  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        const response = await axios.get<CommonTaskDetailProps>(`${apiURL}api/schedule?scheduleId=${scheduleId}`)
        if (response.data) {
          setTaskDetail(response.data)
        } else {
          setError("No Schedule found")
        }
      } catch (err) {
        setError("Failed to fetch Schedule")
        console.error("Error fetching Schedule:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTaskDetail()
  }, [scheduleId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!taskDetail) return <div>No task detail found</div>

  const taskCreatedAt = new Date(taskDetail.createdAt)
  const taskStartTime = new Date(taskDetail.startTime)
  const timeDifferenceInMinutes = differenceInMinutes(taskStartTime, taskCreatedAt)

  const taskStatus = timeDifferenceInMinutes < 0 ? `Late by ${Math.abs(timeDifferenceInMinutes)} minutes` : "Up to Date"

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="container mx-auto p-4 space-y-6 print:space-y-4">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Task Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
              <div>
                <h2 className="text-xl font-semibold mb-2">Task Details</h2>
                <p>
                  <strong>Title:</strong> {taskDetail.title}
                </p>
                <p>
                  <strong>Description:</strong> {taskDetail.description}
                </p>
                <p>
                  <strong>Created At:</strong> {format(taskCreatedAt, "PPpp")}
                </p>
                <p>
                  <strong>Start Time:</strong> {format(new Date(taskDetail.startTime), "PPpp")}
                </p>
                <p>
                  <strong>End Time:</strong> {format(new Date(taskDetail.endTime), "PPpp")}
                </p>
                <p>
                  <strong>Status:</strong> <Badge>{taskDetail.status}</Badge>
                </p>
                <p>
                  <strong>Time Status:</strong> <Badge>{taskStatus}</Badge>
                </p>
              </div>

              {taskDetail.createdByHiwas && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Created By</h2>
                  <p>
                    <strong>Name:</strong> {taskDetail.createdByHiwas.firstName} {taskDetail.createdByHiwas.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {taskDetail.createdByHiwas.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {taskDetail.createdByHiwas.phone}
                  </p>
                  <p>
                    <strong>Role:</strong> {taskDetail.createdByHiwas.role}
                  </p>
                </div>
              )}

              {taskDetail.createdByMD && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Created By</h2>
                  <p>
                    <strong>Name:</strong> {taskDetail.createdByMD.firstName} {taskDetail.createdByMD.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {taskDetail.createdByMD.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {taskDetail.createdByMD.phone}
                  </p>
                  <p>
                    <strong>Role:</strong> {taskDetail.createdByMD.role}
                  </p>
                </div>
              )}

              {taskDetail.createdByWana && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Created By</h2>
                  <p>
                    <strong>Name:</strong> {taskDetail.createdByWana.firstName} {taskDetail.createdByWana.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {taskDetail.createdByWana.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {taskDetail.createdByWana.phone}
                  </p>
                  <p>
                    <strong>Role:</strong> {taskDetail.createdByWana.role}
                  </p>
                </div>
              )}

              {taskDetail.createdByWereda && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Created By</h2>
                  <p>
                    <strong>Name:</strong> {taskDetail.createdByWereda.firstName} {taskDetail.createdByWereda.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {taskDetail.createdByWereda.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {taskDetail.createdByWereda.phone}
                  </p>
                  <p>
                    <strong>Role:</strong> {taskDetail.createdByWereda.role}
                  </p>
                </div>
              )}

              {taskDetail.reports && taskDetail.reports.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Reports</h2>
                  <p>
                    <strong>Number of Reports:</strong> {taskDetail.reports.length}
                  </p>
                  <Link href={`/dashboard/task-reports/${taskDetail.id}`}>
                    <Button className="mt-2">See Reports</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

export default CommonTaskDetail

