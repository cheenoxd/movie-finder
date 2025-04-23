"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Moon, Sun, Globe, Lock, Eye, EyeOff } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Mock settings data
  const [settings, setSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    pushNotifications: true,
    newReleases: true,
    recommendations: true,
    theme: "system",
    language: "english",
    publicProfile: true,
    shareActivity: true,
    allowRecommendations: true,
  })

  const handleSwitchChange = (name: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [name]: !prev[name] }))

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof typeof settings, value: string) =>
    setSettings((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)

      toast.success("Settings saved", {
        description: "Your settings have been updated successfully.",
      })
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 gap-1"
            onClick={() => router.push("/profile")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account preferences and settings
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="account" className="w-full">
              </Tabs>
            </CardContent>

            <CardFooter>
              <Button
                className="ml-auto"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save All Settings"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}
