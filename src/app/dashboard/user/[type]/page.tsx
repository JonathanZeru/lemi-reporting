
"use client"

import { UserManagementPage } from "@/components/user/user-management-page"

import { useParams } from "next/navigation"

export default function Users() {
  const { type } = useParams() as { type: string }
  if (!type) {
    return <div>Invalid user ID. Please specify a valid number in the URL.</div>
  }
  return <UserManagementPage type={type}/>
}