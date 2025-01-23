"use client"

import { useAuthStore } from "@/stores/authStore"
import type { HiwasNotification, MeseretawiDirijetNotification, WeredaNotificationBody } from "@/types/types"
import { apiURL } from "@/utils/constants/constants"
import axios from "axios"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import MeseretawiNotification from "@/layouts/MeseretawiNotification"
import { useRouter } from "next/navigation"
import WeredaNotification from "@/layouts/WeredaNotification"
import WanaNotification from "@/layouts/WanaNotification"

export default function DashboardFront() {
  const { user } = useAuthStore()
  const [myHiwasNotifications, setHiwasNotifications] = useState<HiwasNotification[]>([])
  const [weredaNotifications, setWeredaNotifications] = useState<WeredaNotificationBody[]>([])
  const [myMeseretawiNotifications, setMeseretawiNotifications] = useState<MeseretawiDirijetNotification[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.role === "Hiwas") {
        const response = await axios.get(`${apiURL}api/hiwas/notification?hiwasId=${user.id}`)
        if (response.status === 200) {
          setHiwasNotifications(response.data)
        }
      } else if (user?.role === "Meseretawi Derejit") {
        const response = await axios.get(`${apiURL}api/meseretawi/notification?meseretawiDirijetId=${user.id}`)
        if (response.status === 200) {
          setMeseretawiNotifications(response.data)
        }
      } else if (user?.role === "Wereda") {
        const response = await axios.get(`${apiURL}api/wereda/notification?weredaId=${user.id}`)
        if (response.status === 200) {
          setWeredaNotifications(response.data)
        }
      }
    }

    if (user) {
      fetchNotifications()
    }
  }, [user])

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Dear Mr. {user?.firstName} {user?.lastName} you have the following notifications.
      </h1>
      {user?.role === "Hiwas" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message</TableHead>
              <TableHead>Meseretawi Name</TableHead>
              <TableHead>Meseretawi Email</TableHead>
              <TableHead>Meseretawi Phone</TableHead>
              <TableHead>Report Name</TableHead>
              <TableHead>Schedule Name</TableHead>
              <TableHead>Report Status</TableHead>
              <TableHead>Schedule Start Time</TableHead>
              <TableHead>Schedule End Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myHiwasNotifications.map((notification) => (
              <TableRow
                key={notification.id}
                className="hover:bg-slate-200"
                onClick={() => {
                  if (notification.report == null) {
                    router.push(`/dashboard/task-detail/${notification.id}`)
                  } else {
                    router.push(
                      `/dashboard/report-detail/${notification.schedule != null ? notification.schedule!.id : 0}`,
                    )
                  }
                }}
              >
                <TableCell>
                  <div className="line-clamp-2">{notification.message}</div>
                </TableCell>
                <TableCell>
                  {notification.hiwas.md.firstName} {notification.hiwas.md.lastName}
                </TableCell>
                <TableCell>{notification.hiwas.md.email}</TableCell>
                <TableCell>{notification.hiwas.md.phone}</TableCell>
                <TableCell>
                  {notification.report == null ? notification.schedule?.status : notification.report.name}
                </TableCell>
                <TableCell>{notification.schedule?.title}</TableCell>
                <TableCell>{notification.schedule?.status}</TableCell>
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
      )}
      {user?.role === "Meseretawi Derejit" && (
        <MeseretawiNotification myMeseretawiNotifications={myMeseretawiNotifications} />
      )}
      {user?.role === "Wereda" && <WeredaNotification weredaNotifications={weredaNotifications} />}
      {user?.role === "Wana" && <WanaNotification />}
      {!["Hiwas", "Meseretawi Derejit", "Wereda", "Wana"].includes(user?.role || "") && <h1>No notifications</h1>}
    </div>
  )
}

