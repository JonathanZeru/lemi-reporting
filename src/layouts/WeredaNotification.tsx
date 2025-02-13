import type { WeredaNotificationBody } from "@/types/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Bell } from "lucide-react"

const WeredaNotification = ({ weredaNotifications }: { weredaNotifications: WeredaNotificationBody[] }) => {
  const navigate = useRouter()

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <CardTitle className="text-2xl font-bold flex items-center">
          <Bell className="mr-2" />
          የወረዳ ማሳወቂያዎች
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <TableRow>
              <TableHead className="text-white">መልዕክት</TableHead>
              <TableHead className="text-white">የሪፖርት ስም</TableHead>
              <TableHead className="text-white">የመርሃ ግብር ርዕስ</TableHead>
              <TableHead className="text-white">የመርሃ ግብር ሁኔታ</TableHead>
              <TableHead className="text-white">የመርሃ ግብር መጀመሪያ ጊዜ</TableHead>
              <TableHead className="text-white">የመርሃ ግብር መጨረሻ ጊዜ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weredaNotifications.map((notification) => (
              <TableRow
                key={notification.id}
                className="hover:bg-green-50 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  if (notification.report == null) {
                    navigate.push(`/dashboard/wereda-task-detail/${notification.id}`)
                  } else {
                    navigate.push(
                      `/dashboard/report-detail/${notification.schedule != null ? notification.schedule!.id : 0}`,
                    )
                  }
                }}
              >
                <TableCell className="line-clamp-2 font-medium">{notification.message}</TableCell>
                <TableCell>
                  {notification.report == null
                    ? notification.schedule == null
                      ? ""
                      : notification.schedule.status
                    : notification.report.name}
                </TableCell>
                <TableCell>{notification.schedule == null ? "" : notification.schedule.title}</TableCell>
                <TableCell>{notification.schedule == null ? "" : notification.schedule.status}</TableCell>
                <TableCell>
                  {format(
                    new Date(
                      notification.schedule?.startTime != null
                        ? notification.schedule?.startTime
                        : "2025-01-18T10:59:31.728Z",
                    ),
                    "PPpp",
                  )}
                </TableCell>
                <TableCell>
                  {format(
                    new Date(
                      notification.schedule?.endTime != null
                        ? notification.schedule?.endTime
                        : "2025-01-18T10:59:31.728Z",
                    ),
                    "PPpp",
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default WeredaNotification

