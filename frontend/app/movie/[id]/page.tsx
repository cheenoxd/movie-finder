'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star, Calendar, Clock, Users, Heart, Play } from 'lucide-react'
import Link from 'next/link'
import { toast } from "sonner"
import { Movie } from "@/lib/types"

interface MovieDetails extends Movie {
  overview: string
  backdrop_path: string
  runtime: number
  genres: { id: number; name: string }[]
  credits?: {
    cast: Array<{
      id: number
      name: string
      character: string
      profile_path: string | null
    }>
    crew: Array<{
      id: number
      name: string
      job: string
      profile_path: string | null
    }>
  }
}

export default function MoviePage() {
  const { id } = useParams()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavourite, setIsFavourite] = useState(false)
  const [isWatching, setIsWatching] = useState(false)

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/movies/${id}`)
        if (!response.ok) {
          throw new Error('Movie does not exist')
        }
        const data = await response.json()
        setMovie(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMovieDetails()
  }, [id])

  const toggleFavourite = async () => {
    if (!movie) return
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

  const toggleWatching = async () => {
    if (!movie) return
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Movie not found'}</p>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const director = movie.credits?.crew.find(person => person.job === 'Director')
  const topCast = movie.credits?.cast.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Backdrop */}
      <div className="relative h-[50vh] w-full">
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-full md:w-1/3">
            <Card className="overflow-hidden">
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                width={500}
                height={750}
                className="w-full h-auto"
              />
            </Card>
          </div>
          {/* Details */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="text-white font-bold">{movie.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-1" />
                <span className="text-white font-bold">{movie.release_date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-1" />
                <span className="text-white font-bold">{movie.runtime} min</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map(genre => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-bold"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-black font-bold mb-8">{movie.overview}</p>

            <div className="flex gap-4 mb-8">
              <Button onClick={toggleFavourite} variant="outline" className="flex items-center gap-2">
                <Heart className={isFavourite ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5"} />
                {isFavourite ? "Remove from Favourites" : "Add to Favourites"}
              </Button>
              <Button onClick={toggleWatching} variant="outline" className="flex items-center gap-2">
                <Play className={isWatching ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5"} />
                {isWatching ? "Remove from Watch History" : "Add to Watch History"}
              </Button>
            </div>

            {director && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-black mb-2">Director</h2>
                <p className="text-black font-bold">{director.name}</p>
              </div>
            )}

            {topCast && topCast.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-black mb-4">Top Cast</h2>
                <div className="flex flex-wrap gap-4">
                  {topCast.map(actor => (
                    <div key={actor.id} className="text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                        {actor.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            width={185}
                            height={185}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-black font-bold text-sm">{actor.name}</p>
                      <p className="text-gray-600 text-xs font-bold">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 