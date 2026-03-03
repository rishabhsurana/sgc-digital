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
import { ArrowLeft, UserPlus, CheckCircle, Building2, Scale, Landmark, Users, Briefcase, HelpCircle } from "lucide-react"
import { MINISTRIES_DEPARTMENTS_AGENCIES } from "@/lib/constants"

const SUBMITTER_TYPES = [
  { value: "ministry", label: "Ministry / Government Agency (MDA)", icon: Building2, color: "text-blue-600", bgColor: "bg-blue-50" },
  { value: "court", label: "Court", icon: Scale, color: "text-purple-600", bgColor: "bg-purple-50" },
  { value: "statutory", label: "Statutory Body", icon: Landmark, color: "text-green-600", bgColor: "bg-green-50" },
  { value: "public", label: "Member of the Public", icon: Users, color: "text-orange-600", bgColor: "bg-orange-50" },
  { value: "attorney", label: "Attorney-at-Law", icon: Briefcase, color: "text-red-600", bgColor: "bg-red-50" },
  { value: "other", label: "Other", icon: HelpCircle, color: "text-gray-600", bgColor: "bg-gray-50" }
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
    
    // Store user data in sessionStorage for demo purposes
    const entityNumber = `ENT-${Date.now().toString(36).toUpperCase()}`
    const userData = {
      fullName: formData.fullName,
      email: formData.email,
      submitterType: formData.submitterType,
      organization: formData.organization,
      entityNumber: entityNumber
    }
    sessionStorage.setItem("sgc_user", JSON.stringify(userData))
    
    setIsRegistered(true)
    setIsLoading(false)
  }

  if (isRegistered) {
    const selectedType = SUBMITTER_TYPES.find(t => t.value === formData.submitterType)
    const entityNumber = `ENT-${Date.now().toString(36).toUpperCase()}`
    
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-md">
            <Card className="bg-card border-border overflow-hidden">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Registration Successful</h1>
                <p className="text-green-100">
                  Welcome to SGC Digital, {formData.fullName}
                </p>
              </div>
              <CardContent className="pt-6 pb-8">
                {/* User Details Summary */}
                <div className="rounded-lg bg-muted/50 p-4 mb-6 text-left">
                  <h3 className="font-semibold text-sm text-foreground mb-3">Your Registration Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-foreground">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium text-foreground">{selectedType?.label.split("/")[0].trim()}</span>
                    </div>
                    {formData.organization && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Organization:</span>
                        <span className="font-medium text-foreground">{formData.organization}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Entity Number */}
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/10 border border-primary/20 p-5 mb-6 text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Entity Number</p>
                  <p className="text-2xl font-mono font-bold text-primary">{entityNumber}</p>
                  <p className="text-xs text-muted-foreground mt-2">Save this for your records</p>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  A verification email has been sent to <strong>{formData.email}</strong>. 
                  Please verify your account before signing in.
                </p>
                
                <div className="space-y-3">
                  <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                    <Link href="/login">Continue to Sign In</Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    After signing in, access your <Link href="/dashboard" className="text-primary hover:underline font-medium">Dashboard</Link> to submit and track requests.
                  </p>
                </div>
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
          
          <Card className="bg-card border-border overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur shadow-lg">
                <span className="font-serif text-xl font-bold text-white">SGC</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Create an Account</h1>
              <p className="text-primary-foreground/80 mt-1">
                Register to submit and track your requests
              </p>
            </div>
            <CardHeader className="text-center pt-6">
              <CardDescription>
                Select your submitter type and fill in your details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Submitter Type <span className="text-destructive">*</span></Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUBMITTER_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = formData.submitterType === type.value
                      return (
                        <button
                          type="button"
                          key={type.value}
                          onClick={() => setFormData(prev => ({ ...prev, submitterType: type.value }))}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected 
                              ? `border-primary ${type.bgColor} shadow-sm` 
                              : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? type.bgColor : "bg-muted"}`}>
                            <Icon className={`h-4 w-4 ${isSelected ? type.color : "text-muted-foreground"}`} />
                          </div>
                          <span className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                            {type.label.split("/")[0].trim()}
                          </span>
                        </button>
                      )
                    })}
                  </div>
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

                {(formData.submitterType === "ministry" || formData.submitterType === "statutory") && (
                  <div className="space-y-2">
                    <Label htmlFor="organization">Ministry / Department / Agency <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.organization}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, organization: value }))}
                    >
                      <SelectTrigger id="organization">
                        <SelectValue placeholder="Select MDA" />
                      </SelectTrigger>
                      <SelectContent>
                        {MINISTRIES_DEPARTMENTS_AGENCIES.map((mda) => (
                          <SelectItem key={mda.value} value={mda.label}>
                            {mda.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {formData.submitterType === "court" && (
                  <div className="space-y-2">
                    <Label htmlFor="organization">Court Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="Enter court name"
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

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-md" size="lg" disabled={isLoading || !formData.terms}>
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
