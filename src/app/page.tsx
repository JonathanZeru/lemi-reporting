"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import banner from "@/assets/pp.svg"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import NextTopLoader from "nextjs-toploader"
import type React from "react" // Added import for React

export default function SignIn() {
  const { login, isLoading, error, user } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const isSuccess = await login(email, password)
      if (isSuccess) {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        toast({
          title: "እንኳን ደህና መጡ",
          description: `በተሳካ ሁኔታ ገብተዋል! እንኳን ደህና መጡ፣ ${user.firstName} ${user.lastName}`,
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "ስህተት",
          description: error || "የመግቢያ ስህተት",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "ስህተት",
        description: "መግባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
        variant: "destructive",
      })
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState)
  }

  return (
    <>
      <NextTopLoader
        color="#0070f3"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex flex-col md:flex-row justify-center items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md md:w-1/2 md:max-w-none md:flex-1 flex justify-center items-center mb-8 md:mb-0">
          <Image
            src={banner || "/placeholder.svg"}
            width={300}
            height={300}
            alt="Banner"
            className=" "
          />
        </div>
        <div className="w-full max-w-md md:w-1/2 md:max-w-none md:flex-1">
          <Card className="w-full backdrop-blur-md bg-white/90 dark:bg-gray-800/90 shadow-xl rounded-2xl border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                ይግቡ
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                እባክዎን ወደ መለያዎ ለመግባት ዝርዝርዎን ያስገቡ
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    ኢሜል
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    የይለፍ ቃል
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border rounded-md pr-10 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      በመግባት ላይ...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <LogIn className="mr-2 h-4 w-4" /> ይግቡ
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}

