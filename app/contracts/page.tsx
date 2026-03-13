"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FormStepper } from "@/components/form-stepper"
import { FileUpload, type UploadedFile } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, ArrowRight, Save, Send, Info, 
  Package, Briefcase, HardHat, Plus, RefreshCw,
  CheckCircle, AlertTriangle, FileText, Building2, User, 
  Calendar, DollarSign, Clock, MapPin, Mail, Phone,
  FileCheck, Shield, Banknote, CalendarDays, Timer
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { AskRex } from "@/components/ask-rex"
import Link from "next/link"
import { MINISTRIES_DEPARTMENTS_AGENCIES } from "@/lib/constants"

const STEPS = [
  { id: "nature", title: "Contract Nature", description: "Select contract type" },
  { id: "details", title: "Contract Details", description: "Enter contract information" },
  { id: "documents", title: "Documents", description: "Upload required files" },
  { id: "review", title: "Review", description: "Review and submit" }
]

const CONTRACT_NATURES = [
  { 
    value: "goods", 
    label: "Goods", 
    description: "Procurement of goods, supplies, and equipment",
    icon: Package,
    bgColor: "from-blue-500 to-blue-600",
    borderColor: "border-blue-600"
  },
  { 
    value: "consultancy", 
    label: "Consultancy / Services", 
    description: "Professional services, consulting, and service contracts",
    icon: Briefcase,
    bgColor: "from-purple-500 to-purple-600",
    borderColor: "border-purple-600"
  },
  { 
    value: "works", 
    label: "Works", 
    description: "Construction, infrastructure, and public works projects",
    icon: HardHat,
    bgColor: "from-amber-500 to-amber-600",
    borderColor: "border-amber-600"
  }
]

const CONTRACT_CATEGORIES = {
  goods: [
    { value: "CAT_PROC", label: "Procurement of Goods & Services" },
    { value: "CAT_LEASE", label: "Lease / Property (Equipment Lease)" },
    { value: "CAT_MOU", label: "Inter-Agency / MOU (Supply-related)" }
  ],
  consultancy: [
    { value: "CAT_CONS", label: "Consultancy / Professional Services" },
    { value: "CAT_PROC", label: "Procurement of Goods & Services" },
    { value: "CAT_EMP", label: "Employment / Personnel" },
    { value: "CAT_MOU", label: "Inter-Agency / MOU" }
  ],
  works: [
    { value: "CAT_CONST", label: "Construction / Public Works" },
    { value: "CAT_PROC", label: "Procurement of Goods & Services" },
    { value: "CAT_MOU", label: "Inter-Agency / MOU (Infrastructure-related)" },
    { value: "CAT_OTHER", label: "Other (Requires justification)" }
  ]
}

const CONTRACT_INSTRUMENTS = {
  goods: [
    { value: "GDS", label: "Goods" },
    { value: "UNI", label: "Uniforms" },
    { value: "OTHER", label: "Other" }
  ],
  consultancy: [
    { value: "CLEAN", label: "Cleaning Services" },
    { value: "CONS_CO", label: "Consultancy - Company" },
    { value: "CONS_IND", label: "Consultant/Independent Contractor" },
    { value: "CONS_INDV", label: "Individual Consultant" },
    { value: "CONS_IDB", label: "Individual Consultant (IDB-funded)" },
    { value: "SVC", label: "Services" },
    { value: "OTHER", label: "Other" }
  ],
  works: [
    { value: "WORKS", label: "Works" },
    { value: "OTHER", label: "Other" }
  ]
}

const CONTRACT_TYPES = [
  { value: "new", label: "New Contract", icon: Plus },
  { value: "renewal", label: "Renewal", icon: RefreshCw },
  { value: "supplemental", label: "Supplemental", icon: Plus }
]

const MINISTRIES = MINISTRIES_DEPARTMENTS_AGENCIES

const CONTRACTOR_TYPES = [
  { value: "company", label: "Company / Corporation" },
  { value: "individual", label: "Individual / Sole Trader" },
  { value: "joint-venture", label: "Joint Venture / Consortium" },
  { value: "government", label: "Government Entity" },
  { value: "ngo", label: "NGO / Non-Profit" }
]

const FUNDING_SOURCES = [
  { value: "budget", label: "Government Budget (Recurrent)" },
  { value: "capital", label: "Government Budget (Capital)" },
  { value: "grant", label: "Grant / Donor Funded" },
  { value: "loan", label: "Loan Funded (IDB, CDB, etc.)" },
  { value: "mixed", label: "Mixed / Multiple Sources" },
  { value: "other", label: "Other" }
]

const PROCUREMENT_METHODS = [
  { value: "open-tender", label: "Open Competitive Tender" },
  { value: "selective-tender", label: "Selective / Limited Tender" },
  { value: "single-source", label: "Single Source Procurement" },
  { value: "framework", label: "Framework Agreement" },
  { value: "direct", label: "Direct Procurement (Below Threshold)" },
  { value: "emergency", label: "Emergency Procurement" }
]

const CURRENCIES = [
  { value: "BBD", label: "BBD - Barbados Dollar" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "XCD", label: "XCD - East Caribbean Dollar" }
]

const COUNTRIES = [
  { value: "Barbados", label: "Barbados" },
  { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
  { value: "Jamaica", label: "Jamaica" },
  { value: "Guyana", label: "Guyana" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Other", label: "Other" }
]

// Document requirements based on nature + category
const REQUIRED_DOCUMENTS = {
  goods: {
    always: [
      { value: "FORM_ACCEPT", label: "Acceptance of Award" },
      { value: "FORM_LOA", label: "Letter of Award" },
      { value: "FORM_PAY_SCHED", label: "Payment Schedule" },
      { value: "PROC_SPECS", label: "Specifications" },
      { value: "PROC_TENDER", label: "Tender Documents" }
    ],
    optional: [
      { value: "FORM_DRAFT", label: "Draft Contract" },
      { value: "PROC_SSP_APPR", label: "Single Source Approval" },
      { value: "PROC_SSP_REQ", label: "Single Source Request" }
    ]
  },
  consultancy: {
    always: [
      { value: "FORM_ACCEPT", label: "Acceptance of Award" },
      { value: "FORM_LOA", label: "Letter of Award" },
      { value: "FORM_PAY_SCHED", label: "Payment Schedule" },
      { value: "FORM_SCHED_DELIV", label: "Schedule of Deliverables" },
      { value: "PROC_PROP", label: "Proposal" },
      { value: "PROC_TENDER", label: "Tender Documents" },
      { value: "PROC_TOR", label: "Terms of Reference" }
    ],
    optional: [
      { value: "DUE_BUS_REG", label: "Business Registration" },
      { value: "DUE_GS", label: "Certificate of Good Standing" },
      { value: "DUE_INCORP", label: "Company Incorporation Documents" },
      { value: "FIN_BOND", label: "Performance Bond" },
      { value: "FIN_SURETY", label: "Proof of Surety" },
      { value: "FORM_DRAFT", label: "Draft Contract" },
      { value: "FORM_LOE", label: "Letter of Engagement" },
      { value: "PROC_CAB_APPR", label: "Cabinet Approval" },
      { value: "PROC_CAB_PAPER", label: "Cabinet Paper" },
      { value: "PROC_SSP_APPR", label: "Single Source Approval" },
      { value: "PROC_SSP_REQ", label: "Single Source Request" }
    ]
  },
  works: {
    always: [
      { value: "FORM_ACCEPT", label: "Acceptance of Award" },
      { value: "FORM_LOA", label: "Letter of Award" },
      { value: "FORM_PAY_SCHED", label: "Payment Schedule" },
      { value: "PROC_BOQ", label: "Bill of Quantities" },
      { value: "PROC_DRAWINGS", label: "Drawings/Plans" },
      { value: "PROC_TENDER", label: "Tender Documents" }
    ],
    optional: [
      { value: "FIN_BOND", label: "Performance Bond" },
      { value: "FIN_SURETY", label: "Proof of Surety" },
      { value: "FORM_DRAFT", label: "Draft Contract" },
      { value: "PROC_CAB_APPR", label: "Cabinet Approval" },
      { value: "PROC_CAB_PAPER", label: "Cabinet Paper" },
      { value: "PROC_SSP_APPR", label: "Single Source Approval" },
      { value: "PROC_SSP_REQ", label: "Single Source Request" }
    ]
  }
}

export default function ContractsPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Contract Classification
    contractNature: "",
    contractCategory: "",
    contractInstrument: "",
    contractInstrumentOther: "",
    contractType: "new",
    parentContractNumber: "",
    categoryOtherJustification: "",
    
    // Ministry/MDA Information
    ministry: "",
    department: "",
    ministryFileReference: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    
    // Contractor Information
    contractorType: "company",
    contractorName: "",
    contractorAddress: "",
    contractorCity: "",
    contractorCountry: "Barbados",
    contractorEmail: "",
    contractorPhone: "",
    companyRegistrationNumber: "",
    taxIdentificationNumber: "",
    
    // Contract Details
    contractTitle: "",
    contractDescription: "",
    scopeOfWork: "",
    keyDeliverables: "",
    contractCurrency: "BBD",
    contractValue: "",
    fundingSource: "budget",
    procurementMethod: "open-tender",
    isSingleSource: false,
    awardDate: "",
    contractStartDate: "",
    contractEndDate: "",
    contractDuration: "",
    renewalTerm: "",
    
    // Document exceptions
    missingDocumentReason: "",
    
    // Declaration
    declaration: false
  })
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [transactionNumber, setTransactionNumber] = useState("")

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-calculate duration when start or end date changes
      if ((field === "contractStartDate" || field === "contractEndDate") && 
          newData.contractStartDate && newData.contractEndDate) {
        const start = new Date(newData.contractStartDate)
        const end = new Date(newData.contractEndDate)
        
        if (end > start) {
          const diffTime = Math.abs(end.getTime() - start.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays >= 365) {
            const years = Math.floor(diffDays / 365)
            const remainingMonths = Math.floor((diffDays % 365) / 30)
            newData.contractDuration = remainingMonths > 0 
              ? `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
              : `${years} year${years > 1 ? 's' : ''}`
          } else if (diffDays >= 30) {
            const months = Math.floor(diffDays / 30)
            const remainingDays = diffDays % 30
            newData.contractDuration = remainingDays > 0 
              ? `${months} month${months > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
              : `${months} month${months > 1 ? 's' : ''}`
          } else {
            newData.contractDuration = `${diffDays} day${diffDays > 1 ? 's' : ''}`
          }
        }
      }
      
      return newData
    })
  }

  // Get available categories based on nature
  const availableCategories = useMemo(() => {
    if (!formData.contractNature) return []
    return CONTRACT_CATEGORIES[formData.contractNature as keyof typeof CONTRACT_CATEGORIES] || []
  }, [formData.contractNature])

  // Get available instruments based on nature
  const availableInstruments = useMemo(() => {
    if (!formData.contractNature) return []
    return CONTRACT_INSTRUMENTS[formData.contractNature as keyof typeof CONTRACT_INSTRUMENTS] || []
  }, [formData.contractNature])

  // Get required and optional documents based on nature
  const documentRequirements = useMemo(() => {
    if (!formData.contractNature) return { always: [], optional: [] }
    return REQUIRED_DOCUMENTS[formData.contractNature as keyof typeof REQUIRED_DOCUMENTS] || { always: [], optional: [] }
  }, [formData.contractNature])

  // Get all document types for file upload
  const allDocumentTypes = useMemo(() => {
    return [
      ...documentRequirements.always,
      ...documentRequirements.optional,
      { value: "OTHER", label: "Other Document" }
    ]
  }, [documentRequirements])

  // Check if required documents are uploaded
  const missingRequiredDocs = useMemo(() => {
    const uploadedTypes = files.map(f => f.documentType)
    return documentRequirements.always.filter(doc => !uploadedTypes.includes(doc.value))
  }, [files, documentRequirements.always])

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.contractNature !== "" &&
          formData.contractCategory !== "" &&
          formData.contractInstrument !== "" &&
          (formData.contractInstrument !== "OTHER" || formData.contractInstrumentOther !== "") &&
          (formData.contractCategory !== "CAT_OTHER" || formData.categoryOtherJustification !== "")
        )
      case 1:
        return (
          formData.ministry !== "" &&
          formData.contactName !== "" &&
          formData.contactEmail !== "" &&
          formData.contractorType !== "" &&
          formData.contractorName !== "" &&
          formData.contractTitle !== "" &&
          formData.contractValue !== "" &&
          formData.procurementMethod !== "" &&
          formData.fundingSource !== "" &&
          (formData.contractType === "new" || formData.parentContractNumber !== "")
        )
      case 2:
        return files.every(f => f.documentType !== "")
      case 3:
        return formData.declaration
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const txn = `CON-${Date.now().toString(36).toUpperCase()}`
    setTransactionNumber(txn)
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <AskRex position="content" />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
            <Card className="bg-card border-border overflow-hidden">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Contract Submission Successful</h1>
                <p className="text-green-100">
                  Your request is now being processed by the SGC
                </p>
              </div>
              
              <CardContent className="pt-6 pb-8">
                {/* Transaction Number Card */}
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/10 border border-primary/20 p-6 mb-6 text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Transaction Number</p>
                  <p className="text-3xl font-mono font-bold text-primary">{transactionNumber}</p>
                  <p className="text-xs text-muted-foreground mt-2">Save this number for your records</p>
                </div>
                
                {/* Summary */}
                <div className="rounded-lg bg-muted/50 p-4 mb-6 text-left">
                  <h3 className="font-semibold text-sm text-foreground mb-3">Submission Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ministry:</span>
                      <span className="font-medium text-foreground">{MINISTRIES.find(m => m.value === formData.ministry)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium text-foreground">{formData.contactName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contract:</span>
                      <span className="font-medium text-foreground truncate max-w-[200px]">{formData.contractTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-medium text-foreground">{formData.contractCurrency} ${Number(formData.contractValue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contractor:</span>
                      <span className="font-medium text-foreground">{formData.contractorName}</span>
                    </div>
                    {formData.contractDuration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium text-foreground">{formData.contractDuration}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Next Steps */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2">What Happens Next?</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Your contract request will be reviewed by the SGC</li>
                    <li>You may be contacted for additional documents if needed</li>
                    <li>Track progress anytime from your Dashboard</li>
                  </ol>
                </div>
                
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground mb-6">
                  <Mail className="h-4 w-4" />
                  <span>Confirmation sent to {formData.contactEmail}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/">Return Home</Link>
                  </Button>
                </div>
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Access your <Link href="/dashboard" className="text-primary hover:underline font-medium">Dashboard</Link> anytime to view all submissions and their current status.
                </p>
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
      <AskRex position="content" />
      
      <main className="flex-1 py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            {/* Hero Banner */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-800 p-6 mb-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                      Submit Government Contract
                    </h1>
                    <p className="mt-1 text-white/80">
                      Submit post-award contract requests for legal review by the Solicitor General{"'"}s Chambers.
                    </p>
                  </div>
                </div>
                <Badge className="shrink-0 bg-white/20 text-white border-0">Ministry/MDA Only</Badge>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="flex items-center gap-4 px-1">
              <div className="flex-1">
                <Progress value={(currentStep / (STEPS.length - 1)) * 100} className="h-2" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <FormStepper steps={STEPS} currentStep={currentStep} className="mb-8" />

          {/* Form Card */}
          <Card className="bg-card border-border">
            {/* Step 1: Contract Nature & Classification */}
            {currentStep === 0 && (
              <>
                <CardHeader>
                  <CardTitle>Contract Classification</CardTitle>
                  <CardDescription>
                    Select the nature, category, and instrument type for your contract. 
                    This determines the required supporting documents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Guidance Box */}
                  <div className="flex items-start gap-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">How to classify your contract</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Start by selecting the nature of your contract below. This will determine the available categories 
                        and required documents. For assistance, contact the SGC Registry.
                      </p>
                    </div>
                  </div>
                  
                  {/* Nature of Contract */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Nature of Contract <span className="text-destructive">*</span></Label>
                    <RadioGroup
                      value={formData.contractNature}
                      onValueChange={(value) => {
                        updateFormData("contractNature", value)
                        updateFormData("contractCategory", "")
                        updateFormData("contractInstrument", "")
                      }}
                      className="grid gap-4 sm:grid-cols-3"
                    >
                      {CONTRACT_NATURES.map((nature) => {
                        const Icon = nature.icon
                        const isSelected = formData.contractNature === nature.value
                        return (
                          <Label
                            key={nature.value}
                            htmlFor={`nature-${nature.value}`}
                            className={`relative flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 p-6 text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                              isSelected 
                                ? `bg-gradient-to-br ${nature.bgColor} ${nature.borderColor} shadow-lg` 
                                : "border-border hover:border-muted-foreground/30"
                            }`}
                          >
                            <RadioGroupItem value={nature.value} id={`nature-${nature.value}`} className="sr-only" />
                            {isSelected && (
                              <div className="absolute top-3 right-3">
                                <CheckCircle className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isSelected ? "bg-white/20 backdrop-blur-sm" : "bg-muted"}`}>
                              <Icon className={`h-8 w-8 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <span className={`text-lg font-semibold ${isSelected ? "text-white" : "text-foreground"}`}>{nature.label}</span>
                              <p className={`text-xs mt-2 leading-relaxed ${isSelected ? "text-white/90" : "text-muted-foreground"}`}>{nature.description}</p>
                            </div>
                          </Label>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  {/* Contract Category */}
                  {formData.contractNature && (
                    <div className="space-y-2">
                      <Label htmlFor="contractCategory">Contract Category <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.contractCategory}
                        onValueChange={(value) => updateFormData("contractCategory", value)}
                      >
                        <SelectTrigger id="contractCategory">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Category Other Justification */}
                  {formData.contractCategory === "CAT_OTHER" && (
                    <div className="space-y-2">
                      <Label htmlFor="categoryOtherJustification">
                        Justification for Other Category <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="categoryOtherJustification"
                        value={formData.categoryOtherJustification}
                        onChange={(e) => updateFormData("categoryOtherJustification", e.target.value)}
                        placeholder="Explain why the existing categories do not apply..."
                        rows={3}
                      />
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          Category {"\""}Other{"\""} requires SG/DSG approval before processing can proceed.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Contract Instrument */}
                  {formData.contractNature && (
                    <div className="space-y-2">
                      <Label htmlFor="contractInstrument">Contract Instrument/Template Type <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.contractInstrument}
                        onValueChange={(value) => updateFormData("contractInstrument", value)}
                      >
                        <SelectTrigger id="contractInstrument">
                          <SelectValue placeholder="Select instrument type" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableInstruments.map((instrument) => (
                            <SelectItem key={instrument.value} value={instrument.value}>
                              {instrument.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Instrument Other SubType */}
                  {formData.contractInstrument === "OTHER" && (
                    <div className="space-y-2">
                      <Label htmlFor="contractInstrumentOther">
                        Specify Instrument Type <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contractInstrumentOther"
                        value={formData.contractInstrumentOther}
                        onChange={(e) => updateFormData("contractInstrumentOther", e.target.value)}
                        placeholder="Describe the contract instrument type"
                      />
                    </div>
                  )}

                  {/* Contract Type */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Contract Type <span className="text-destructive">*</span></Label>
                    <RadioGroup
                      value={formData.contractType}
                      onValueChange={(value) => updateFormData("contractType", value)}
                      className="flex gap-4"
                    >
                      {CONTRACT_TYPES.map((type) => (
                        <Label
                          key={type.value}
                          htmlFor={`type-${type.value}`}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors hover:bg-muted/50 ${
                            formData.contractType === type.value 
                              ? "border-primary bg-primary/5" 
                              : "border-border"
                          }`}
                        >
                          <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Parent Contract Reference */}
                  {(formData.contractType === "renewal" || formData.contractType === "supplemental") && (
                    <div className="space-y-2">
                      <Label htmlFor="parentContractNumber">
                        Parent Contract Transaction Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="parentContractNumber"
                        value={formData.parentContractNumber}
                        onChange={(e) => updateFormData("parentContractNumber", e.target.value)}
                        placeholder="CON-XXXXXX or prior contract reference"
                      />
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* Step 2: Contract Details */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                  <CardDescription>
                    Provide information about the Ministry, contractor, and contract specifics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Ministry Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Ministry/MDA Information
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ministry">Ministry/MDA <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.ministry}
                          onValueChange={(value) => updateFormData("ministry", value)}
                        >
                          <SelectTrigger id="ministry">
                            <SelectValue placeholder="Select Ministry" />
                          </SelectTrigger>
                          <SelectContent>
                            {MINISTRIES.map((ministry) => (
                              <SelectItem key={ministry.value} value={ministry.value}>
                                {ministry.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department / Unit</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => updateFormData("department", e.target.value)}
                          placeholder="Department or unit name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ministryFileReference">Ministry File Reference</Label>
                      <Input
                        id="ministryFileReference"
                        value={formData.ministryFileReference}
                        onChange={(e) => updateFormData("ministryFileReference", e.target.value)}
                        placeholder="Internal ministry file or reference number"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="contactName"
                          value={formData.contactName}
                          onChange={(e) => updateFormData("contactName", e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email <span className="text-destructive">*</span></Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => updateFormData("contactEmail", e.target.value)}
                          placeholder="email@gov.bb"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          value={formData.contactPhone}
                          onChange={(e) => updateFormData("contactPhone", e.target.value)}
                          placeholder="+1 (246) XXX-XXXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contractor Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Contractor Information
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contractorType">Contractor Type <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.contractorType}
                          onValueChange={(value) => updateFormData("contractorType", value)}
                        >
                          <SelectTrigger id="contractorType">
                            <SelectValue placeholder="Select contractor type" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTRACTOR_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractorName">Contractor Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="contractorName"
                          value={formData.contractorName}
                          onChange={(e) => updateFormData("contractorName", e.target.value)}
                          placeholder="Company or individual name"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contractorAddress">Street Address</Label>
                        <Input
                          id="contractorAddress"
                          value={formData.contractorAddress}
                          onChange={(e) => updateFormData("contractorAddress", e.target.value)}
                          placeholder="Business address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractorCity">City / Parish</Label>
                        <Input
                          id="contractorCity"
                          value={formData.contractorCity}
                          onChange={(e) => updateFormData("contractorCity", e.target.value)}
                          placeholder="City or parish"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="contractorCountry">Country</Label>
                        <Select
                          value={formData.contractorCountry}
                          onValueChange={(value) => updateFormData("contractorCountry", value)}
                        >
                          <SelectTrigger id="contractorCountry">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractorEmail">Contractor Email</Label>
                        <Input
                          id="contractorEmail"
                          type="email"
                          value={formData.contractorEmail}
                          onChange={(e) => updateFormData("contractorEmail", e.target.value)}
                          placeholder="contractor@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractorPhone">Contractor Phone</Label>
                        <Input
                          id="contractorPhone"
                          type="tel"
                          value={formData.contractorPhone}
                          onChange={(e) => updateFormData("contractorPhone", e.target.value)}
                          placeholder="+1 (246) XXX-XXXX"
                        />
                      </div>
                    </div>
                    {formData.contractorType === "company" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="companyRegistrationNumber">Company Registration Number</Label>
                          <Input
                            id="companyRegistrationNumber"
                            value={formData.companyRegistrationNumber}
                            onChange={(e) => updateFormData("companyRegistrationNumber", e.target.value)}
                            placeholder="Business registration number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxIdentificationNumber">Tax Identification Number (TIN)</Label>
                          <Input
                            id="taxIdentificationNumber"
                            value={formData.taxIdentificationNumber}
                            onChange={(e) => updateFormData("taxIdentificationNumber", e.target.value)}
                            placeholder="Tax ID number"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contract Specifics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-primary" />
                      Contract Specifics
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="contractTitle">Contract Title <span className="text-destructive">*</span></Label>
                      <Input
                        id="contractTitle"
                        value={formData.contractTitle}
                        onChange={(e) => updateFormData("contractTitle", e.target.value)}
                        placeholder="Brief title describing the contract"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractDescription">Contract Description</Label>
                      <Textarea
                        id="contractDescription"
                        value={formData.contractDescription}
                        onChange={(e) => updateFormData("contractDescription", e.target.value)}
                        placeholder="Detailed description of the contract scope..."
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="scopeOfWork">Scope of Work Summary</Label>
                        <Textarea
                          id="scopeOfWork"
                          value={formData.scopeOfWork}
                          onChange={(e) => updateFormData("scopeOfWork", e.target.value)}
                          placeholder="Summary of work to be performed..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="keyDeliverables">Key Deliverables</Label>
                        <Textarea
                          id="keyDeliverables"
                          value={formData.keyDeliverables}
                          onChange={(e) => updateFormData("keyDeliverables", e.target.value)}
                          placeholder="List main deliverables..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial & Procurement */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-primary" />
                      Financial & Procurement
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="contractCurrency">Currency <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.contractCurrency}
                          onValueChange={(value) => updateFormData("contractCurrency", value)}
                        >
                          <SelectTrigger id="contractCurrency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="contractValue" className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-green-600" />
                          Contract Value <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="contractValue"
                            type="number"
                            value={formData.contractValue}
                            onChange={(e) => updateFormData("contractValue", e.target.value)}
                            placeholder="0.00"
                            className="pl-8 text-lg font-semibold"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                        </div>
                        {formData.contractValue && Number(formData.contractValue) > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {formData.contractCurrency} {Number(formData.contractValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fundingSource">Funding Source <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.fundingSource}
                          onValueChange={(value) => updateFormData("fundingSource", value)}
                        >
                          <SelectTrigger id="fundingSource">
                            <SelectValue placeholder="Select funding source" />
                          </SelectTrigger>
                          <SelectContent>
                            {FUNDING_SOURCES.map((source) => (
                              <SelectItem key={source.value} value={source.value}>
                                {source.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="procurementMethod">Procurement Method <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.procurementMethod}
                          onValueChange={(value) => {
                            updateFormData("procurementMethod", value)
                            updateFormData("isSingleSource", value === "single-source")
                          }}
                        >
                          <SelectTrigger id="procurementMethod">
                            <SelectValue placeholder="Select procurement method" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROCUREMENT_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {formData.procurementMethod === "single-source" && (
                      <Alert className="bg-amber-50 border-amber-200">
                        <Info className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          Single Source Procurement requires additional supporting documents including Single Source Request and Approval.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Contract Period */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      Contract Period
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="awardDate" className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Award Date
                        </Label>
                        <Input
                          id="awardDate"
                          type="date"
                          value={formData.awardDate}
                          onChange={(e) => updateFormData("awardDate", e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractStartDate" className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-green-600" />
                          Start Date
                        </Label>
                        <Input
                          id="contractStartDate"
                          type="date"
                          value={formData.contractStartDate}
                          onChange={(e) => updateFormData("contractStartDate", e.target.value)}
                          className="bg-background border-green-200 focus:border-green-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractEndDate" className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-red-500" />
                          End Date
                        </Label>
                        <Input
                          id="contractEndDate"
                          type="date"
                          value={formData.contractEndDate}
                          onChange={(e) => updateFormData("contractEndDate", e.target.value)}
                          className="bg-background border-red-200 focus:border-red-400"
                        />
                      </div>
                    </div>
                    
                    {/* Auto-calculated Duration Display */}
                    {formData.contractDuration && (
                      <div className="rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-accent/10 border border-primary/20 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Timer className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contract Duration</p>
                            <p className="text-2xl font-bold text-primary">{formData.contractDuration}</p>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-0 px-3 py-1">
                            Auto-calculated
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {!formData.contractDuration && formData.contractStartDate && formData.contractEndDate && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          End date must be after start date to calculate duration.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {(formData.contractType === "renewal") && (
                      <div className="space-y-2">
                        <Label htmlFor="renewalTerm" className="flex items-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                          Renewal Term Details
                        </Label>
                        <Input
                          id="renewalTerm"
                          value={formData.renewalTerm}
                          onChange={(e) => updateFormData("renewalTerm", e.target.value)}
                          placeholder="e.g., Second renewal of 12 months"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Documents */}
            {currentStep === 2 && (
              <>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Supporting Documents</CardTitle>
                      <CardDescription>
                        Upload required documents based on your contract classification.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Document Progress */}
                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-green-900 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Document Checklist
                      </h4>
                      <Badge className={`${
                        missingRequiredDocs.length === 0 
                          ? "bg-green-100 text-green-700 border-green-300" 
                          : "bg-amber-100 text-amber-700 border-amber-300"
                      }`}>
                        {documentRequirements.always.length - missingRequiredDocs.length} / {documentRequirements.always.length} uploaded
                      </Badge>
                    </div>
                    <Progress 
                      value={((documentRequirements.always.length - missingRequiredDocs.length) / documentRequirements.always.length) * 100} 
                      className="h-2 mb-4"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      {documentRequirements.always.map((doc) => {
                        const isUploaded = files.some(f => f.documentType === doc.value)
                        return (
                          <div key={doc.value} className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isUploaded ? "bg-green-100/50" : "bg-white/50"}`}>
                            {isUploaded ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-amber-400 flex items-center justify-center">
                                <span className="text-xs text-amber-600">!</span>
                              </div>
                            )}
                            <span className={`text-sm ${isUploaded ? "text-green-800 font-medium" : "text-muted-foreground"}`}>
                              {doc.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {documentRequirements.optional.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <h4 className="font-medium text-foreground text-sm mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Optional Documents (If Applicable)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {documentRequirements.optional.map((doc) => (
                          <Badge key={doc.value} variant="outline" className="text-xs bg-background">
                            {doc.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {missingRequiredDocs.length > 0 && (
                    <>
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          Missing required documents: {missingRequiredDocs.map(d => d.label).join(", ")}. 
                          You may still submit, but your request may be returned for additional information.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <Label htmlFor="missingDocumentReason">
                          Reason for Missing Documents (if applicable)
                        </Label>
                        <Textarea
                          id="missingDocumentReason"
                          value={formData.missingDocumentReason}
                          onChange={(e) => updateFormData("missingDocumentReason", e.target.value)}
                          placeholder="Explain why required documents are not available or will be provided later..."
                          rows={2}
                        />
                      </div>
                    </>
                  )}

                  <FileUpload
                    files={files}
                    onFilesChange={setFiles}
                    documentTypes={allDocumentTypes}
                  />
                </CardContent>
              </>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <>
                <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent border-b">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle>Review & Submit</CardTitle>
                      <CardDescription>
                        Please review your contract submission details before submitting.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {/* Classification */}
                    <div className="p-5 bg-muted/30">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Contract Classification
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Nature</p>
                          <p className="text-foreground font-medium">
                            {CONTRACT_NATURES.find(n => n.value === formData.contractNature)?.label}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <p className="text-foreground font-medium">
                            {availableCategories.find(c => c.value === formData.contractCategory)?.label}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Instrument</p>
                          <p className="text-foreground font-medium">
                            {formData.contractInstrument === "OTHER" 
                              ? formData.contractInstrumentOther 
                              : availableInstruments.find(i => i.value === formData.contractInstrument)?.label}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contract Type</p>
                          <p className="text-foreground font-medium capitalize">{formData.contractType}</p>
                        </div>
                      </div>
                      {formData.parentContractNumber && (
                        <p className="text-sm text-muted-foreground mt-2">Parent Contract: {formData.parentContractNumber}</p>
                      )}
                    </div>
                    
                    {/* Ministry */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Ministry/MDA</h4>
                      <p className="text-foreground font-medium">{MINISTRIES.find(m => m.value === formData.ministry)?.label}</p>
                      {formData.department && <p className="text-sm text-muted-foreground">{formData.department}</p>}
                      {formData.ministryFileReference && (
                        <p className="text-sm text-muted-foreground">Ministry Ref: {formData.ministryFileReference}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        Contact: {formData.contactName} | {formData.contactEmail}
                        {formData.contactPhone && ` | ${formData.contactPhone}`}
                      </p>
                    </div>
                    
                    {/* Contractor */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Contractor</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-foreground font-medium">{formData.contractorName}</p>
                          <p className="text-sm text-muted-foreground">
                            {CONTRACTOR_TYPES.find(t => t.value === formData.contractorType)?.label}
                          </p>
                          {(formData.contractorAddress || formData.contractorCity) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {[formData.contractorAddress, formData.contractorCity, formData.contractorCountry].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                        <div>
                          {formData.contractorEmail && (
                            <p className="text-sm text-muted-foreground">{formData.contractorEmail}</p>
                          )}
                          {formData.contractorPhone && (
                            <p className="text-sm text-muted-foreground">{formData.contractorPhone}</p>
                          )}
                          {formData.companyRegistrationNumber && (
                            <p className="text-sm text-muted-foreground">Reg #: {formData.companyRegistrationNumber}</p>
                          )}
                          {formData.taxIdentificationNumber && (
                            <p className="text-sm text-muted-foreground">TIN: {formData.taxIdentificationNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Contract Details */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Contract Details</h4>
                      <p className="text-foreground font-medium">{formData.contractTitle}</p>
                      {formData.contractDescription && (
                        <p className="text-sm text-muted-foreground mt-1">{formData.contractDescription}</p>
                      )}
                      {formData.scopeOfWork && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Scope of Work:</p>
                          <p className="text-sm text-foreground">{formData.scopeOfWork}</p>
                        </div>
                      )}
                      {formData.keyDeliverables && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Key Deliverables:</p>
                          <p className="text-sm text-foreground">{formData.keyDeliverables}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Financial & Period */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Financial & Period</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Contract Value</p>
                          <p className="text-foreground font-medium text-lg">
                            {formData.contractCurrency} ${Number(formData.contractValue).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {FUNDING_SOURCES.find(f => f.value === formData.fundingSource)?.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {PROCUREMENT_METHODS.find(p => p.value === formData.procurementMethod)?.label}
                          </p>
                        </div>
                        <div>
                          {formData.awardDate && (
                            <p className="text-sm text-muted-foreground">Award Date: {formData.awardDate}</p>
                          )}
                          {(formData.contractStartDate || formData.contractEndDate) && (
                            <p className="text-sm text-muted-foreground">
                              Period: {formData.contractStartDate || "TBD"} to {formData.contractEndDate || "TBD"}
                            </p>
                          )}
                          {formData.contractDuration && (
                            <p className="text-sm text-muted-foreground">Duration: {formData.contractDuration}</p>
                          )}
                          {formData.renewalTerm && (
                            <p className="text-sm text-muted-foreground">Renewal: {formData.renewalTerm}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Documents */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Documents ({files.length})</h4>
                      {files.length === 0 ? (
                        <p className="text-muted-foreground">No documents uploaded</p>
                      ) : (
                        <ul className="space-y-1">
                          {files.map((file) => (
                            <li key={file.id} className="text-sm text-foreground flex items-center gap-2">
                              <FileText className="h-3 w-3 text-primary" />
                              {file.file.name} ({allDocumentTypes.find(t => t.value === file.documentType)?.label})
                            </li>
                          ))}
                        </ul>
                      )}
                      {formData.missingDocumentReason && (
                        <div className="mt-3 p-2 bg-amber-50 rounded text-sm">
                          <p className="text-xs text-amber-600 font-medium">Missing Documents Reason:</p>
                          <p className="text-amber-800">{formData.missingDocumentReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {missingRequiredDocs.length > 0 && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        Some required documents are missing. Your submission may be returned for additional information.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                    <Checkbox
                      id="declaration"
                      checked={formData.declaration}
                      onCheckedChange={(checked) => updateFormData("declaration", checked === true)}
                    />
                    <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
                      I declare that I am authorized to submit this contract request on behalf of the Ministry/MDA indicated above. 
                      The information provided is true and accurate to the best of my knowledge. 
                      I understand that the contract will be reviewed by the Solicitor General{"'"}s Chambers before finalization.
                    </Label>
                  </div>
                </CardContent>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-border p-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button variant="ghost">
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                
                {currentStep < STEPS.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={!canProceed()}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Contract Request
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
