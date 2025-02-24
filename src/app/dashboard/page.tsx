"use client"

import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import banner from "@/assets/pp.svg"
import Image from "next/image"

export default function DashboardFront() {
  const { user } = useAuthStore()
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Card className="mb-8 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="w-full flex justify-center items-center mb-8 md:mb-0">
          <Image
            src={banner || "/placeholder.svg"}
            width={100}
            height={100}
            alt="Banner"
            className="md:w-64 md:h-64 w-48 h-48 object-contain mb-4 md:mb-8"
          />
          <div className="text-center text-white text-lg md:text-2xl font-bold leading-tight mb-6 md:mb-0 px-4 py-2 bg-black bg-opacity-30 rounded-lg backdrop-blur-sm">
          ውድ {user?.firstName} {user?.lastName}፣ እንኳን ወደ ለሚ ኩራ ክ/ከተማ ብልጽግና ፖርቲ ቅርንጫፍ ፅ/ቤት
            ቤተሰብ እና ህብረት ሪፖርት ሲስተም በደህና መጡ።
          </div>
        </div>
        </CardHeader>
      </Card>

    </div>
  )
}
