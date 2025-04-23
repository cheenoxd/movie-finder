"use client"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Film, Heart, History, Settings, Edit } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()

  const navigateToEdit = () => {
    router.push("/profile/edit")
  }
  
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">John Doe</h1>
              <p className="text-muted-foreground">Member since March 2023</p>

              <div className="flex flex-wrap gap-4 mt-4">
                <Button onClick={navigateToEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
          <Tabs defaultValue="watchlist">
            <TabsList className="grid grid-cols-2  mb-8">
              <TabsTrigger value="watchlist">
                <Film className="h-4 w-4 mr-2" />
                Watchlist
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="watchlist">
              <Card>
                <CardHeader>
                  <CardTitle>Your Watchlist</CardTitle>
                  <CardDescription>Movies you want to watch later</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* This would be populated with actual watchlist data */}
                    <div className="text-center p-8 col-span-full">
                      <Film className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Your watchlist is empty</p>
                      <Button className="mt-4" variant="outline">
                        Browse Movies
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle>Your Favorites</CardTitle>
                  <CardDescription>Movies you've marked as favorites</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* This would be populated with actual favorites data */}
                    <div className="text-center p-8 col-span-full">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">You haven't added any favorites yet</p>
                      <Button className="mt-4" variant="outline">
                        Browse Movies
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Watch History</CardTitle>
                  <CardDescription>Movies you've watched recently</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* This would be populated with actual watch history data */}
                    <div className="text-center p-8 col-span-full">
                      <History className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Your watch history is empty</p>
                      <Button className="mt-4" variant="outline">
                        Browse Movies
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
