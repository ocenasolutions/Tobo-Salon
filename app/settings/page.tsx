"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, Lock, Shield, Key } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function SettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showOTPField, setShowOTPField] = useState(false)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!showOTPField) {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setError("All password fields are required")
        return
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError("New passwords do not match")
        return
      }

      if (passwordForm.newPassword.length < 6) {
        setError("New password must be at least 6 characters long")
        return
      }
    } else {
      if (!passwordForm.otp) {
        setError("Please enter the OTP")
        return
      }
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          otp: passwordForm.otp || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      if (data.requiresOTP) {
        setShowOTPField(true)
        setSuccess("OTP sent to your email. Please enter it to confirm password change.")
      } else {
        setSuccess("Password changed successfully!")
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          otp: "",
        })
        setShowOTPField(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      otp: "",
    })
    setShowOTPField(false)
    setError("")
    setSuccess("")
  }

  return (
    <DashboardLayout currentPage="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and security preferences</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure. You'll need to verify with OTP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {!showOTPField ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          placeholder="Enter your current password"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          placeholder="Enter your new password"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your new password"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP from your email"
                        value={passwordForm.otp}
                        onChange={handlePasswordChange}
                        className="pl-10"
                        maxLength={6}
                        disabled={loading}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Check your email for the verification code to complete password change.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {showOTPField ? "Verifying..." : "Sending OTP..."}
                      </>
                    ) : showOTPField ? (
                      "Confirm Password Change"
                    ) : (
                      "Change Password"
                    )}
                  </Button>

                  {showOTPField && (
                    <Button type="button" variant="outline" onClick={resetPasswordForm} disabled={loading}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Information
              </CardTitle>
              <CardDescription>Important security details about your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Two-Factor Authentication</span>
                <span className="text-sm text-muted-foreground">Email OTP</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium">Password Strength</span>
                <span className="text-sm text-green-600">Strong</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium">Account Security</span>
                <span className="text-sm text-green-600">Protected</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
