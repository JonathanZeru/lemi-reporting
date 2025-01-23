import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from "axios"
import { useEffect, useState } from "react"
import { apiURL } from "@/utils/constants/constants"
import { toast } from "@/components/ui/use-toast"

interface Office {
  id: number
  name: string
}

export default function AddOffice() {
  const [officeData, setOfficeData] = useState({
    name: "",
    desctiption: "",
  })

  const [loading, setLoading] = useState(false)
  const [offices, setOffices] = useState<Office[]>([])

  const fetchOffices = async () => {
    try {
      const response = await axios.get(`${apiURL}api/office`)
      setOffices(response.data.data)
    } catch (error) {
      console.error("Error fetching offices:", error)
      toast({
        title: "Error",
        description: "Failed to fetch offices.",
      })
    }
  }

  useEffect(() => {
    fetchOffices()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setOfficeData({ ...officeData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(`${apiURL}api/office/create`, officeData)
      toast({
        title: "Success",
        description: "Office added successfully",
      })
      setOfficeData({ name: "", desctiption: "" })
      fetchOffices()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add office",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto p-2">
      <CardHeader>
        <CardTitle>Add New Office</CardTitle>
        <CardDescription>Create a new office in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Office Name</Label>
            <Input
              id="name"
              name="name"
              value={officeData.name}
              onChange={handleChange}
              placeholder="Enter office name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desctiption">Office Description</Label>
            <Input
              id="desctiption"
              name="desctiption"
              value={officeData.desctiption}
              onChange={handleChange}
              placeholder="Enter office description"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding Office..." : "Add Office"}
          </Button>
        </form>
        <div className="w-full h-32">
          <h3 className="text-lg font-semibold">Existing Offices</h3>
          <ScrollArea className="h-[200px]">
            {offices.length > 0 ? (
              <ul className="space-y-2">
                {offices.map((office) => (
                  <li key={office.id} className="bg-secondary p-2 rounded-md">
                    {office.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No offices found.</p>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}