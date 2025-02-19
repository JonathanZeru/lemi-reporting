"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Logo from "@/assets/pp.svg"
import { Camera, Home, LogOutIcon, Settings, Workflow, Menu, User } from "lucide-react"
import TopNavBar from "@/layouts/TopNavBar"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/authStore"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"

interface NavItem {
  title: string
  icon: React.ReactNode
  link: string
}

const navigationLists: Record<string, NavItem[]> = {
  Hiwas: [
    { title: "ማስታወቂያ", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "እቅድ", icon: <Workflow className="w-4 h-4" />, link: "schedule" },
    { title: "የመገለጫ ቅንብሮች", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
  Wana: [
    { title: "ማስታወቂያ", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "እቅድ", icon: <Workflow className="w-4 h-4" />, link: "wana" },
    { title: "የመገለጫ ቅንብሮች", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
  "Meseretawi Derejit": [
    { title: "ማስታወቂያ", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "የእርሶ የብልጽግና ቤተሰቦች", icon: <Camera className="w-4 h-4" />, link: "my-hiwas" },
    { title: "የመገለጫ ቅንብሮች", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
  Wereda: [
    { title: "ማስታወቂያ", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "እቅድ", icon: <Workflow className="w-4 h-4" />, link: "wereda-schedule" },
    { title: "የመገለጫ ቅንብሮች", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
  Admin: [
    { title: "ማስታወቂያ", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "እቅድ", icon: <Workflow className="w-4 h-4" />, link: "wana" },
    { title: "ይመዝገቡ", icon: <User className="w-4 h-4" />, link: "choose" },
    { title: "የብልጽግና ቤተሰቦች", icon: <Workflow className="w-4 h-4" />, link: "user/1" },
    { title: "የብልጽግና ህብረት", icon: <Workflow className="w-4 h-4" />, link: "user/2" },
    { title: "የአቅም ግንባታ እና ፖለቲካ ዘርፍ ሀላፊ", icon: <Workflow className="w-4 h-4" />, link: "user/3" },
    { title: "ወረዳ", icon: <Workflow className="w-4 h-4" />, link: "user/4" },
    { title: "የመገለጫ ቅንብሮች", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [loadingPage, setLoadingPage] = useState(true)

  useEffect(() => {
    checkAuth()
    setLoadingPage(false)
  }, [checkAuth])

  const logout = () => {
    setLoadingPage(true)
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
    router.push("/")
  }

  if (loadingPage) {
    return <LoadingSpinner />
  } else {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
          <h1 className="text-3xl font-bold text-white mb-4">ያልተፈቀደ መድረሻ</h1>
          <p className="text-xl text-white mb-6">ይህንን ገፅ ለመጠቀም መጀመሪያ መግባት አለበዎት.</p>
          <Button onClick={() => router.push("/")} className="bg-white text-blue-500 hover:bg-blue-100">
          ይግቡ
          </Button>
        </div>
      )
    }
  }

  const navigationList = navigationLists[user.role] || []

  const NavContent = () => (
    <ScrollArea className="flex flex-col h-full py-6 bg-gradient-to-b from-blue-500 to-purple-600">
      <div className="flex flex-col items-center py-6">
        <Image
          src={Logo || "/placeholder.svg"}
          alt="Logo"
          width={100}
          height={100}
          className=""
        />
        <div className="text-center mt-4">
          <h3 className="text-xl font-semibold text-white">{`${user.firstName} ${user.lastName}`}</h3>
          <p className="text-sm text-blue-100">{user.email}</p>
          <Badge className="mt-2 bg-white text-blue-500">{user.role}</Badge>
        </div>
      </div>
      <Separator className="my-4" />
      <nav className="flex-1 px-4">
        {navigationList.map((item, index) => (
          <Link
            key={index}
            href={`/dashboard/${item.link}`}
            className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
              pathname === `/dashboard/${item.link}`
                ? "bg-white text-primary"
                : "text-white hover:bg-blue-100 hover:text-blue-500"
            }`}
            onClick={() => setIsOpen(false)}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </nav>
      <Separator className="my-4" />
      <div className="px-4 pb-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600">
              <LogOutIcon className="w-4 h-4 mr-2" />
              ይዉጡ
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ዘግተህ መውጣት መፈለገዎትን ያረጋግጡ?</AlertDialogTitle>
              <AlertDialogDescription>
              መውጣት   ከወጡ ቦሀላ ዳሽቦርዱን ለመጠቀም እንደገና መግባትን ይጠበቅበወታል።
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ተዉ</AlertDialogCancel>
              <AlertDialogAction onClick={logout} className="bg-red-500 text-white hover:bg-red-600">
              ይዉጡ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ScrollArea>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="hidden w-64 border-r bg-white shadow-lg lg:block">
        <NavContent />
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-blue-500 to-purple-600 border-b shadow-sm lg:justify-end">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="text-left px-4 py-6 bg-gradient-to-r from-blue-500 to-purple-600">
                <SheetTitle className="text-2xl font-bold text-white">Dashboard Menu</SheetTitle>
              </SheetHeader>
              <NavContent />
            </SheetContent>
          </Sheet>
          <TopNavBar />
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}

