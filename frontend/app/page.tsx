"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Movie } from "@/lib/types"

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/movies", {
          credentials: "include"
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch movies: ${response.statusText}`)
        }
        const data = await response.json()
        if (!data.results) {
          throw new Error('Invalid response format from server')
        }
        setMovies(data.results)
      } catch (error) {
        console.error("Error fetching movies:", error)
        setError(error instanceof Error ? error.message : 'Failed to load movies')
        toast.error('Failed to load movies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="animate-pulse">
                  <div className="aspect-[2/3] bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (!movies.length) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No movies found</h1>
            <p className="text-muted-foreground mb-4">There are no movies available at the moment.</p>
            <Button onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Recent Movies</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <Link href={`/movie/${movie.id}`} key={movie.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-lg mb-2 line-clamp-1">{movie.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                    <span>•</span>
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{movie.overview}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
