import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Link, useNavigate, useParams } from "react-router-dom"
import { apiURL } from "@/utils/constants/constants"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HiwasRegistrationFormData, hiwasRegistrationSchema } from "@/schemas/hiwasRegistrationSchema"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
const HiwasRegistration = () => {
  const { meseretawiName, meseretawiId } = useParams()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false) 

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<HiwasRegistrationFormData>({
    resolver: zodResolver(hiwasRegistrationSchema),
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

  const onSubmit = async (data: HiwasRegistrationFormData) => {
    setLoading(true)

    const body = {
      ...data,
      meseretawiDirijetName: meseretawiName,
      mdId: meseretawiId,
    }

    try {
      const response = await axios.post(`${apiURL}api/hiwas/register`, body)
      toast({
        title: "እንኳን ደህና መጡ",
        description: "ምዝገባው በተሳካ ሁኔታ ተጠናቅቋል",
      })
      navigate("/")
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
        <CardTitle>እባኮትን ተመዝገቡ</CardTitle>
        <CardDescription>ከታች ያለውን ቅፅ በትክክል ሙሉ። እናመሰግናለን።</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">ስም</Label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="firstName"
                  placeholder="እባኮትን ሕዋስ ስምዎን ያስገቡ"
                  aria-describedby="firstName-error"
                />
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
            <Label htmlFor="lastName">ሕዋስ ስም</Label>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input {...field} id="lastName" placeholder="ሕዋስ ስምዎን ያስገቡ" aria-describedby="lastName-error" />
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
            <Label htmlFor="email">ኢሜል</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="እባኮትን ኢሜልዎን ያስገቡ"
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
                  placeholder="እባኮትን ስልክ ቁጥርዎን ያስገቡ (እንደ ቁልፍ፤ +1234567890)"
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
                <Input {...field} id="userName" placeholder="እባኮትን የተጠቃሚ ስም ያስገቡ" aria-describedby="userName-error" />
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
                    type={showPassword ? "text" : "password"} // Toggle input type
                    placeholder="እባኮትን የተረጋጋ የይለፍ ቃል ያስገቡ"
                    aria-describedby="password-error"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                className="absolute inset-y-0 right-3 flex items-center text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <Alert variant="destructive">
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.password.message}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>የይለፍ ቃል ኃይል</Label>
              <Progress value={passwordStrength} className="w-full" />
              <p className="text-sm text-gray-500">
                {passwordStrength < 25 && "እጅግ ደካማ"}
                {passwordStrength >= 25 && passwordStrength < 50 && "ደካማ"}
                {passwordStrength >= 50 && passwordStrength < 75 && "አማካኝ"}
                {passwordStrength >= 75 && passwordStrength < 100 && "ጠንካራ"}
                {passwordStrength === 100 && "እጅግ ጠንካራ"}
              </p>
            </div>
            <ul className="list-disc list-inside text-sm text-gray-500">
              <li>ቢያንስ 8 ቁምፊዎች</li>
              <li>ቢያንስ አንድ ሁሉም አቃላት ያካትታል</li>
              <li>ቢያንስ አንድ በተወሰነ</li>
            </ul>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="submit" disabled={loading} onClick={handleSubmit(onSubmit)}>
          {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "ተመዝግብ"}
        </Button>
        <Link to="/" className="underline text-sm text-blue-500">
          ወደ መነሻ
        </Link>
      </CardFooter>
    </Card>
  )
}

export default HiwasRegistration
