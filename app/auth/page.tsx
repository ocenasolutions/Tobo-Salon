"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import SignUpForm from "@/components/auth/sign-up-form"
import SignInForm from "@/components/auth/sign-in-form"
import OTPVerification from "@/components/auth/otp-verification"

export default function AuthPage() {
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const handleSignUpSuccess = (email: string) => {
    setUserEmail(email)
    setShowOTPVerification(true)
  }

  const handleOTPSuccess = () => {
    // Redirect to packages page after successful verification
    window.location.href = "/packages"
  }

  const handleBackToSignUp = () => {
    setShowOTPVerification(false)
    setUserEmail("")
  }

  if (showOTPVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image 
                src="/HUSN.png" 
                alt="HUSN Logo" 
                width={32} 
                height={32} 
                className="rounded-full object-cover"
              />
              <span className="text-2xl font-serif font-bold text-primary">HUSN</span>
            </Link>
          </div>
          <OTPVerification email={userEmail} onSuccess={handleOTPSuccess} onBack={handleBackToSignUp} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image 
              src="/HUSN.png" 
              alt="HUSN Logo" 
              width={32} 
              height={32} 
              className="rounded-full object-cover"
            />
            <span className="text-2xl font-serif font-bold text-primary">HUSN</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new one</p>
        </div>

        <Card className="border-border/40 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-serif text-center">Get Started</CardTitle>
            <CardDescription className="text-center">Choose your preferred method to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="font-medium">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="font-medium">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <SignInForm />
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <SignUpForm onSuccess={handleSignUpSuccess} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
