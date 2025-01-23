'use client';
import { useEffect, useState } from 'react'
import axios from 'axios'
import { format, differenceInMinutes } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HiwasNotification } from '@/types/types'
import { apiURL } from '@/utils/constants/constants'
import { useParams } from 'next/navigation'
import Link  from "next/link"
import { useAuthStore } from '@/stores/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const TaskDetail = () => {
  const { id } = useParams() as { id: string }
  const [notification, setNotification] = useState<HiwasNotification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, accessToken } = useAuthStore()
 
const fetchReport = async () => {
  try {
    const response = await axios.get<HiwasNotification>(`${apiURL}api/hiwas/notification?hiwasId=${user?.id}
      &notificationId=${id}`)
    if (response.data) {
        setNotification(response.data)
    } else {
      setError('No Schedule found')
    }
  } catch (err) {
    setError('Failed to fetch Schedule')
    console.error('Error fetching Schedule:', err)
  } finally {
    setLoading(false)
  }
}
  useEffect(() => {
    const fetchReport = async () => {
        try {
          const response = await axios.get<HiwasNotification>(`${apiURL}api/hiwas/notification?hiwasId=${user?.id}
            &notificationId=${id}`)
          if (response.data) {
            setNotification(response.data)
          } else {
            setError('No Schedule found')
          }
        } catch (err) {
          setError('Failed to fetch Schedule')
          console.error('Error fetching Schedule:', err)
        } finally {
          setLoading(false)
        }
      }
    fetchReport()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!notification) return <div>No report found</div>
  const scheduleCreatedAt = new Date(notification.createdAt)
  const reportCreatedAt = new Date(notification.createdAt)
  const timeDifferenceInMinutes = differenceInMinutes(reportCreatedAt, scheduleCreatedAt)

  const reportStatus =
    timeDifferenceInMinutes > 0
      ? `Late by ${timeDifferenceInMinutes} minutes`
      : 'Up to Date'
      
  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="container mx-auto p-4 space-y-6 print:space-y-4">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Task Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 print:grid-cols-1">
              <div>
                <h2 className="text-xl font-semibold mb-2">Notification Details</h2>
                <p><strong>Name:</strong> {notification.message}</p>
                <p><strong>Description:</strong> {notification.recipientType}</p>
                <p><strong>Created At:</strong> {format(reportCreatedAt, 'PPpp')}</p>
                <p><strong>Status:</strong><Badge>{notification.isRead == true ? "seen" : "unseen"}</Badge> schedule.</p>
              </div>
             {notification.hiwas ==null ? 
             <></>
             : <div>
                <h2 className="text-xl font-semibold mb-2">Notification Details</h2>
                <p><strong>Name:</strong> {notification.hiwas.firstName} {notification.hiwas.lastName}</p>
                <p><strong>Email:</strong> {notification.hiwas.email}</p>
                <p><strong>phone:</strong> {notification.hiwas.phone}</p>
                </div>}
              {notification.schedule != null ? 
              <div>
                <h2 className="text-xl font-semibold mb-2">Created Schedule Details</h2>
                <p><strong>Schedule Name:</strong> {notification.schedule.title}</p>
                <p><strong>Description:</strong> {notification.schedule.description}</p>
                <p><strong>Created At:</strong> {format(reportCreatedAt, 'PPpp')}</p>
                <p><strong>Start Time At:</strong> {format(new Date(notification.schedule?.startTime), 'PPpp')}</p>
                <p><strong>End Time At:</strong> {format(new Date(notification.schedule?.endTime), 'PPpp')}</p>
                <p><strong>Status:</strong> <Badge>{reportStatus}</Badge> and it is a <Badge>{notification.schedule.status}</Badge> schedule.</p>
              </div>
            :
            <></>}
            {notification.report != null ? 
            <div>
              <h2 className="text-xl font-semibold mb-2">Added Report Highlight</h2>
              <p><strong>Report Name:</strong> {notification.report.name}</p>
              <p><strong>Description:</strong> {notification.report.description}</p>
              <p><strong>Created At:</strong> {format(notification.report.createdAt, 'PPpp')}</p>
              <Link href={`/dashboard/report-detail/${notification.scheduleId}`}>
              <Button>
                See More Detail 
              </Button>
              </Link>
            </div>
          :
          <></>}
            </div>
          </CardContent>
        </Card>

       
      </div>
    </ScrollArea>
  )
}

export default TaskDetail

