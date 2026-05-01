"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { apiPost } from "@/lib/api-client"
import { setAuth, type AuthUser } from "@/lib/auth"

function ManagementLoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/management"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const result = await apiPost<{
        token: string
        token_type?: string
        expires_in?: number
        admin: {
          id: string
          name: string
          email: string
          role: string
          department: string | null
          is_active: boolean
        }
      }>("/api/auth/admin-login", {
        email,
        password,
      })

      if (!result.success || !result.data) {
        setError(result.error || "Login failed. Please try again.")
        setIsLoading(false)
        return
      }

      const { token, admin } = result.data
      const authUser: AuthUser = {
        id: admin.id,
        email: admin.email,
        full_name: admin.name,
        role: admin.role,
        submitter_type: "management_user",
        organization: null,
        entity_id: null,
        mda_id: null,
        can_submit_contracts: true,
        status: admin.is_active ? "active" : "inactive",
        phone: null,
        department: admin.department,
      }

      setAuth(token, authUser)
      // Ensure localStorage write is visible before protected-layout auth guard executes.
      await new Promise((resolve) => setTimeout(resolve, 150))
      window.location.href = redirectTo
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "An unexpected error occurred. Please try again.")
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-primary/10 bg-card/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/barbados-coat-of-arms.png"
              alt="Government of Barbados"
              width={36}
              height={36}
            />
            <div>
              <p className="text-sm font-bold text-primary">SGC Digital</p>
              <p className="text-[10px] text-muted-foreground">Management Portal</p>
            </div>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Main Site
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Management Access</CardTitle>
            <CardDescription className="text-muted-foreground">
              Authorized personnel only. Sign in with your approved credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@sgc.gov.bb"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Verifying Access...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Sign In to Management
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-lg bg-muted/50 p-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                This portal is restricted to authorized SGC staff only.
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Need access? </span>
                <Link href="/management/register" className="text-primary hover:underline font-medium">
                  Request Registration
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-card/50 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Solicitor General{"'"}s Chambers - Government of Barbados
        </div>
      </footer>
    </div>
  )
}

export default function ManagementLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ManagementLoginContent />
    </Suspense>
  )
}
