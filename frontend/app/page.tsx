import MovieGrid from "@/components/movie-grid"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Top Rated Movies</h1>
        <MovieGrid />
      </div>
    </main>
  )
}
