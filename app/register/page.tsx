"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, UserPlus, CheckCircle, Building2, Scale, Landmark, Users, Briefcase, HelpCircle, Plus, Trash2, AlertCircle, Info, Eye, EyeOff } from "lucide-react"
import { MINISTRIES_DEPARTMENTS_AGENCIES } from "@/lib/constants"
import { apiPost } from "@/lib/api-client"
import { setAuth, type AuthUser } from "@/lib/auth"

// Entity/Submitter Types per requirements document
const SUBMITTER_TYPES = [
  { value: "ministry", label: "Ministry / Government Agency (MDA)", icon: Building2, color: "text-blue-600", bgColor: "bg-blue-50", description: "Government ministry, department, or agency" },
  { value: "court", label: "Court", icon: Scale, color: "text-purple-600", bgColor: "bg-purple-50", description: "Court or judicial body" },
  { value: "statutory", label: "Statutory Body", icon: Landmark, color: "text-green-600", bgColor: "bg-green-50", description: "State-owned enterprise or statutory body" },
  { value: "public", label: "Member of the Public", icon: Users, color: "text-orange-600", bgColor: "bg-orange-50", description: "Individual citizen or resident" },
  { value: "attorney", label: "Attorney-at-Law", icon: Briefcase, color: "text-red-600", bgColor: "bg-red-50", description: "Legal practitioner or law firm" },
  { value: "company", label: "Company / Business", icon: Building2, color: "text-cyan-600", bgColor: "bg-cyan-50", description: "Private sector company or business" },
  { value: "other", label: "Other (Specify)", icon: HelpCircle, color: "text-gray-600", bgColor: "bg-gray-50", description: "Other entity type" }
]


export default function RegisterPage() {
  const nextUserIdRef = React.useRef(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [entityNumber, setEntityNumber] = useState("")
  const [createdAdditionalUsers, setCreatedAdditionalUsers] = useState<
    Array<{ name: string; email: string; temp_password: string }>
  >([])
  const [existingUserError, setExistingUserError] = useState<{
    isStaff: boolean
    message: string
  } | null>(null)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    // Entity Type
    submitterType: "",
    otherTypeSpecify: "",
    
    // Member of Public - Individual name fields
    firstName: "",
    middleName: "",
    lastName: "",
    
    // Company fields
    companyName: "",
    companyNumber: "",
    tradingName: "",
    
    // MDA / Statutory / Court
    selectedMDA: "",
    courtName: "",
    
    // Attorney fields
    lawFirmName: "",
    barNumber: "",
    
    // Primary contact (always required)
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    password: "",
    confirmPassword: "",
    
    // Additional authorized users (for Company/MDA - multiple users per entity)
    additionalUsers: [] as Array<{ id: number; name: string; email: string }>,
    
    // Address (optional)
    address: "",
    
    // Terms
    terms: false
  })

  const addAdditionalUser = () => {
    if (formData.additionalUsers.length < 5) {
      const id = nextUserIdRef.current++
      setFormData(prev => ({
        ...prev,
        additionalUsers: [...prev.additionalUsers, { id, name: "", email: "" }]
      }))
    }
  }

  const removeAdditionalUser = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalUsers: prev.additionalUsers.filter((_, i) => i !== index)
    }))
  }

  const updateAdditionalUser = (index: number, field: "name" | "email", value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalUsers: prev.additionalUsers.map((user, i) => 
        i === index ? { ...user, [field]: value } : user
      )
    }))
  }

  // Check if entity type supports multiple users
  const supportsMultipleUsers = ["ministry", "statutory", "company"].includes(formData.submitterType)

  const getDisplayName = (): string => {
    switch (formData.submitterType) {
      case "public":
        return `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`.trim()
      case "company":
        return formData.companyName
      case "ministry":
      case "statutory":
        return formData.selectedMDA
      case "court":
        return formData.courtName
      case "attorney":
        return formData.lawFirmName || `${formData.firstName} ${formData.lastName}`
      default:
        return formData.firstName
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setExistingUserError(null)

    const entityTypes = ["ministry", "court", "statutory", "company"]
    if (entityTypes.includes(formData.submitterType) && !formData.contactName.trim()) {
      setExistingUserError({ isStaff: false, message: "Contact person's full name is required." })
      setIsLoading(false)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setExistingUserError({ isStaff: false, message: 'Passwords do not match.' })
      setIsLoading(false)
      return
    }
    if (formData.password.length < 8) {
      setExistingUserError({ isStaff: false, message: 'Password must be at least 8 characters.' })
      setIsLoading(false)
      return
    }

    try {
      // Determine full_name for the user record.
      // Entity-type submitters (ministry/court/statutory/company) provide an
      // explicit contact person name. All others derive it from the name
      // fields captured under their entity/personal info section.
      const entityTypes = ["ministry", "court", "statutory", "company"]
      const full_name = entityTypes.includes(formData.submitterType)
        ? formData.contactName.trim()
        : getDisplayName()

      const result = await apiPost<{ token: string; user: AuthUser }>('/api/auth/register', {
        submitterType: formData.submitterType,
        full_name,
        displayName: getDisplayName(),
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        password: formData.password,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        companyNumber: formData.companyNumber,
        tradingName: formData.tradingName,
        selectedMDA: formData.selectedMDA,
        courtName: formData.courtName,
        lawFirmName: formData.lawFirmName,
        barNumber: formData.barNumber,
        additionalUsers: formData.additionalUsers,
        address: formData.address,
        otherTypeSpecify: formData.otherTypeSpecify,
      })

      if (!result.success || !result.data) {
        const msg = result.error || 'Registration failed. Please try again.'
        const isEmailDuplicate = msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')
        setExistingUserError({
          isStaff: false,
          message: isEmailDuplicate
            ? 'An account with this email already exists. Please sign in instead.'
            : msg,
        })
        setIsLoading(false)
        return
      }

      const { token, user } = result.data
      setAuth(token, user)
      setEntityNumber(user.entity_number)
      const addedUsers = (result.data as any).additional_users_created
      if (Array.isArray(addedUsers)) {
        setCreatedAdditionalUsers(addedUsers)
      }
      setIsRegistered(true)
    } catch (error) {
      console.error('Registration error:', error)
      setExistingUserError({
        isStaff: false,
        message: 'An error occurred during registration. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isRegistered) {
    const selectedType = SUBMITTER_TYPES.find(t => t.value === formData.submitterType)
    
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
                  Welcome to SGC Digital
                </p>
              </div>
              <CardContent className="pt-6 pb-8">
                {/* User Details Summary */}
                <div className="rounded-lg bg-muted/50 p-4 mb-6 text-left">
                  <h3 className="font-semibold text-sm text-foreground mb-3">Your Registration Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entity Type:</span>
                      <span className="font-medium text-foreground">{selectedType?.label.split("/")[0].trim()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground">{getDisplayName()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-foreground">{formData.contactEmail}</span>
                    </div>
                    {formData.submitterType === "company" && formData.companyNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company No:</span>
                        <span className="font-medium text-foreground">{formData.companyNumber}</span>
                      </div>
                    )}
                    {createdAdditionalUsers.length > 0 && (
                      <div className="pt-2 border-t mt-2">
                        <span className="text-muted-foreground text-xs font-medium">Additional Authorized Users:</span>
                        <div className="mt-1 space-y-1.5">
                          {createdAdditionalUsers.map((u, i) => (
                            <div key={i} className="text-xs bg-muted px-2 py-1.5 rounded space-y-0.5">
                              <p className="font-medium text-foreground">{u.name} — {u.email}</p>
                              <p className="text-muted-foreground">Temp password: <span className="font-mono font-semibold text-foreground">{u.temp_password}</span></p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-1.5 text-xs text-amber-600">Share these passwords securely. Users can change them after first login.</p>
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
                  A verification email has been sent to <strong>{formData.contactEmail}</strong>. 
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
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <Card className="bg-card border-border overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-auto px-3 items-center justify-center rounded-xl bg-white/20 backdrop-blur shadow-lg">
                <span className="font-serif text-base font-semibold text-white">SGC Digital</span>
              </div>
              <h1 className="text-2xl font-medium text-white">Create an Account</h1>
              <p className="text-primary-foreground/80 mt-1">
                Register to submit and track your requests with the SGC
              </p>
            </div>
            <CardHeader className="text-center pt-6">
              <CardDescription>
                Select your entity type and complete the registration form below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Existing User Error Alert */}
              {existingUserError && (
                <Alert variant={existingUserError.isStaff ? "default" : "destructive"} className="mb-6">
                  {existingUserError.isStaff ? (
                    <Info className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className="ml-2">
                    <p>{existingUserError.message}</p>
                    {existingUserError.isStaff && (
                      <div className="mt-3 flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href="/login">Sign In to Public Portal</Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href="/management/login">Sign In to Management Portal</Link>
                        </Button>
                      </div>
                    )}
                    {!existingUserError.isStaff && (
                      <Button asChild size="sm" className="mt-2">
                        <Link href="/login">Sign In Instead</Link>
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Entity Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Entity / Submitter Type <span className="text-destructive">*</span></Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUBMITTER_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = formData.submitterType === type.value
                      return (
                        <button
                          type="button"
                          key={type.value}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            submitterType: type.value,
                            // Reset type-specific fields
                            firstName: "", middleName: "", lastName: "",
                            companyName: "", companyNumber: "", tradingName: "",
                            selectedMDA: "", courtName: "",
                            lawFirmName: "", barNumber: "",
                            contactName: "",
                            additionalUsers: []
                          }))}
                          className={`flex flex-col items-start gap-2 p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected 
                              ? `border-primary ${type.bgColor} shadow-sm` 
                              : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? type.bgColor : "bg-muted"}`}>
                              <Icon className={`h-4 w-4 ${isSelected ? type.color : "text-muted-foreground"}`} />
                            </div>
                            <span className={`text-xs font-medium flex-1 ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                              {type.label.split("/")[0].trim()}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Other Type Specification */}
                {formData.submitterType === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherTypeSpecify">Please Specify Entity Type <span className="text-destructive">*</span></Label>
                    <Input
                      id="otherTypeSpecify"
                      value={formData.otherTypeSpecify}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherTypeSpecify: e.target.value }))}
                      placeholder="Describe your entity type"
                      required
                    />
                  </div>
                )}

                {/* Type-specific fields */}
                {formData.submitterType && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-foreground">
                      {formData.submitterType === "public" && "Personal Information"}
                      {formData.submitterType === "company" && "Company Information"}
                      {(formData.submitterType === "ministry" || formData.submitterType === "statutory") && "Organization Information"}
                      {formData.submitterType === "court" && "Court Information"}
                      {formData.submitterType === "attorney" && "Legal Practice Information"}
                      {formData.submitterType === "other" && "Entity Information"}
                    </h3>

                    {/* Member of Public - First, Middle, Last Name */}
                    {formData.submitterType === "public" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="First name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="middleName">Middle Name</Label>
                          <Input
                            id="middleName"
                            value={formData.middleName}
                            onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                            placeholder="Middle name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Last name"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Company - Name and Registration Number */}
                    {formData.submitterType === "company" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                            <Input
                              id="companyName"
                              value={formData.companyName}
                              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                              placeholder="Registered company name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyNumber">Company Registration Number <span className="text-destructive">*</span></Label>
                            <Input
                              id="companyNumber"
                              value={formData.companyNumber}
                              onChange={(e) => setFormData(prev => ({ ...prev, companyNumber: e.target.value }))}
                              placeholder="e.g., BB-12345-2020"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tradingName">Trading Name (if different)</Label>
                          <Input
                            id="tradingName"
                            value={formData.tradingName}
                            onChange={(e) => setFormData(prev => ({ ...prev, tradingName: e.target.value }))}
                            placeholder="Trading or DBA name"
                          />
                        </div>
                      </>
                    )}

                    {/* MDA / Statutory Body - Select from list */}
                    {(formData.submitterType === "ministry" || formData.submitterType === "statutory") && (
                      <div className="space-y-2">
                        <Label htmlFor="selectedMDA">Select Ministry / Department / Agency <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.selectedMDA}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, selectedMDA: value }))}
                          required
                        >
                          <SelectTrigger id="selectedMDA">
                            <SelectValue placeholder="Select your MDA" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {MINISTRIES_DEPARTMENTS_AGENCIES.map((mda) => (
                              <SelectItem key={mda.value} value={mda.label}>
                                {mda.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Select your organization from the list of registered government entities</p>
                      </div>
                    )}

                    {/* Court */}
                    {formData.submitterType === "court" && (
                      <div className="space-y-2">
                        <Label htmlFor="courtName">Court Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="courtName"
                          value={formData.courtName}
                          onChange={(e) => setFormData(prev => ({ ...prev, courtName: e.target.value }))}
                          placeholder="e.g., Supreme Court of Barbados"
                          required
                        />
                      </div>
                    )}

                    {/* Attorney */}
                    {formData.submitterType === "attorney" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                              placeholder="First name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                              placeholder="Last name"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="lawFirmName">Law Firm Name</Label>
                            <Input
                              id="lawFirmName"
                              value={formData.lawFirmName}
                              onChange={(e) => setFormData(prev => ({ ...prev, lawFirmName: e.target.value }))}
                              placeholder="Firm name (if applicable)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="barNumber">Bar Number / Registration <span className="text-destructive">*</span></Label>
                            <Input
                              id="barNumber"
                              value={formData.barNumber}
                              onChange={(e) => setFormData(prev => ({ ...prev, barNumber: e.target.value }))}
                              placeholder="Bar registration number"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Other */}
                    {formData.submitterType === "other" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Contact First Name <span className="text-destructive">*</span></Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="First name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Contact Last Name <span className="text-destructive">*</span></Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Last name"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Details - Always required */}
                {formData.submitterType && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-foreground">
                      {supportsMultipleUsers ? "Primary Contact / Administrator" : "Contact Information"}
                    </h3>

                    {/* Full name for entity-type submitters (ministry/court/statutory/company) */}
                    {["ministry", "court", "statutory", "company"].includes(formData.submitterType) && (
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Person's Full Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="contactName"
                          value={formData.contactName}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                          placeholder="Full name of the primary contact"
                          required
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email Address <span className="text-destructive">*</span></Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone Number</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          value={formData.contactPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                          placeholder="+1 (246) XXX-XXXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Street address, City, Parish"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Authorized Users (for Company/MDA) */}
                {supportsMultipleUsers && formData.submitterType && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Additional Authorized Users</h3>
                        <p className="text-xs text-muted-foreground">Add other users who can log in for this entity (optional)</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addAdditionalUser}
                        disabled={formData.additionalUsers.length >= 5}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add User
                      </Button>
                    </div>
                    
                    {formData.additionalUsers.length > 0 && (
                      <div className="space-y-3">
                        {formData.additionalUsers.map((user, index) => (
                          <div key={user.id} className="flex gap-3 items-start p-3 rounded-lg bg-muted/50">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                value={user.name}
                                onChange={(e) => updateAdditionalUser(index, "name", e.target.value)}
                                placeholder="Full name"
                              />
                              <Input
                                type="email"
                                value={user.email}
                                onChange={(e) => updateAdditionalUser(index, "email", e.target.value)}
                                placeholder="Email address"
                              />
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeAdditionalUser(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        All authorized users will be able to log in using their email address and will be linked to this entity number.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Password */}
                {formData.submitterType && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-foreground">Create Password</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Create a password"
                            className="pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm your password"
                            className="pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms */}
                {formData.submitterType && (
                  <div className="flex items-start gap-3 pt-4 border-t">
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
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-md" 
                  size="lg" 
                  disabled={isLoading || !formData.terms || !formData.submitterType}
                >
                  {isLoading ? (
                    "Creating Account..."
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Submit Registration
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
