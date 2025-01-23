import React, { useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/components/ui/use-toast'
import { apiURL } from '@/utils/constants/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const { user, accessToken } = useAuthStore()
  const [loading, setLoading] = useState<boolean>(false)
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New password and confirm password do not match.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(`${apiURL}api/users/auth/change-password`, 
        { 
          id: user?.id, 
          oldPassword: formData.oldPassword, 
          newPassword: formData.newPassword 
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
        }
      )

      if (response.status === 200) {
        toast({
          title: 'Success',
          description: 'Password changed successfully!',
        })
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        toast({
          title: 'Error',
          description: `Error: ${response.data.error}`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while changing password.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const togglePasswordVisibility = (field: 'oldPassword' | 'newPassword' | 'confirmPassword') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                name="oldPassword"
                type={showPasswords.oldPassword ? "text" : "password"}
                value={formData.oldPassword}
                placeholder="Enter your current password"
                onChange={handleInputChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('oldPassword')}
              >
                {showPasswords.oldPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.newPassword ? "text" : "password"}
                value={formData.newPassword}
                placeholder="Enter your new password"
                onChange={handleInputChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('newPassword')}
              >
                {showPasswords.newPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                placeholder="Confirm your new password"
                onChange={handleInputChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirmPassword')}
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}