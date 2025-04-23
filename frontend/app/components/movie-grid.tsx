"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Movie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  release_date: string
}

export default function MovieGrid() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // useEffect(() => {
  //   const fetchMovies = async () => {
  //     try {
  //       // In a real app, you would use your actual API endpoint and API key
  //       const response = await fetch("https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1", {
  //         headers: {
  //           // This is a placeholder. In a real app, you would use environment variables
  //           Authorization: "Bearer YOUR_API_KEY_HERE",
  //         },
  //       })

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch movies")
  //       }

  //       const data = await response.json()
  //       setMovies(data.results)
  //     } catch (err) {
  //       console.error("Error fetching movies:", err)
  //       setError("Failed to load movies. Please try again later.")

  //       // For demo purposes, let's add some mock data
  //       setMovies(mockMovies)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchMovies()
  // }, [])

  // if (error) {
  //   return (
  //     <div className="text-center py-10">
  //       <p className="text-red-500">{error}</p>
  //       <button
  //         onClick={() => {
  //           setLoading(true)
  //           setError(null)
  //           setMovies(mockMovies)
  //           setLoading(false)
  //         }}
  //         className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
  //       >
  //         Try Again
  //       </button>
  //     </div>
  //   )
  // }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {loading
        ? Array.from({ length: 10 }).map((_, index) => <MovieCardSkeleton key={index} />)
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </div>
  )
}

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movie/${movie.id}`}>
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
        </div>
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
    </Link>
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
