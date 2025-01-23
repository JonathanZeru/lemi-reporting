'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { format, differenceInMinutes } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Report } from '@/types/types'
import { apiURL } from '@/utils/constants/constants'
import { useParams } from 'next/navigation'
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

const WeredaReportDetail = () => {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, accessToken } = useAuthStore()
  const [loadingAprroval, setLoadingApproval] = useState(false)
  const [formData, ] = useState({
    firstName: user?.firstName,
    lastName: user?.lastName,
    hiwasId: report?.reportedByHiwasId,
    reportId: report?.id,
    meseretawiDirijetId: user?.id,
    scheduleId: report?.scheduleId,

});
const fetchReport = async () => {
  try {
    const response = await axios.get<Report[]>(`${apiURL}api/wereda/report?scheduleId=${id}`)
    if (response.data.length > 0) {
      setReport(response.data[0])
    } else {
      setError('No report found')
    }
  } catch (err) {
    setError('Failed to fetch report')
    console.error('Error fetching report:', err)
  } finally {
    setLoading(false)
  }
}
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get<Report[]>(`${apiURL}api/wereda/report?scheduleId=${id}`)
        if (response.data.length > 0) {
          setReport(response.data[0])
        } else {
          setError('No report found')
        }
      } catch (err) {
        setError('Failed to fetch report')
        console.error('Error fetching report:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!report) return <div>No report found</div>
 
  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="container mx-auto p-4 space-y-6 print:space-y-4">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Final Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 print:grid-cols-1">
              <div>
                <h2 className="text-xl font-semibold mb-2">Report Details</h2>
                <p><strong>Name:</strong> {report.name}</p>
                <p><strong>Description:</strong> {report.description}</p>
                {report.createdAt == null ? <></>: <p><strong>Created At:</strong> {format(new Date(report.createdAt), 'PPpp')}</p>}
                {report.updatedAt == null ? <></>: <p><strong>Updated At:</strong> {format(new Date(report.updatedAt), 'PPpp')}</p>}
                {report.schedule?.status == null ? <></>: <p><strong>Status:</strong> {report.schedule?.status}</p>}
              </div>
              {report.reportedByWereda != null ? <div>
                <h2 className="text-xl font-semibold mb-2">Reporter Information</h2>
                <p><strong>Name:</strong> {report.reportedByWereda.firstName} {report.reportedByWereda.lastName}</p>
                <p><strong>Email:</strong> {report.reportedByWereda.email}</p>
                <p><strong>Phone:</strong> {report.reportedByWereda.phone}</p>
              </div> : <></>}
            </div>
            <Separator className="my-4" />
            {report.schedule == null? 
            <></>
            : <div>
              <h2 className="text-xl font-semibold mb-2">Schedule Information</h2>
              <p><strong>Title:</strong> {report.schedule.title}</p>
              <p><strong>Description:</strong> {report.schedule.description}</p>
              <p><strong>Start Time:</strong> {format(new Date(report.schedule.startTime), 'PPpp')}</p>
              <p><strong>End Time:</strong> {format(new Date(report.schedule.endTime), 'PPpp')}</p>
              <p><strong>Status:</strong> {report.schedule.status} 
              </p>
            </div>}
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-none">
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          {report.reportImages == null ? 
          <></>
          : <CardContent>
            <Carousel className="print:hidden">
              <CarouselContent>
                {report.reportImages.map((image) => (
                  <CarouselItem key={image.id}>
                    <img src={`${apiURL}${image.url}`} 
                    alt={`Report Image ${image.id}`} className="w-full h-64 object-contain rounded-md" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            <div className="hidden print:grid grid-cols-2 gap-4">
              {report.reportImages.map((image) => (
                <img key={image.id} src={`${apiURL}${image.url}`} 
                alt={`Report Image ${image.id}`} className="w-full object-contain rounded-md" />
              ))}
            </div>
          </CardContent>}
        </Card>

        <Card className="print:shadow-none print:border-none">
          <CardHeader>
            <CardTitle>PDFs</CardTitle>
          </CardHeader>
          <CardContent>
           {report.reportPdfs == null ? 
           <></>
           : <div className="grid grid-cols-2 gap-4 print:grid-cols-1">
              {report.reportPdfs.map((pdf) => (
                <a
                  key={pdf.id}
                  href={`${apiURL}${pdf.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-md hover:bg-gray-100 transition print:no-underline print:text-black"
                >
                  {pdf.title}
                </a>
              ))}
            </div>}
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-none">
          <CardHeader>
            <CardTitle>Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls className="w-full print:hidden">
              <source src={`${apiURL}${report.audio}`} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
            <p className="hidden print:block">Audio file: {report.audio}</p>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-none">
          <CardHeader>
            <CardTitle>Video</CardTitle>
          </CardHeader>
          <CardContent>
            <video controls className="w-full print:hidden">
              <source src={`${apiURL}${report.reportVideo}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="hidden print:block">Video file: {report.reportVideo}</p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

export default WeredaReportDetail

