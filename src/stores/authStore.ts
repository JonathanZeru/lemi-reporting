"use client"

import { create } from "zustand"
import axios from "axios"
import { apiURL } from "@/utils/constants/constants"
import type { MeseretawiDirijet } from "@/types/types"

interface UserData {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
  mdId: number
  userName: string
  createdAt: string
  meseretawiDirijet: MeseretawiDirijet
}

interface AuthStore {
  user: UserData | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const getInitialState = () => {
  if (typeof window === "undefined") return { user: null, accessToken: null }

  try {
    return {
      user: JSON.parse(localStorage.getItem("user") || "null"),
      accessToken: localStorage.getItem("accessToken") || null,
    }
  } catch {
    return { user: null, accessToken: null }
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...getInitialState(),
  isLoading: false,
  error: null,
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${apiURL}api/auth/login`, { email, password })

      if (response.status === 200) {
        const { user, token } = response.data
        localStorage.setItem("accessToken", token)
        localStorage.setItem("user", JSON.stringify(user))

        set({
          user: user,
          accessToken: token,
        })
        return true
      } else {
        set({ error: "Login failed: " + response.data.message })
        return false
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || "An unexpected error occurred" })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
  logout: async () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    set({ user: null, accessToken: null })
  },
}))

