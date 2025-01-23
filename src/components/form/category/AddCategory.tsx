import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/components/ui/use-toast'
import { apiURL } from '@/utils/constants/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Category {
  id: number
  name: string
}

export default function AddCategory() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const { user, accessToken } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        createdById: user.id,
      }))
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiURL}api/category`)
      setCategories(response.data.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: 'Error',
        description: 'Failed to load categories.',
      })
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value as string)
    })

    try {
      const response = await axios.post(`${apiURL}api/category/create`, form, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      })

      if (response.status === 201) {
        fetchCategories()
        toast({
          title: 'Success',
          description: 'Category created successfully!',
        })
        setFormData({ name: "", description: "" }) // Reset form after successful submission
      } else {
        toast({
          title: 'Error',
          description: `Error: ${response.data.message}`,
        })
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating category.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <Card className="w-full lg:max-w-3xl mx-auto p-2">
      <CardHeader>
        <CardTitle>Add Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Title</Label>
            <Input
              id="name"
              name="name"
                placeholder="Enter category title"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Category Description</Label>
            <Input
              id="description"
              name="description"
                placeholder="Enter category description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding Category...' : 'Add Category'}
          </Button>
        </form>
      <div className="flex flex-col h-32">
        <h3 className="text-lg font-semibold mb-2">Existing Categories</h3>
        <ScrollArea className="h-[200px] w-full">
          {categories.length > 0 ? (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id} className="bg-secondary p-2 rounded">
                  {cat.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No categories found.</p>
          )}
        </ScrollArea>
      </div>
      </CardContent>
    </Card>
  )
}