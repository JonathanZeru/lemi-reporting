"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import Logo from "@/assets/pp.svg"
import {
  Book,
  Camera,
  Home,
  LogOutIcon,
  NewspaperIcon,
  PanelTopInactive,
  Settings,
  SwitchCameraIcon,
  Users,
  Workflow,
} from "lucide-react"
import TopNavBar from "@/layouts/TopNavBar"
import Link from "next/link"
import { useState } from "react"
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
    { title: "የእርሶ ህዋሶች", icon: <Camera className="w-4 h-4" />, link: "my-hiwas" },
    { title: "የመገለጫ ቅንብሮች", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
  Wereda: [
    { title: "ማስታወቂያ", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "እቅድ", icon: <Workflow className="w-4 h-4" />, link: "wereda-schedule" },
    { title: "የመገለጫ ቅንብሮች", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="text-lg">You need to log in to access this page.</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Login
        </Button>
      </div>
    )
  }

  const navigationList = navigationLists[user.role] || []

  const NavContent = () => (
    <ScrollArea className="flex flex-col h-full justify-center items-center ">
      <div className="flex flex-col items-center py-4">
        <Image src={Logo || "/placeholder.svg"} alt="Logo" width={128} height={128} />
        <Separator className="my-4" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">{`${user.firstName} ${user.lastName}`}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Badge>{user.role}</Badge>
        </div>
      </div>
      <nav className="flex-1 mt-4 justify-center items-center">
        {navigationList.map((item, index) => (
          <Link
            key={index}
            href={`/dashboard/${item.link}`}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${
              pathname === `/dashboard/${item.link}`
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-muted hover:text-gray-300"
            }`}
            onClick={() => setIsOpen(false)}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
        <Separator className="my-4" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="text-red-500 px-4 py-2 w-full border-0" size="sm">
              <LogOutIcon className="w-4 h-4" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription>
                Logging out will require you to log in again to access the dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </nav>
    </ScrollArea>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 border-r bg-background lg:block">
        <NavContent />
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-2 border-b lg:justify-end">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="text-left">
                <SheetTitle className="px-4 py-2 text-lg font-semibold">Menu</SheetTitle>
              </SheetHeader>
              <NavContent />
            </SheetContent>
          </Sheet>
          <TopNavBar />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

