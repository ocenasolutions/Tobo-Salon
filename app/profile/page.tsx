"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Calendar, Shield, CheckCircle, XCircle } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface UserProfile {
  _id: string
  email: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile")
      }

      setProfile(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <DashboardLayout currentPage="Profile">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage="Profile">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">View and manage your account information</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {profile && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email</span>
                  </div>
                  <span className="text-sm">{profile.email}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Verification Status</span>
                  </div>
                  <Badge variant={profile.isVerified ? "default" : "destructive"} className="flex items-center gap-1">
                    {profile.isVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Unverified
                      </>
                    )}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Member Since</span>
                  </div>
                  <span className="text-sm">{formatDate(profile.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Activity
                </CardTitle>
                <CardDescription>Recent account activity and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Last Updated</span>
                  <span className="text-sm">{formatDate(profile.updatedAt)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-medium">Account ID</span>
                  <span className="text-sm font-mono">{profile._id.slice(-8)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-medium">Account Type</span>
                  <Badge variant="outline">Standard</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
