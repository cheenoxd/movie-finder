"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Play } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Movie } from "@/lib/types"

export default function MovieGrid() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {loading
        ? Array.from({ length: 10 }).map((_, index) => <MovieCardSkeleton key={index} />)
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </div>
  )
}

function MovieCard({ movie }: { movie: Movie }) {
  const [isFavourite, setIsFavourite] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check auth status on mount
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5001/auth/", { credentials: "include" })
        const data = await response.json()
        setIsAuthenticated(data.authenticated)
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  const handleAuthToast = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toast.error("You must be logged in to use this feature.")
  }

  const toggleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      handleAuthToast(e)
      return
    }
    try {
      const response = await fetch("http://localhost:5001/api/favourites", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie_id: movie.id, movie_data: movie })
      })
      if (response.ok) {
        setIsFavourite(!isFavourite)
        toast.success(isFavourite ? "Removed from favourites" : "Added to favourites")
      } else {
        toast.error("Failed to update favourite")
      }
    } catch (error) {
      toast.error("Error updating favourite")
    }
  }

  const toggleWatching = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      handleAuthToast(e)
      return
    }
    try {
      const response = await fetch("http://localhost:5001/api/watch-history", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie_id: movie.id, movie_data: movie })
      })
      if (response.ok) {
        setIsWatching(!isWatching)
        toast.success(isWatching ? "Removed from watch history" : "Added to watch history")
      } else {
        toast.error("Failed to update watch history")
      }
    } catch (error) {
      toast.error("Error updating watch history")
    }
  }

  return (
    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:scale-105 relative">
      {/* Always visible buttons in the top-right corner */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <Button size="icon" variant="secondary" onClick={isAuthenticated ? toggleFavourite : handleAuthToast}>
          <Heart className={isFavourite ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
        </Button>
        <Button size="icon" variant="secondary" onClick={isAuthenticated ? toggleWatching : handleAuthToast}>
          <Play className={isWatching ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
        </Button>
      </div>
      <Link href={`/movie/${movie.id}`}>
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
        </div>
      </Link>
      <CardContent className="p-3">
        <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
        <p className="text-sm text-muted-foreground">{new Date(movie.release_date).getFullYear()}</p>
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
