import type React from "react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useParams } from "react-router-dom"
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
import { AmharicWeredaReportFormData, amharicWeredaReportSchema } from "@/schemas/weredaReportingSchema"

export default function WeredaReportForm() {
  const { user, accessToken } = useAuthStore()
  const { reporter, reporterId, scheduleId } = useParams<{ reporter: string; reporterId: string; scheduleId: string }>()
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
        <CardTitle>የወረዳ ሪፖርት ማስገቢያ</CardTitle>
        <CardDescription>እባክዎን የሚከተለውን ቅጽ በመሙላት የወረዳ ሪፖርትዎን ያስገቡ። ሁሉም መረጃዎች ትክክለኛ እና ሙሉ መሆናቸውን ያረጋግጡ።</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">የሪፖርት ርዕስ</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} id="name" placeholder="እባክዎን ለወረዳ ሪፖርትዎ አጭር ርዕስ ያስገቡ" aria-describedby="name-error" />
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
            <Label htmlFor="description">የሪፖርት ማብራሪያ</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="እባክዎን ስለ ወረዳ ሪፖርትዎ ዝርዝር ማብራሪያ ይስጡ"
                  rows={5}
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
            <Label htmlFor="images">ምስሎች (ከ5 ባልበለጠ፣ እያንዳንዱ እስከ 5MB)</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, "images")}
              aria-describedby="images-error"
            />
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
            <Label htmlFor="pdfs">PDF ፋይሎች (ከ2 ባልበለጠ፣ እያንዳንዱ እስከ 10MB)</Label>
            <Input
              id="pdfs"
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => handleFileChange(e, "pdfs")}
              aria-describedby="pdfs-error"
            />
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
            <Label htmlFor="audio">ድምጽ (አማራጭ፣ እስከ 20MB)</Label>
            <Input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileChange(e, "audio")}
              aria-describedby="audio-error"
            />
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
            <Label htmlFor="video">ቪዲዮ (አማራጭ፣ እስከ 50MB)</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, "video")}
              aria-describedby="video-error"
            />
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
        <Button type="submit" disabled={loading} onClick={handleSubmit(onSubmit)} className="w-full">
          {loading ? "የወረዳ ሪፖርቱን በማስገባት ላይ..." : "የወረዳ ሪፖርቱን አስገባ"}
        </Button>
      </CardFooter>
    </Card>
  )
}

