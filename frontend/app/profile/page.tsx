"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Film, Heart, History, Settings, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Movie, User } from "@/lib/types"

interface Favourite {
  id: number;
  movie_id: number;
  movie_data: Movie;
  created_at: string;
}

interface WatchHistory {
  id: number;
  movie_id: number;
  movie_data: Movie;
  watched_at: string;
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [favourites, setFavourites] = useState<Favourite[]>([])
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([])
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    // Fetch user data from backend
    fetch("http://localhost:5001/api/user", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user)
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error fetching user data:", error)
        setIsLoading(false)
        // Redirect to sign in if not authenticated
        router.push("/signin")
      })
  }, [router])

  useEffect(() => {
    // Fetch favourites
    fetch("http://localhost:5001/api/favourites", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setFavourites(data.favourites || [])
        setIsLoadingFavourites(false)
      })
      .catch(error => {
        console.error("Error fetching favourites:", error)
        setIsLoadingFavourites(false)
      })

    // Fetch watch history
    fetch("http://localhost:5001/api/watch-history", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setWatchHistory(data.watch_history || [])
        setIsLoadingHistory(false)
      })
      .catch(error => {
        console.error("Error fetching watch history:", error)
        setIsLoadingHistory(false)
      })
  }, [])

  const navigateToEdit = () => {
    router.push("/profile/edit")
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Recently'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-24 w-24 rounded-full bg-muted mb-4" />
              <div className="h-8 w-48 bg-muted mb-2" />
              <div className="h-4 w-32 bg-muted" />
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
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <Avatar className="w-24 h-24">
              {user.picture ? (
                <AvatarImage src={user.picture} alt={user.name} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">Member since {formatDate(user.created_at)}</p>

              <div className="flex flex-wrap gap-4 mt-4">
                <Button onClick={navigateToEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="favorites" className="space-y-4">
            <TabsList>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="history">Watch History</TabsTrigger>
            </TabsList>

            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle>Your Favorites</CardTitle>
                  <CardDescription>Movies you've marked as favorites</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFavourites ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-[2/3] bg-muted rounded-lg mb-2" />
                          <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : favourites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {favourites.map((favourite) => (
                        <Link href={`/movie/${favourite.movie_id}`} key={favourite.id}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                            <div className="relative aspect-[2/3]">
                              <Image
                                src={`https://image.tmdb.org/t/p/w500${favourite.movie_data.poster_path}`}
                                alt={favourite.movie_data.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <h3 className="font-semibold text-sm line-clamp-1">{favourite.movie_data.title}</h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span>{favourite.movie_data.vote_average.toFixed(1)}</span>
                                <span>•</span>
                                <span>{new Date(favourite.movie_data.release_date).getFullYear()}</span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">You haven't added any favorites yet</p>
                      <Button className="mt-4" variant="outline" onClick={() => router.push("/")}>
                        Browse Movies
                      </Button>
                    </div>
                  )}
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
                  {isLoadingHistory ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-[2/3] bg-muted rounded-lg mb-2" />
                          <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : watchHistory.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {watchHistory.map((history) => (
                        <Link href={`/movie/${history.movie_id}`} key={history.id}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                            <div className="relative aspect-[2/3]">
                              <Image
                                src={`https://image.tmdb.org/t/p/w500${history.movie_data.poster_path}`}
                                alt={history.movie_data.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <h3 className="font-semibold text-sm line-clamp-1">{history.movie_data.title}</h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span>{history.movie_data.vote_average.toFixed(1)}</span>
                                <span>•</span>
                                <span>{new Date(history.movie_data.release_date).getFullYear()}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Watched {formatDate(history.watched_at)}
                              </p>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <History className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Your watch history is empty</p>
                      <Button className="mt-4" variant="outline" onClick={() => router.push("/")}>
                        Browse Movies
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
