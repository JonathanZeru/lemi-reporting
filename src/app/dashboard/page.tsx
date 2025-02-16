"use client"

import { useAuthStore } from "@/stores/authStore"
import type { HiwasNotification, MeseretawiDirijetNotification, WeredaNotificationBody } from "@/types/types"
import { apiURL } from "@/utils/constants/constants"
import axios from "axios"
import { useEffect, useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import MeseretawiNotification from "@/layouts/MeseretawiNotification"
import { useRouter } from "next/navigation"
import WeredaNotification from "@/layouts/WeredaNotification"
import WanaNotification from "@/layouts/WanaNotification"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardFront() {
  const { user } = useAuthStore()
  const [myHiwasNotifications, setHiwasNotifications] = useState<HiwasNotification[]>([])
  const [weredaNotifications, setWeredaNotifications] = useState<WeredaNotificationBody[]>([])
  const [myMeseretawiNotifications, setMeseretawiNotifications] = useState<MeseretawiDirijetNotification[]>([])
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

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

  const filteredAndSortedNotifications = useMemo(() => {
    return myHiwasNotifications
      .filter((notification) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          notification.message.toLowerCase().includes(searchLower) ||
          notification.hiwas.md.firstName.toLowerCase().includes(searchLower) ||
          notification.hiwas.md.lastName.toLowerCase().includes(searchLower) ||
          notification.hiwas.md.email.toLowerCase().includes(searchLower) ||
          (notification.report?.name?.toLowerCase().includes(searchLower) ?? false) ||
          (notification.schedule?.title?.toLowerCase().includes(searchLower) ?? false)
        )
      })
      .sort((a, b) => {
        let aValue, bValue
        switch (sortBy) {
          case "message":
            aValue = a.message
            bValue = b.message
            break
          case "meseretawiName":
            aValue = `${a.hiwas.md.firstName} ${a.hiwas.md.lastName}`
            bValue = `${b.hiwas.md.firstName} ${b.hiwas.md.lastName}`
            break
          case "reportName":
            aValue = a.report?.name ?? ""
            bValue = b.report?.name ?? ""
            break
          case "scheduleName":
            aValue = a.schedule?.title ?? ""
            bValue = b.schedule?.title ?? ""
            break
          case "status":
            aValue = a.schedule?.status ?? ""
            bValue = b.schedule?.status ?? ""
            break
          default:
            aValue = new Date(a.schedule?.startTime ?? 0).getTime()
            bValue = new Date(b.schedule?.startTime ?? 0).getTime()
        }
        return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
      })
  }, [myHiwasNotifications, searchTerm, sortBy, sortOrder])

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Card className="mb-8 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Bell className="mr-2" />
            ማሳወቂያዎች
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mt-2">
            ውድ {user?.firstName} {user?.lastName}፣ እነዚህ የእርስዎ ማሳወቂያዎች ናቸው።
          </p>
        </CardContent>
      </Card>

      {user?.role === "Hiwas" && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <Input
              type="text"
              placeholder="ማሳወቂያዎችን ይፈልጉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="መደርደሪያ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">ቀን</SelectItem>
                <SelectItem value="message">መልዕክት</SelectItem>
                <SelectItem value="meseretawiName">የመሰረታዊ ድርጅት ስም</SelectItem>
                <SelectItem value="reportName">የሪፖርት ስም</SelectItem>
                <SelectItem value="scheduleName">የመርሃ ግብር ስም</SelectItem>
                <SelectItem value="status">ሁኔታ</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white"
              aria-label={`ደርድር ${sortOrder === "asc" ? "ወደታች" : "ወደላይ"}`}
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="sr-only">{sortOrder === "asc" ? "ወደታች ደርድር" : "ወደላይ ደርድር"}</span>
            </Button>
          </div>
          <Card className="overflow-hidden shadow-xl">
            <Table>
              <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <TableRow>
                  <TableHead className="text-white">መልዕክት</TableHead>
                  <TableHead className="text-white">የመሰረታዊ ድርጅት ስም</TableHead>
                  <TableHead className="text-white">የመሰረታዊ ድርጅት ኢሜይል</TableHead>
                  <TableHead className="text-white">የመሰረታዊ ድርጅት ስልክ</TableHead>
                  <TableHead className="text-white">የሪፖርት ስም</TableHead>
                  <TableHead className="text-white">የመርሃ ግብር ስም</TableHead>
                  <TableHead className="text-white">የሪፖርት ሁኔታ</TableHead>
                  <TableHead className="text-white">የመርሃ ግብር መጀመሪያ ጊዜ</TableHead>
                  <TableHead className="text-white">የመርሃ ግብር መጨረሻ ጊዜ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedNotifications.map((notification) => (
                  <TableRow
                    key={notification.id}
                    className="hover:bg-blue-50 transition-colors duration-200"
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
          </Card>
        </>
      )}
      {user?.role === "Meseretawi Derejit" && (
        <MeseretawiNotification myMeseretawiNotifications={myMeseretawiNotifications} />
      )}
      {user?.role === "Wereda" && <WeredaNotification weredaNotifications={weredaNotifications} />}
      {(user?.role === "Wana" || user?.role === "Admin") && <WanaNotification />}
      {!["Hiwas", "Meseretawi Derejit", "Wereda", "Wana"].includes(user?.role || "") && (
        <Card>
          <CardContent>
            <h1 className="text-xl font-semibold">ምንም ማሳወቂያ የለም</h1>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
