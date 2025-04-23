"use client"

import Link from "next/link"
import { Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import GoogleLogo from '../components/icons/GoogleLogo.svg'
export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Film className="h-6 w-6" />
        <span className="text-xl font-bold">MovieHaven</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to MovieHaven</CardTitle>
          <CardDescription className="text-center">Continue with Google to access your account</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
         <a href="http://localhost:5001/login">
         <Button
            variant="outline"
            size="lg"
            className="w-full max-w-sm flex items-center gap-2"
            onClick={() => {
              
              console.log("Google OAuth login initiated")
            }}
          >
         <GoogleLogo className="h-6 w-6" />
            Continue with Google
          </Button>
         </a>
        </CardContent>
        {/* <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </CardFooter> */}
      </Card>
    </div>
  )
}
