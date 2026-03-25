"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Shield, UserPlus, CheckCircle, ArrowLeft, Clock, AlertCircle } from "lucide-react"

// Management roles that can be requested
const MANAGEMENT_ROLES = [
  { value: "SG", label: "Solicitor General (SG)" },
  { value: "DSG", label: "Deputy Solicitor General (DSG)" },
  { value: "LEGAL_OFFICER", label: "Legal Officer" },
  { value: "LEGAL_ASSISTANT", label: "Legal Assistant" },
  { value: "REGISTRY_CLERK", label: "Registry Clerk" },
  { value: "REGISTRY_SUPERVISOR", label: "Registry Supervisor" },
  { value: "SG_SECRETARY", label: "SG Secretary" },
  { value: "ADMIN", label: "System Administrator" }
]

const DEPARTMENTS = [
  { value: "contracts", label: "Contracts Unit" },
  { value: "litigation", label: "Litigation Unit" },
  { value: "advisory", label: "Advisory Unit" },
  { value: "registry", label: "Registry" },
  { value: "public_trustee", label: "Public Trustee" },
  { value: "executive", label: "Executive Office" },
  { value: "admin", label: "Administration" }
]

export default function ManagementRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    employeeId: "",
    supervisor: "",
    justification: "",
    terms: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate submission (in production, this would send to the approval queue)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Store pending registration request (demo only)
    const requestId = `REQ-${Date.now().toString(36).toUpperCase()}`
    const pendingRequest = {
      requestId,
      ...formData,
      status: "PENDING_APPROVAL",
      submittedAt: new Date().toISOString(),
      approver: "ehenckel@lpacaribbean.com" // Temporary approver
    }
    
    // In production, this would be stored in a database
    const existingRequests = JSON.parse(localStorage.getItem("sgc_pending_mgmt_registrations") || "[]")
    existingRequests.push(pendingRequest)
    localStorage.setItem("sgc_pending_mgmt_registrations", JSON.stringify(existingRequests))
    
    setIsSubmitted(true)
    setIsLoading(false)
  }

  if (isSubmitted) {
    const requestId = `REQ-${Date.now().toString(36).toUpperCase()}`
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
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-primary/20 shadow-xl overflow-hidden">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Registration Submitted</h1>
              <p className="text-amber-100">
                Pending Administrator Approval
              </p>
            </div>
            <CardContent className="pt-6 pb-8">
              {/* Request Details */}
              <div className="rounded-lg bg-muted/50 p-4 mb-6 text-left">
                <h3 className="font-semibold text-sm text-foreground mb-3">Your Request Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-foreground">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role Requested:</span>
                    <span className="font-medium text-foreground">
                      {MANAGEMENT_ROLES.find(r => r.value === formData.role)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium text-foreground">
                      {DEPARTMENTS.find(d => d.value === formData.department)?.label}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Request Number */}
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 mb-6 text-center">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-2">Request Reference</p>
                <p className="text-2xl font-mono font-bold text-amber-800">{requestId}</p>
                <p className="text-xs text-amber-600 mt-2">Save this for your records</p>
              </div>
              
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your registration request has been submitted for approval. You will receive an email notification at <strong>{formData.email}</strong> once your request has been reviewed.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground mb-6 text-center">
                The System Administrator will review your request and verify your credentials.
                Approval typically takes 1-2 business days.
              </p>
              
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href="/management/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Management Login
                  </Link>
                </Button>
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
            <Link href="/management/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-primary/20 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Management Portal Registration</h1>
              <p className="text-primary-foreground/80 mt-1">
                Request access to the SGC Management System
              </p>
            </div>
            
            <CardHeader className="pt-6 pb-2">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Management portal access requires administrator approval. All registration requests are reviewed and verified before access is granted.
                </AlertDescription>
              </Alert>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2">Personal Information</h3>
                  
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Government Email <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.name@sgc.gov.bb"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Use your official government email address</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (246) XXX-XXXX"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Employment Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2">Employment Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Requested Role <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                        required
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {MANAGEMENT_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                        required
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={formData.employeeId}
                        onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                        placeholder="e.g., EMP-12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supervisor">Supervisor Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="supervisor"
                        value={formData.supervisor}
                        onChange={(e) => setFormData(prev => ({ ...prev, supervisor: e.target.value }))}
                        placeholder="Name of your direct supervisor"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Justification */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2">Access Justification</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="justification">Reason for Access Request <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="justification"
                      value={formData.justification}
                      onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                      placeholder="Please explain why you need access to the Management Portal and what functions you will be performing..."
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Minimum 20 characters required</p>
                  </div>
                </div>
                
                {/* Terms */}
                <div className="flex items-start gap-3 pt-2 border-t">
                  <Checkbox
                    id="terms"
                    checked={formData.terms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: checked === true }))}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I confirm that I am an authorized employee of the Solicitor General{"'"}s Chambers and that the information provided is accurate. I understand that my request will be reviewed and I will be notified of the outcome.
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="lg" 
                  disabled={isLoading || !formData.terms || formData.justification.length < 20}
                >
                  {isLoading ? (
                    "Submitting Request..."
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Submit Registration Request
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have approved access? </span>
                <Link href="/management/login" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
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
