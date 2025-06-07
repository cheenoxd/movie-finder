"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, ArrowLeft } from "lucide-react"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  created_at: string;
}

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  })

  useEffect(() => {
    // Fetch user data from backend
    fetch("http://localhost:5001/api/user", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user)
        setFormData({
          name: data.user.name || "",
          email: data.user.email || ""
        })
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error fetching user data:", error)
        setIsLoading(false)
        // Redirect to sign in if not authenticated
        router.push("/signin")
      })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("http://localhost:5001/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success("Profile updated successfully")
        router.push("/profile")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-muted mb-8" />
              <div className="h-32 bg-muted mb-4" />
              <div className="h-32 bg-muted" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null // Will redirect to sign in
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push("/profile")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/profile")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
