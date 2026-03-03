"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, AlertCircle, ArrowLeft } from "lucide-react"
import { isApprovedAdmin } from "@/lib/admin-users"

export default function ManagementLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Check if user is an approved admin
    const adminUser = isApprovedAdmin(email)
    
    if (!adminUser) {
      setError("Access denied. You are not authorized to access the Management portal. Please contact your administrator if you believe this is an error.")
      setIsLoading(false)
      return
    }

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Store admin session
    const adminSession = {
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      department: adminUser.department,
      loginTime: new Date().toISOString()
    }
    sessionStorage.setItem("sgc_admin", JSON.stringify(adminSession))

    // Redirect to management dashboard
    window.location.href = "/management"
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
                  type="email"
                  placeholder="your.email@sgc.gov.bb"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
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

            <div className="mt-6 rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                This portal is restricted to authorized SGC staff only.
                <br />
                Contact the System Administrator for access requests.
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
