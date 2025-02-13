"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuthStore } from "@/stores/authStore"
import Logo from "@/assets/pp.svg"
import { Home, Settings, Workflow, Camera, Users, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  icon: React.ReactNode
  link: string
}

const navigationLists: Record<string, NavItem[]> = {
  Hiwas: [
    { title: "Notification", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "Schedule", icon: <Settings className="w-4 h-4" />, link: "schedule" },
    { title: "Settings", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
  Wana: [
    { title: "Notification", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "Schedule", icon: <Workflow className="w-4 h-4" />, link: "wana" },
    { title: "Settings", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
  "Meseretawi Derejit": [
    { title: "Notification", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "My Hiwas", icon: <Camera className="w-4 h-4" />, link: "my-hiwas" },
    { title: "Settings", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
  Wereda: [
    { title: "Notification", icon: <Home className="w-4 h-4" />, link: "" },
    { title: "Schedule", icon: <Users className="w-4 h-4" />, link: "wereda-schedule" },
    { title: "Settings", icon: <Settings className="w-4 h-4" />, link: "settings" },
  ],
}

const SidebarComponent = () => {
  const { user, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigationList = user ? navigationLists[user.role] || [] : []

  const NavContent = () => (
    <ScrollArea className="flex flex-col h-full justify-center items-center">
      <div className="flex flex-col items-center py-4">
        <Image src={Logo || "/placeholder.svg"} alt="Logo" width={128} height={128} />
        <Separator className="my-4" />
        {user && (
          <div className="text-center">
            <h3 className="text-lg font-semibold">{`${user.firstName} ${user.lastName}`}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge>{user.role}</Badge>
          </div>
        )}
      </div>
      <SidebarContent>
        <SidebarMenu>
          {navigationList.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild isActive={pathname === `/dashboard/${item.link}`}>
                <Link href={`/dashboard/${item.link}`}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="my-4" />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
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
    </ScrollArea>
  )

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader>
                <SheetTitle className="px-4 py-2 text-lg font-semibold">Menu</SheetTitle>
              </SheetHeader>
              <NavContent />
            </SheetContent>
          </Sheet>
        </SidebarHeader>
        <div className="hidden lg:block">
          <NavContent />
        </div>
      </Sidebar>
    </SidebarProvider>
  )
}

export default SidebarComponent

