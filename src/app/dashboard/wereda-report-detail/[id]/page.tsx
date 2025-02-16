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

  if (loading) return <div>በመካሄድ ላይ...</div>
  if (error) return <div>ስህተት: {error}</div>
  if (!report) return <div>ምንም ሪፖርት አልተገኘም።</div>
 
  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="container mx-auto p-4 space-y-6 print:space-y-4">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">የመጨረሻ ሪፖርት</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 print:grid-cols-1">
              <div>
                <h2 className="text-xl font-semibold mb-2">የሪፖርት ዝርዝሮች</h2>
                <p><strong>ስም:</strong> {report.name}</p>
                <p><strong>ዝርዝር መግለጫ:</strong> {report.description}</p>
                {report.createdAt == null ? <></>: <p><strong>የተመዘገበበት ጊዜ:</strong> {format(new Date(report.createdAt), 'PPpp')}</p>}
                {report.schedule?.status == null ? <></>: <p><strong>ሁኔታ:</strong> {report.schedule?.status}</p>}
                <p><strong>ወር:</strong> {report.month}</p>
                <p><strong>የተገኙ ሰራተኞች ብዛት:</strong> {report.absentEmployees}</p>
                <p><strong>ያልተገኙ ሰራተኞች ብዛት:</strong> {report.presentEmployees}</p>
              </div>
              {report.reportedByWereda != null ? <div>
                <h2 className="text-xl font-semibold mb-2">የሪፖርተር መረጃ</h2>
                <p><strong>ስም:</strong> {report.reportedByWereda.firstName} {report.reportedByWereda.lastName}</p>
                <p><strong>ኢሜል:</strong> {report.reportedByWereda.email}</p>
                <p><strong>ስልክ:</strong> {report.reportedByWereda.phone}</p>
              </div> : <></>}
            </div>
            <Separator className="my-4" />
            {report.schedule == null? 
            <></>
            : <div>
              <h2 className="text-xl font-semibold mb-2">Schedule Information</h2>
              <p><strong>ርዕስ:</strong> {report.schedule.title}</p>
              <p><strong>ዝርዝር መግለጫ:</strong> {report.schedule.description}</p>
              <p><strong>የመነሻ ጊዜ:</strong> {format(new Date(report.schedule.startTime), 'PPpp')}</p>
              <p><strong>የመጨረሻ ጊዜ:</strong> {format(new Date(report.schedule.endTime), 'PPpp')}</p>
              <p><strong>ሁኔታ:</strong> {report.schedule.status} 
              </p>
            </div>}
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-none">
          <CardHeader>
            <CardTitle>ምስሎች</CardTitle>
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
            <CardTitle>ድምጽ</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls className="w-full print:hidden">
              <source src={`${apiURL}${report.audio}`} type="audio/wav" />
              ሲስተሙ ድምጽ ፋይል አይቀበልም
            </audio>
            <p className="hidden print:block">ድምጽ ፋይል: {report.audio}</p>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-none">
          <CardHeader>
            <CardTitle>ቪዲዮ </CardTitle>
          </CardHeader>
          <CardContent>
            <video controls className="w-full print:hidden">
              <source src={`${apiURL}${report.reportVideo}`} type="video/mp4" />
              ሲስተሙ ቪዲዮ ፋይል አይቀበልም.
            </video>
            <p className="hidden print:block">ቪዲዮ ፋይል: {report.reportVideo}</p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

export default WeredaReportDetail

