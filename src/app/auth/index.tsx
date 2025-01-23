import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import banner from "@/assets/pp.svg"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useState } from "react"
import "react-toastify/dist/ReactToastify.css"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "../../components/ui/use-toast"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react"

export default function SignIn() {
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const isSuccess = await login(email, password)
      const user = JSON.parse(localStorage.getItem("user") || "null")
      const accessToken = localStorage.getItem("accessToken") || "null"

      if (accessToken && isSuccess) {
        navigate("/dashboard")
        toast({
          title: "እንኳን ደህና መጡ",
          description: `በተሳካ ሁኔታ ገብተዋል! እንኳን ደህና መጡ፣ ${user.firstName} ${user.lastName}`,
        })
      } else {
        console.log(error)
        toast({
          title: "ስህተት",
          description: error || "የመግቢያ ስህተት",
        })
      }
    } catch (err) {
      toast({
        title: "ስህተት",
        description: error || "መግባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
      })
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 hidden lg:block">
        <img src={banner || "/placeholder.svg"}
        width={400}
        height={400}
         alt="Banner" className="object-cover m-auto" />
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">ይግቡ</CardTitle>
            <CardDescription className="text-center">እባክዎን ወደ መለያዎ ለመግባት ዝርዝርዎን ያስገቡ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                ኢሜል
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
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
                  className="w-full px-3 py-2 border rounded-md pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="button" className="w-full" onClick={handleLogin} disabled={isLoading}>
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
            <div className="text-sm text-center">
              መለያ የለዎትም?{" "}
              <Link to="/choose" className="text-blue-600 hover:underline">
                ይመዝገቡ
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

