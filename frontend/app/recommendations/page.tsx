"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Info, Plus } from "lucide-react"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Movie } from "@/lib/types"

const genreMap: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  53: "Thriller",
  80: "Crime",
  878: "Sci-Fi",
}

export default function RecommendationsPage() {
  const [favorites, setFavorites] = useState<Movie[]>([])
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Movie Recommendations</h1>
        <p className="text-muted-foreground mb-8">Personalized movie suggestions based on your favorites</p>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">

            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Your Favorites</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile">Manage Favorites</Link>
                </Button>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <MovieCardSkeleton key={index} />
                  ))}
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {favorites.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} isFavorite={true} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No favorites yet"
                  description="Add movies to your favorites to get personalized recommendations"
                  actionLabel="Browse Movies"
                  actionHref="/"
                />
              )}
            </section>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Recommended For You</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        These recommendations are based on your favorite movies, watch history, and ratings
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <MovieCardSkeleton key={index} />
                  ))}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {recommendations.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No recommendations available"
                  description="Add more favorites to get personalized recommendations"
                  actionLabel="Browse Movies"
                  actionHref="/"
                />
              )}
            </section>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <EmptyState
              title="New Releases Coming Soon"
              description="We're preparing personalized new release recommendations for you"
              actionLabel="Browse All Movies"
              actionHref="/"
            />
          </TabsContent>

          <TabsContent value="similar" className="mt-6">
            <EmptyState
              title="Similar Movies Coming Soon"
              description="We're preparing similar movie recommendations based on your favorites"
              actionLabel="Browse All Movies"
              actionHref="/"
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function MovieCard({ movie, isFavorite = false }: { movie: Movie; isFavorite?: boolean }) {
  const primaryGenre = movie.genre_ids && movie.genre_ids[0] ? genreMap[movie.genre_ids[0]] : "Unknown"
  return (
    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:scale-105">
      <div className="aspect-[2/3] relative">
        <Image
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "/placeholder.svg?height=450&width=300"
          }
          alt={movie.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          {isFavorite ? (
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm">
              <Heart className="h-4 w-4 fill-primary text-primary" />
            </Button>
          ) : (
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {new Date(movie.release_date).getFullYear()} • {primaryGenre}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <div className="flex items-center">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
          <span className="text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <Skeleton className="aspect-[2/3] w-full" />
      <CardContent className="p-3">
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Skeleton className="h-4 w-16" />
      </CardFooter>
    </Card>
  )
}

function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string
  description: string
  actionLabel: string
  actionHref: string
}) {
  return (
    <div className="text-center py-12 px-4 border rounded-lg bg-background">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      <Button asChild>
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  )
}
