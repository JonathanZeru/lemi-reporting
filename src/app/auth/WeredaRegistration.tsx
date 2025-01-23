import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { apiURL } from "@/utils/constants/constants"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { WeredaRegistrationFormData, weredaRegistrationSchema } from "@/schemas/weredaRegsitrationSchema"

const WeredaRegistration = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WeredaRegistrationFormData>({
    resolver: zodResolver(weredaRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      userName: "",
      password: "",
    },
  })

  const password = watch("password")

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 12.5
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5
    return strength
  }

  const passwordStrength = calculatePasswordStrength(password || "")

  const onSubmit = async (data: WeredaRegistrationFormData) => {
    setLoading(true)

    try {
      const response = await axios.post(`${apiURL}api/wereda/register`, data)
      if (response.status === 201) {
        toast({
          title: "እንኳን ደህና መጡ",
          description: "ምዝገባው በተሳካ ሁኔታ ተጠናቅቋል",
        })
        navigate("/")
      } else {
        throw new Error(response.data.message || "ምዝገባው አልተሳካም")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "አልተሳካም",
        description: `ምዝገባው አልተሳካም! ${error instanceof Error ? error.message : "ያልታወቀ ስህተት"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>የወረዳ ምዝገባ</CardTitle>
        <CardDescription>እባክዎን የወረዳ ተጠቃሚ ለመመዝገብ የሚከተለውን ቅጽ ይሙሉ።</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">ወረዳ ስም</Label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input {...field} id="firstName" placeholder="ወረዳ ስምዎን ያስገቡ" aria-describedby="firstName-error" />
              )}
            />
            {errors.firstName && (
              <Alert variant="destructive">
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.firstName.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">ወረዳ ስም</Label>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input {...field} id="lastName" placeholder="ወረዳ ስም ያስገቡ" aria-describedby="lastName-error" />
              )}
            />
            {errors.lastName && (
              <Alert variant="destructive">
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.lastName.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">ኢሜይል</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="የኢሜይል አድራሻዎን ያስገቡ"
                  aria-describedby="email-error"
                />
              )}
            />
            {errors.email && (
              <Alert variant="destructive">
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.email.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">ስልክ ቁጥር</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="phone"
                  type="tel"
                  placeholder="ስልክ ቁጥርዎን ያስገቡ (ምሳሌ፡ +251912345678)"
                  aria-describedby="phone-error"
                />
              )}
            />
            {errors.phone && (
              <Alert variant="destructive">
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.phone.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">የተጠቃሚ ስም</Label>
            <Controller
              name="userName"
              control={control}
              render={({ field }) => (
                <Input {...field} id="userName" placeholder="የተጠቃሚ ስም ይምረጡ" aria-describedby="userName-error" />
              )}
            />
            {errors.userName && (
              <Alert variant="destructive">
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.userName.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">የይለፍ ቃል</Label>
            <div className="relative">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="ጠንካራ የይለፍ ቃል ያስገቡ"
                    aria-describedby="password-error"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <Alert variant="destructive">
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.password.message}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>የይለፍ ቃል ጥንካሬ</Label>
              <Progress value={passwordStrength} className="w-full" />
              <p className="text-sm text-gray-500">
                {passwordStrength < 25 && "በጣም ደካማ"}
                {passwordStrength >= 25 && passwordStrength < 50 && "ደካማ"}
                {passwordStrength >= 50 && passwordStrength < 75 && "መካከለኛ"}
                {passwordStrength >= 75 && passwordStrength < 100 && "ጠንካራ"}
                {passwordStrength === 100 && "በጣም ጠንካራ"}
              </p>
            </div>
            <ul className="list-disc list-inside text-sm text-gray-500">
              <li>ቢያንስ 8 ፊደላት ርዝመት</li>
              <li>ቢያንስ አንድ ከፍተኛ ፊደል</li>
              <li>ቢያንስ አንድ ትንሽ ፊደል</li>
              <li>ቢያንስ አንድ ቁጥር</li>
              <li>ቢያንስ አንድ ልዩ ምልክት</li>
            </ul>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="submit" disabled={loading} onClick={handleSubmit(onSubmit)}>
          {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "ይመዝገቡ"}
        </Button>
        <Link to="/">
          <Button variant="outline">ወደ መግቢያ ይመለሱ</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default WeredaRegistration

