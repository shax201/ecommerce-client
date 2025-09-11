"use client"

import { ClientData } from "../../client.interface"
import { updateClient } from "../../clients-data"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Upload,
  X
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface ClientEditFormProps {
  client: ClientData
}

export function ClientEditForm({ client }: ClientEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    password: "", // Empty for edit, only update if provided
    phone: client.phone.toString(),
    address: client.address,
    status: client.status,
    image: client.image || ""
  })

  // Get initials for avatar fallback
  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For now, we'll just store the file name
      // In a real app, you'd upload to a service like Cloudinary
      setFormData(prev => ({
        ...prev,
        image: file.name
      }))
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ""
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare the data to send
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: parseInt(formData.phone),
        address: formData.address,
        status: formData.status
      }

      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password
      }

      // Only include image if it's provided
      if (formData.image.trim()) {
        updateData.image = formData.image
      }

      const result = await updateClient(client._id, updateData)

      if (result.success) {
        toast.success("Client updated successfully!")
        router.push(`/clients/${client._id}`)
      } else {
        toast.error(result.message || "Failed to update client")
      }
    } catch (error) {
      console.error("Error updating client:", error)
      toast.error("An error occurred while updating the client")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40 shadow-sm">
        <div className="container mx-auto py-4 px-4 md:px-6 lg:px-8 flex items-center justify-between">
          <Link href={`/clients/${client._id}`}>
            <Button variant="ghost" className="pl-0 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Client Details
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/clients/${client._id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              form="client-edit-form" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Client
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Profile image and Preview */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Profile Image</CardTitle>
                <CardDescription>
                  Update client profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pb-6">
                <Avatar className="h-40 w-40 border-4 border-primary/10 mb-6">
                  {formData.image ? (
                    <AvatarImage src={formData.image} alt={`${formData.firstName} ${formData.lastName}`} />
                  ) : (
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/80 to-primary">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="relative flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer w-full">
                      <Button type="button" variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </Label>
                  </div>
                  {formData.image && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={removeImage}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Client Preview Card - Fixed Position */}
            <div className="sticky top-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Client Preview</CardTitle>
                  <CardDescription>
                    Live preview of client data
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    {/* Client Avatar and Name */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        {formData.image ? (
                          <AvatarImage src={formData.image} alt={`${formData.firstName} ${formData.lastName}`} />
                        ) : (
                          <AvatarFallback className="text-lg bg-gradient-to-br from-primary/80 to-primary">
                            {getInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {formData.firstName} {formData.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {formData.email}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Info */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                        <p className="text-sm font-medium">
                          {formData.phone || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</p>
                        <p className="text-sm font-medium line-clamp-2">
                          {formData.address || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formData.status 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {formData.status ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {/* Password Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formData.password.trim() 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {formData.password.trim() ? 'Will Update' : 'Unchanged'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right column - Form fields */}
          <div className="lg:col-span-2">
            <form id="client-edit-form" onSubmit={handleSubmit}>
              {/* Personal Information */}
              <Card className="shadow-md mb-8">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
                  <CardDescription>
                    Basic client details
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Enter first name"
                        className="transition-all focus-visible:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Enter last name"
                        className="transition-all focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="shadow-md mb-8">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-xl font-bold">Contact Information</CardTitle>
                  <CardDescription>
                    How to reach the client
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                      className="transition-all focus-visible:ring-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                      className="transition-all focus-visible:ring-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter full address"
                      rows={3}
                      className="transition-all focus-visible:ring-primary resize-none"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="shadow-md mb-8">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-xl font-bold">Security</CardTitle>
                  <CardDescription>
                    Account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="transition-all focus-visible:ring-primary"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Only fill this field if you want to change the password
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card className="shadow-md mb-8">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-xl font-bold">Account Settings</CardTitle>
                  <CardDescription>
                    Client account status
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                    <Checkbox
                      id="status"
                      checked={formData.status}
                      onCheckedChange={(checked: boolean) => handleInputChange("status", checked)}
                      className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div>
                      <Label htmlFor="status" className="text-base font-medium">Active Account</Label>
                      <p className="text-sm text-muted-foreground">
                        When enabled, the client can access their account
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 