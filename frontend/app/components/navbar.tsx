"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Search, Film, Home, Clapperboard, LogIn, User as UserIcon, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check for login success in URL
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get('login');
    
    if (loginStatus === 'success') {
      // Remove the query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh auth state
      checkAuthStatus();
    } else {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("http://localhost:5001/auth/", {
        credentials: "include"
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      setUser(data.user || null);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5001/auth/logout", {
        method: "POST",
        credentials: "include"
      })
      
      if (response.ok) {
        toast.success("Logged out successfully")
        setIsAuthenticated(false)
        router.push("/")
      } else {
        toast.error("Failed to log out")
      }
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out")
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

            {isAuthenticated ? (
              <>
                <Link href="/recommendations" className="text-sm font-medium hover:underline underline-offset-4">
                  Recommendations
                </Link>
                <Button asChild variant="default" size="sm">
                  <Link href="/profile">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/signin">Sign In</Link>
              </Button>
            )}
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

                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => navigateTo("/recommendations")}
                    >
                      <Clapperboard className="h-5 w-5" />
                      Recommendations
                    </Button>
                  )}

                  {isAuthenticated ? (
                    <Button className="w-full justify-start gap-2 mt-6" onClick={() => navigateTo("/profile")}>
                      <UserIcon className="h-5 w-5" />
                      Profile
                    </Button>
                  ) : (
                    <Button className="w-full justify-start gap-2 mt-6" onClick={() => navigateTo("/signin")}>
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
