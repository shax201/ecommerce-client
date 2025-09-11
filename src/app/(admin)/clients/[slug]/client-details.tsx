"use client"

import { ClientData } from "../client.interface"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Clock 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
// Using native Date formatting instead of date-fns
export function ClientDetails({ client }: { client: ClientData }) {
  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }
  
  const formattedCreatedAt = formatDate(client.createdAt)
  const formattedUpdatedAt = formatDate(client.updatedAt)
  
  // Get initials for avatar fallback
  const getInitials = () => {
    return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase()
  }

  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/clients/${client._id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/clients");
      } else {
        alert("Failed to delete client. Please try again later.");
      }
    } catch (error) {
      alert("An error occurred while deleting the client.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* Back button */}
      <Link href="/clients">
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </Link>
      {/* Confirm Delete Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2">Delete Client</h2>
            <p className="mb-4">Are you sure you want to delete this client? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isDeleting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main client info card */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/10">
                  {client.image ? (
                    <AvatarImage src={client.image} alt={`${client.firstName} ${client.lastName}`} />
                  ) : (
                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary/80 to-primary">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {client.firstName} {client.lastName}
                  </CardTitle>
                  <CardDescription className="mt-1 text-base">
                    {client.role}
                  </CardDescription>
                  <div className="mt-2">
                    <Badge variant={client.status ? "default" : "outline"}>
                      {client.status ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href={`/clients/${client._id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 md:col-span-2">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{client.address}</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined On</p>
                  <p className="font-medium">{formattedCreatedAt}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formattedUpdatedAt}</p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-muted/50 flex justify-end pt-6">
            <p className="text-sm text-muted-foreground">
              Client ID: <span className="font-mono">{client._id}</span>
            </p>
          </CardFooter>
        </Card>
        
        {/* Stats and activity cards */}
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Client Statistics</CardTitle>
              <CardDescription>Overview of client activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Orders</span>
                  <span className="font-semibold">12</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-semibold">$1,245.89</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Order</span>
                  <span className="font-semibold">2 weeks ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest client interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-primary pl-4 py-1">
                  <p className="text-sm font-medium">Placed an order</p>
                  <p className="text-xs text-muted-foreground">2 weeks ago</p>
                </div>
                <div className="border-l-2 border-primary pl-4 py-1">
                  <p className="text-sm font-medium">Updated profile</p>
                  <p className="text-xs text-muted-foreground">1 month ago</p>
                </div>
                <div className="border-l-2 border-primary pl-4 py-1">
                  <p className="text-sm font-medium">Account created</p>
                  <p className="text-xs text-muted-foreground">{formattedCreatedAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}