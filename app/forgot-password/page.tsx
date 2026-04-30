"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiPost } from "@/lib/api-client"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get("email") || "").trim()

    if (!email) {
      setError("Please enter your email address.")
      setIsLoading(false)
      return
    }

    const result = await apiPost("/api/auth/forgot-password", { email })
    if (!result.success) {
      setError(result.error || "Unable to send reset email. Please try again.")
      setIsLoading(false)
      return
    }

    setSuccessMessage(
      "If an account exists for this email, a password reset link has been sent."
    )
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>

          <Card className="bg-card border-border overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 text-center">
              <h1 className="text-2xl font-medium text-white">Forgot Password</h1>
              <p className="text-primary-foreground/80 mt-1">Enter your email to receive a reset link</p>
            </div>

            <CardContent className="pt-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert className="mb-4">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? "Sending reset link..." : (
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Send Reset Link
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
