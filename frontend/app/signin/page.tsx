"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'

export default function SignInPage() {
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      console.log('Initiating Google sign-in...')
      const response = await fetch('http://localhost:5001/auth/google', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Server error:', data)
        throw new Error(data.error || 'Failed to initiate Google sign in')
      }

      if (!data.url) {
        console.error('No URL in response:', data)
        throw new Error('Invalid response from server')
      }

      console.log('Redirecting to:', data.url)
      window.location.href = data.url
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to sign in with Google')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={24}
              height={24}
              className="mr-2"
            />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
