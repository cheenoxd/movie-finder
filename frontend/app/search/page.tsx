"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Movie } from "@/lib/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      setLoading(true)
      fetch(`http://localhost:5001/api/movies/search?q=${encodeURIComponent(initialQuery)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-6">Search Movies</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search for movies..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {initialQuery && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Search results for "{initialQuery}"</h2>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.map((movie) => (
                  <Link href={`/movie/${movie.id}`} key={movie.id}>
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
                        <p className="text-sm text-muted-foreground">{movie.release_date ? new Date(movie.release_date).getFullYear() : ""}</p>
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
