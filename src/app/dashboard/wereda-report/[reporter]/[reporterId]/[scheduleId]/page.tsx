"use client"
import type React from "react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/stores/authStore"
import { apiURL } from "@/utils/constants/constants"
import { AlertCircle, FileText, ImageIcon, Mic, Video, X } from "lucide-react"
import { type AmharicWeredaReportFormData, amharicWeredaReportSchema } from "@/schemas/weredaReportingSchema"

export default function WeredaReportForm() {
  const { user, accessToken } = useAuthStore()
  const params = useParams<{ reporter: string; reporterId: string; scheduleId: string }>()
  const reporter = params?.reporter || ""
  const reporterId = params?.reporterId || ""
  const scheduleId = params?.scheduleId || ""
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AmharicWeredaReportFormData>({
    resolver: zodResolver(amharicWeredaReportSchema),
    defaultValues: {
      name: "",
      description: "",
      images: [],
      pdfs: [],
      month: "",
      presentEmployees: "0",
      absentEmployees: "0"
    },
  })

  const watchImages = watch("images")
  const watchPdfs = watch("pdfs")
  const watchAudio = watch("audio")
  const watchVideo = watch("video")

  const onSubmit = async (data: AmharicWeredaReportFormData) => {
    setLoading(true)
    const formData = new FormData()

    // Append form fields
    formData.append("name", data.name)
    formData.append("description", data.description)
    formData.append("firstName", user?.firstName || "")
    formData.append("lastName", user?.lastName || "")
    formData.append("weredaId", user?.id?.toString() || "")
    formData.append("scheduleId", scheduleId || "")
    formData.append("month", data.month)
    formData.append("presentEmployees", data.presentEmployees.toString())
    formData.append("absentEmployees", data.absentEmployees.toString())

    // Append files
    data.images?.forEach((image) => formData.append("reportImages", image))
    data.pdfs?.forEach((pdf) => formData.append("reportPdfs", pdf))
    if (data.audio) formData.append("audio", data.audio)
    if (data.video) formData.append("video", data.video)

    try {
      const response = await axios.post(`${apiURL}api/wereda/create-report`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (response.status === 201) {
        if (response.data.error === "A report for this schedule already exists") {
          toast({
            title: "መረጃ",
            description: "ለዚህ መርሃ ግብር ሪፖርት አስቀድሞ ተመዝግቧል።",
          })
        } else {
          toast({
            title: "ተሳክቷል",
            description: "የወረዳ ሪፖርቱ በተሳካ ሁኔታ ተመዝግቧል!",
          })
        }
      } else {
        throw new Error(response.data.error || "ሪፖርቱን መመዝገብ አልተቻለም")
      }
    } catch (error) {
      toast({
        title: "ስህተት",
        description: `የወረዳ ሪፖርቱን መመዝገብ አልተቻለም: ${error instanceof Error ? error.message : "ያልታወቀ ስህተት"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "images" | "pdfs" | "audio" | "video",
  ) => {
    if (e.target.files) {
      if (fieldName === "images" || fieldName === "pdfs") {
        setValue(fieldName, Array.from(e.target.files))
      } else {
        setValue(fieldName, e.target.files[0])
      }
    }
  }

  const handleRemoveFile = (index: number, fieldName: "images" | "pdfs") => {
    const currentFiles = watch(fieldName) || []
    setValue(
      fieldName,
      currentFiles.filter((_, i) => i !== index),
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-600">የወረዳ ሪፖርት ማስገቢያ</CardTitle>
        <CardDescription className="text-gray-600">
          እባክዎን የሚከተለውን ቅጽ በመሙላት የወረዳ ሪፖርትዎን ያስገቡ። ሁሉም መረጃዎች ትክክለኛ እና ሙሉ መሆናቸውን ያረጋግጡ።
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              የሪፖርት ርዕስ
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder="እባክዎን ለወረዳ ሪፖርትዎ አጭር ርዕስ ያስገቡ"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="name-error"
                />
              )}
            />
            {errors.name && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              ዝርዝር መግለጫ
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="እባክዎን ስለ ወረዳ ሪፖርትዎ ዝርዝር ማብራሪያ ይስጡ"
                  rows={5}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="description-error"
                />
              )}
            />
            {errors.description && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.description.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="month" className="text-sm font-medium text-gray-700">
              ወር
            </Label>
            <Controller
              name="month"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="month"
                  placeholder="የስብሰባው ወር"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="month-error"
                />
              )}
            />
            {errors.month && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.month.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="presentEmployees" className="text-sm font-medium text-gray-700">
              የተገኙ ሰራተኞች ብዛት
            </Label>
            <Controller
              name="presentEmployees"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="presentEmployees"
                  type="number"
                  placeholder="የተገኙ ሰራተኞች ብዛት"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="presentEmployees-error"
                />
              )}
            />
            {errors.presentEmployees && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.presentEmployees.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="absentEmployees" className="text-sm font-medium text-gray-700">
              ያልተገኙ ሰራተኞች ብዛት
            </Label>
            <Controller
              name="absentEmployees"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="absentEmployees"
                  type="number"
                  placeholder="ያልተገኙ ሰራተኞች ብዛት"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="absentEmployees-error"
                />
              )}
            />
            {errors.absentEmployees && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.absentEmployees.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-medium text-gray-700">
              ምስሎች (ከ5 ባልበለጠ፣ እያንዳንዱ እስከ 5MB)
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="images"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">ምስሎችን ለመጫን ጠቅ ያድርጉ</span> ወይም ይጎትቱ እና ይጣሉ
                  </p>
                </div>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "images")}
                  aria-describedby="images-error"
                />
              </label>
            </div>
            {errors.images && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.images.message}</AlertDescription>
              </Alert>
            )}
            {watchImages && watchImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-2">
                {watchImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`የተመረጠ ምስል ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => handleRemoveFile(index, "images")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfs" className="text-sm font-medium text-gray-700">
              PDF ፋይሎች (ከ2 ባልበለጠ፣ እያንዳንዱ እስከ 10MB)
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="pdfs"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">PDF ፋይሎችን ለመጫን ጠቅ ያድርጉ</span> ወይም ይጎትቱ እና ይጣሉ
                  </p>
                </div>
                <Input
                  id="pdfs"
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "pdfs")}
                  aria-describedby="pdfs-error"
                />
              </label>
            </div>
            {errors.pdfs && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.pdfs.message}</AlertDescription>
              </Alert>
            )}
            {watchPdfs && watchPdfs.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {watchPdfs.map((pdf, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                    <span className="text-sm truncate">{pdf.name}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveFile(index, "pdfs")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio" className="text-sm font-medium text-gray-700">
              ድምጽ (አማራጭ፣ እስከ 20MB)
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="audio"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Mic className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">ድምጽ ፋይል ለመጫን ጠቅ ያድርጉ</span> ወይም ይጎትቱ እና ይጣሉ
                  </p>
                </div>
                <Input
                  id="audio"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "audio")}
                  aria-describedby="audio-error"
                />
              </label>
            </div>
            {errors.audio && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.audio.message}</AlertDescription>
              </Alert>
            )}
            {watchAudio && (
              <div className="mt-2">
                <audio controls src={URL.createObjectURL(watchAudio)} className="w-full" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="video" className="text-sm font-medium text-gray-700">
              ቪዲዮ (አማራጭ፣ እስከ 50MB)
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="video"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Video className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">ቪዲዮ ፋይል ለመጫን ጠቅ ያድርጉ</span> ወይም ይጎትቱ እና ይጣሉ
                  </p>
                </div>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "video")}
                  aria-describedby="video-error"
                />
              </label>
            </div>
            {errors.video && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ስህተት</AlertTitle>
                <AlertDescription>{errors.video.message}</AlertDescription>
              </Alert>
            )}
            {watchVideo && (
              <div className="mt-2">
                <video controls src={URL.createObjectURL(watchVideo)} className="w-full" />
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          disabled={loading}
          onClick={handleSubmit(onSubmit)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? "የወረዳ ሪፖርቱን በማስገባት ላይ..." : "የወረዳ ሪፖርቱን አስገባ"}
        </Button>
      </CardFooter>
    </Card>
  )
}

