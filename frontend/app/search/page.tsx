"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import MovieGrid from "@/components/movie-grid"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would trigger a search here
    console.log("Searching for:", searchQuery)
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
            <MovieGrid />
          </div>
        )}
      </div>
    </main>
  )
}
