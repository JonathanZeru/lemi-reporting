"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Bell, MessageSquare, User, LogOut, Home, Settings, Workflow, Camera, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/authStore"
import Logo from "@/assets/pp.svg"

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

const Header: React.FC = () => {
  const { user, logout } = useAuthStore()
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger onClick={toggleSidebar} />
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Dashboard</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {/* <AvatarImage src={user?.avatarUrl} alt={user?.firstName} /> */}
                <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

const SidebarContentComponent: React.FC = () => {
  const { user } = useAuthStore()
  const navigationList = user ? navigationLists[user.role] || [] : []

  return (
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
              <SidebarMenuButton asChild>
                <Link href={`/dashboard/${item.link}`}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline" className="w-full" onClick={() => useAuthStore.getState().logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </ScrollArea>
  )
}

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center px-4">
              <Image src={Logo || "/placeholder.svg"} alt="Logo" width={32} height={32} />
              <span className="ml-2 text-lg font-bold">Dashboard</span>
            </Link>
          </SidebarHeader>
          <SidebarContentComponent />
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

