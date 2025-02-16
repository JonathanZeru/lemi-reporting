'use client';
import { useEffect, useState } from 'react'
import axios from 'axios'
import { format, differenceInMinutes } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HiwasNotification, WeredaNotificationBody } from '@/types/types'
import { apiURL } from '@/utils/constants/constants'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const WeredaTaskDetail = () => {
  const { id } = useParams() as { id: string }
  const [notification, setNotification] = useState<WeredaNotificationBody | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, accessToken } = useAuthStore()
 
const fetchReport = async () => {
  try {
    const response = await axios.get<WeredaNotificationBody>(`${apiURL}api/wereda/
      notification?weredaId=${user?.id}&notificationId=${id}`)
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
            console.log(`${apiURL}api/wereda/notification?weredaId=${user?.id}&notificationId=${id}`)
          const response = await axios.get<WeredaNotificationBody>(`${apiURL}api/wereda/notification?weredaId=${user?.id}&notificationId=${id}`)
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

  if (loading) return <div>በመካሄድ ላይ...</div>
  if (error) return <div>ስህተት: {error}</div>
  if (!notification) return <div>ምንም ሪፖርት አልተገኘም።</div>
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
            <CardTitle className="text-3xl font-bold">የተግባር ዝርዝሮች</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 print:grid-cols-1">
              <div>
                <h2 className="text-xl font-semibold mb-2">ማስታወቂያ ዝርዝሮች</h2>
                <p><strong>ስም:</strong> {notification.message}</p>
                <p><strong>ዝርዝር መግለጫ:</strong> {notification.recipientType}</p>
                <p><strong>የተመዘገበበት ቦታ:</strong> {format(reportCreatedAt, 'PPpp')}</p>
                <p><strong>ሁኔታ:</strong><Badge>{notification.isRead ? "seen" : "unseen"}</Badge> መርሐግብር.</p>
              </div>
              {notification.schedule != null ? 
              <div>
                <h2 className="text-xl font-semibold mb-2">የተመዘገበ መርሐግብር ዝርዝሮች</h2>
                <p><strong>የመርሐግብር ስም:</strong> {notification.schedule.title}</p>
                <p><strong>ዝርዝር መግለጫ:</strong> {notification.schedule.description}</p>
                <p><strong>የተመዘገበበት ቦታ:</strong> {format(reportCreatedAt, 'PPpp')}</p>
                <p><strong>የመነሻ ጊዜ:</strong> {format(new Date(notification.schedule?.startTime), 'PPpp')}</p>
                <p><strong>የመጨረሻ ጊዜ:</strong> {format(new Date(notification.schedule?.endTime), 'PPpp')}</p>
                <p><strong>ሁኔታ:</strong> <Badge>{reportStatus}</Badge> and it is a <Badge>{notification.schedule.status}</Badge> መርሐግብር.</p>
              </div>
            :
            <></>}
            {notification.report != null ? 
            <div>
              <h2 className="text-xl font-semibold mb-2">የተላከ ሪፖርት አጠቃላይ እይታ</h2>
              <p><strong>የሪፖርት  ስም:</strong> {notification.report.name}</p>
              <p><strong>ዝርዝር መግለጫ:</strong> {notification.report.description}</p>
              <p><strong>የተመዘገበበት ቦታ:</strong> {format(notification.report.createdAt, 'PPpp')}</p>
              <Link href={`/dashboard/wereda-report-detail/${notification.report.id}`}>
              <Button>
              ተጨማሪ ዝርዝር ይመልከቱ 
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

export default WeredaTaskDetail

