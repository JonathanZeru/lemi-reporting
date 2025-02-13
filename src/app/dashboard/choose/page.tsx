'use client'
import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiURL } from "@/utils/constants/constants"
import { Users, UserPlus, Building, Landmark, ChevronRight, Building2 } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"

interface MeseretawiOption {
  id: number
  firstName: string
  lastName: string
}

interface RegistrationCardProps {
  title: string
  description: string
  icon: React.ElementType
  to: string
}

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 size={24} />
          <h1 className="text-xl font-semibold">ብልጽግና ፓርቲ</h1>
        </div>
      </div>
    </header>
  )
}

const RegistrationCard: React.FC<RegistrationCardProps> = ({ title, description, icon: Icon, to }) => {
 
    if(title === "ሕዋስ"){
        return <Card className="h-full transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{title}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="mt-4 flex items-center text-sm text-blue-600">
          የሕዋስ አማራጮች ዝርዝሮችን ይመልከቱ ይመዝገቡ <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    
    }else{
        return <Link  href={to}>
        <Card className="h-full transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{title}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            ይመዝገቡ <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
      </Link>
    }
 
}

const ChooseRegistration: React.FC = () => {
  const { user } = useAuthStore()
  const router = useRouter()
  const [meseretawiOptions, setMeseretawiOptions] = useState<MeseretawiOption[]>([])
  if(user!.role !== "Admin"){
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="text-lg">You need to log in to access this page.</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Login
        </Button>
      </div>
    ) 
  }else{
  useEffect(() => {
    axios
      .get<MeseretawiOption[]>(`${apiURL}api/meseretawi`)
      .then((response) => {
        setMeseretawiOptions(response.data)
      })
      .catch((error) => {
        console.error("Error fetching Meseretawi options:", error)
      })
  }, [])
  
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <RegistrationCard
            title="መሠረታዊ"
            description="ለመሠረታዊ ምዝገባ"
            icon={UserPlus}
            to="/dashboard/meseretawi"
          />
          <RegistrationCard title="ዋና" description="ለዋና ምዝገባ" icon={Building} to="/dashboard/wana-registration" />
          <RegistrationCard title="ወረዳ" description="ለወረዳ ምዝገባ" icon={Landmark} to="/dashboard/wereda" />
        </div>

        {meseretawiOptions.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-4 text-slate-800">የሕዋስ አማራጮች </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meseretawiOptions.map((option) => (
                <Link
                  key={option.id}
                  href={`/dashboard/hiwas/${option.firstName}${option.lastName}/${option.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-slate-800">
                    {option.firstName} {option.lastName}
                  </h4>
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    ዝርዝሮችን ይመልከቱ <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
}

export default ChooseRegistration
