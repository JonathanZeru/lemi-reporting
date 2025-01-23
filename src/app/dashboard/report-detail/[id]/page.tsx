'use client';
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

const ReportDetail = () => {
  const { id } = useParams() as { id: string }
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
    const response = await axios.get<Report[]>(`${apiURL}api/hiwas/report?scheduleId=${id}`)
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
        const response = await axios.get<Report[]>(`${apiURL}api/hiwas/report?scheduleId=${id}`)
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
  let timeDifferenceInMinutes = 0
  if(report.schedule!=null && report.createdAt!=null){
    const scheduleCreatedAt = new Date(report.schedule.createdAt)
    const reportCreatedAt = new Date(report.createdAt)
    timeDifferenceInMinutes = differenceInMinutes(reportCreatedAt, scheduleCreatedAt)


  const reportStatus =
    timeDifferenceInMinutes > 0
      ? `Late by ${timeDifferenceInMinutes} minutes`
      : 'Up to Date'
      const handleReportApproval = async () => {
        console.log(report)
        setLoadingApproval(true);
        console.log("ere 2")
        
           console.log("ere 3");
             const form = new FormData();
             formData.hiwasId = report?.reportedByHiwasId;
             formData.reportId = report?.id;
             formData.scheduleId = report?.scheduleId;
           console.log("ere 4");
   
           // Append form fields
           Object.entries(formData).forEach(([key, value]) => {
               form.append(key, value as string);
           });
           console.log("ere 5");
           try {
             console.log(`Bearer ${accessToken}`)
             const response = await axios.post(`${apiURL}api/meseretawi/approve`, form,
                   {
                   headers: {
                     Authorization: `Bearer ${accessToken}`,
                   },
                 }
             );
           
             if (response.status === 201) {
                 console.log(response.data.error, "response.status ", response.status)
                 if(response.data.error == 'Report has already been approved!'){
                  toast({
                    title: 'Success',
                    description: `Report has already been approved!`,
                })
                 }else{
                  toast({
                    title: 'Success',
                    description: `Report has been approved by Meseretawi!`,
                })
                fetchReport()
                 }
                 
             } else {
                 
                 toast({
                     title: 'Error',
                     description: `Failed to approve Report! ${response.data}`,
                 })
             }
         } catch (error) {
             toast({
                 title: 'Error',
                 description: `Failed to approve Report! ${error}`
             })
         } finally {
          setLoadingApproval(false);
         }
     };
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
                <p><strong>Created At:</strong> {format(reportCreatedAt, 'PPpp')}</p>
                {report.updatedAt == null ? <></>:
                 <p><strong>Updated At:</strong> {format(new Date(report.updatedAt), 'PPpp')}</p>}
                <p><strong>Status:</strong> {reportStatus}</p>
              </div>
             {report.reportByHiwas == null ?
             <></>
             :<div>
                <h2 className="text-xl font-semibold mb-2">Reporter Information</h2>
                <p><strong>Reported By:</strong> {report.reportedBy}</p>
                <p><strong>Name:</strong> {report.reportByHiwas.firstName} {report.reportByHiwas.lastName}</p>
                <p><strong>Email:</strong> {report.reportByHiwas.email}</p>
                <p><strong>Phone:</strong> {report.reportByHiwas.phone}</p>
              </div>}
            </div>
            <Separator className="my-4" />
           {report.schedule == null || report.reportByHiwas == null ? 
           <></>
           : <div>
              <h2 className="text-xl font-semibold mb-2">Schedule Information</h2>
              <p><strong>Title:</strong> {report.schedule.title}</p>
              <p><strong>Description:</strong> {report.schedule.description}</p>
              <p><strong>Start Time:</strong> {format(new Date(report.schedule.startTime), 'PPpp')}</p>
              <p><strong>End Time:</strong> {format(new Date(report.schedule.endTime), 'PPpp')}</p>
              <p><strong>Status:</strong> {report.schedule.status} 
              {user?.role == "Meseretawi Derejit" ?
               report.reportByHiwas.mdId == user?.id ?
               report.schedule.status == "Under Meseretawi Review" ? 
               <Button
               onClick={()=> handleReportApproval()}
               disabled={loadingAprroval}
               >
                Approve
               </Button>:<></>:<></>:<></>
              }
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
       {report.reportPdfs == null ? <></>:    <CardContent>
            <div className="grid grid-cols-2 gap-4 print:grid-cols-1">
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
            </div>
          </CardContent>}
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
}

export default ReportDetail

