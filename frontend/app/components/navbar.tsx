"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Search, Film, Home, Clapperboard, LogIn } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
    }
  }

  const navigateTo = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Film className="h-6 w-6" />
            <span className="text-xl font-bold">MovieHaven</span>
          </Link>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <form onSubmit={handleSearch} className="relative w-64">
              <Input
                type="search"
                placeholder="Search movies..."
                className="pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <Link href="/recommendations" className="text-sm font-medium hover:underline underline-offset-4">
              Recommendations
            </Link>

            <Button asChild variant="default" size="sm">
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>

          {/* Mobile Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Film className="h-6 w-6" />
                    <span className="text-xl font-bold">MovieHaven</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 space-y-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="search"
                    placeholder="Search movies..."
                    className="pr-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {/* Navigation Links */}
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigateTo("/")}>
                    <Home className="h-5 w-5" />
                    Home
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => navigateTo("/recommendations")}
                  >
                    <Clapperboard className="h-5 w-5" />
                    Recommendations
                  </Button>

                  <Button className="w-full justify-start gap-2 mt-6" onClick={() => navigateTo("/signin")}>
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
