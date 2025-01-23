import { WeredaNotificationBody } from '@/types/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

const WeredaNotification = ({weredaNotifications}:{weredaNotifications:
    WeredaNotificationBody[]}) => {
       const navigate = useRouter()
  return (
    <Table>
    <TableHeader>
        <TableRow>
            <TableHead>Message</TableHead>

            <TableHead>Report Name</TableHead>
            
            <TableHead>Schedule Title</TableHead>
            <TableHead>Schedule Status</TableHead>

                                <TableHead>Schedule Start Time</TableHead>
                                <TableHead>Schedule End Time</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        { weredaNotifications.map((notification) => (
            <TableRow key={notification.id} className="hover:bg-slate-200"
                                            onClick={()=>{
                                              if(notification.report==null){
                                              navigate.push(`/dashboard/wereda-task-detail/${notification.id}`)
                                          }else{
                                            navigate.push(`/dashboard/report-detail/${notification.schedule != null ?
                                              notification.schedule!.id : 0
                                            }`)
                                          }
                                            }}
                                            >
                <TableCell className='line-clamp-2'>{notification.message}</TableCell>


                <TableCell>{notification.report == null ? 
                                       
                                       notification.schedule == null ? "" : notification.schedule.status
                                       
                                       : notification.report.name
                                       }</TableCell>

                <TableCell>{notification.schedule == null ? "":notification.schedule.title}</TableCell>
                <TableCell>{notification.schedule == null ? "":notification.schedule.status}</TableCell>
<TableCell>{format(new Date(notification.schedule?.startTime != null? 
                                      notification.schedule?.startTime:"2025-01-18T10:59:31.728Z"), 'PPpp')}</TableCell>
                                    <TableCell>{format(new Date(notification.schedule?.endTime != null?
                                       notification.schedule?.endTime:"2025-01-18T10:59:31.728Z"), 'PPpp')}</TableCell>
                                       
            </TableRow>
        ))}
    </TableBody>
</Table>
  )
}

export default WeredaNotification