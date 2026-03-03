"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, UserPlus, CheckCircle } from "lucide-react"

const SUBMITTER_TYPES = [
  { value: "ministry", label: "Ministry / Government Agency (MDA)" },
  { value: "court", label: "Court" },
  { value: "statutory", label: "Statutory Body" },
  { value: "public", label: "Member of the Public" },
  { value: "attorney", label: "Attorney-at-Law" },
  { value: "other", label: "Other" }
]

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [formData, setFormData] = useState({
    submitterType: "",
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    password: "",
    confirmPassword: "",
    terms: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRegistered(true)
    setIsLoading(false)
  }

  if (isRegistered) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-md">
            <Card className="bg-card border-border">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Registration Successful</h1>
                <p className="text-muted-foreground mb-6">
                  Your account has been created. Please check your email to verify your account 
                  before signing in.
                </p>
                <div className="rounded-lg bg-muted p-4 mb-6 text-left">
                  <p className="text-sm text-muted-foreground mb-1">Entity Number</p>
                  <p className="text-lg font-mono font-bold text-foreground">ENT-{Date.now().toString(36).toUpperCase()}</p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/login">Continue to Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-lg">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <span className="font-serif text-lg font-bold text-primary-foreground">SGC</span>
              </div>
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>
                Register to submit and track correspondence and contracts with the SGC.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="submitterType">Submitter Type <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.submitterType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, submitterType: value }))}
                    required
                  >
                    <SelectTrigger id="submitterType">
                      <SelectValue placeholder="Select your type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBMITTER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (246) XXX-XXXX"
                  />
                </div>

                {(formData.submitterType === "ministry" || 
                  formData.submitterType === "statutory" || 
                  formData.submitterType === "court") && (
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization Name</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="Ministry or organization name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={formData.terms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: checked === true }))}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !formData.terms}>
                  {isLoading ? (
                    "Creating Account..."
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
