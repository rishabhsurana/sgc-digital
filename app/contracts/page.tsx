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
  CheckCircle, AlertTriangle, FileText
} from "lucide-react"
import Link from "next/link"

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
    icon: Package 
  },
  { 
    value: "consultancy", 
    label: "Consultancy / Services", 
    description: "Professional services, consulting, and service contracts",
    icon: Briefcase 
  },
  { 
    value: "works", 
    label: "Works", 
    description: "Construction, infrastructure, and public works projects",
    icon: HardHat 
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

const MINISTRIES = [
  { value: "MOF", label: "Ministry of Finance" },
  { value: "MOH", label: "Ministry of Health" },
  { value: "MOE", label: "Ministry of Education" },
  { value: "MOT", label: "Ministry of Transport" },
  { value: "MWUI", label: "Ministry of Works & Urban Infrastructure" },
  { value: "MAGR", label: "Ministry of Agriculture" },
  { value: "MLAB", label: "Ministry of Labour" },
  { value: "MCOM", label: "Ministry of Commerce" },
  { value: "MENV", label: "Ministry of Environment" },
  { value: "MTOU", label: "Ministry of Tourism" }
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
    contractNature: "",
    contractCategory: "",
    contractInstrument: "",
    contractInstrumentOther: "",
    contractType: "new",
    parentContractNumber: "",
    ministry: "",
    department: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contractorName: "",
    contractorAddress: "",
    contractTitle: "",
    contractDescription: "",
    contractValue: "",
    contractStartDate: "",
    contractEndDate: "",
    categoryOtherJustification: "",
    declaration: false
  })
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [transactionNumber, setTransactionNumber] = useState("")

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          formData.contractorName !== "" &&
          formData.contractTitle !== "" &&
          formData.contractValue !== "" &&
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
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
            <Card className="bg-card border-border">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Contract Submission Successful</h1>
                <p className="text-muted-foreground mb-6">
                  Your Government Contract request has been submitted and is now being processed by the SGC.
                </p>
                <div className="rounded-lg bg-muted p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Transaction Number</p>
                  <p className="text-xl font-mono font-bold text-foreground">{transactionNumber}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-8">
                  A confirmation email has been sent to {formData.contactEmail}. 
                  You can track the status of your contract submission from your dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Return Home</Link>
                  </Button>
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
      
      <main className="flex-1 py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">
                  Submit Government Contract Request
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Submit post-award contract requests for legal review by the Solicitor General{"'"}s Chambers.
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">Ministry/MDA Only</Badge>
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
                        return (
                          <Label
                            key={nature.value}
                            htmlFor={`nature-${nature.value}`}
                            className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50 ${
                              formData.contractNature === nature.value 
                                ? "border-primary bg-primary/5" 
                                : "border-border"
                            }`}
                          >
                            <RadioGroupItem value={nature.value} id={`nature-${nature.value}`} className="sr-only" />
                            <Icon className={`h-8 w-8 ${formData.contractNature === nature.value ? "text-primary" : "text-muted-foreground"}`} />
                            <div>
                              <span className="font-medium text-foreground">{nature.label}</span>
                              <p className="text-xs text-muted-foreground mt-1">{nature.description}</p>
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
                <CardContent className="space-y-6">
                  {/* Ministry Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Ministry/MDA Information</h3>
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
                    <h3 className="font-semibold text-foreground">Contractor Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contractorName">Contractor Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="contractorName"
                          value={formData.contractorName}
                          onChange={(e) => updateFormData("contractorName", e.target.value)}
                          placeholder="Company or individual name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractorAddress">Contractor Address</Label>
                        <Input
                          id="contractorAddress"
                          value={formData.contractorAddress}
                          onChange={(e) => updateFormData("contractorAddress", e.target.value)}
                          placeholder="Business address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contract Specifics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Contract Specifics</h3>
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
                        placeholder="Detailed description of the contract scope and deliverables..."
                        rows={4}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="contractValue">Contract Value (BBD) <span className="text-destructive">*</span></Label>
                        <Input
                          id="contractValue"
                          type="number"
                          value={formData.contractValue}
                          onChange={(e) => updateFormData("contractValue", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractStartDate">Start Date</Label>
                        <Input
                          id="contractStartDate"
                          type="date"
                          value={formData.contractStartDate}
                          onChange={(e) => updateFormData("contractStartDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractEndDate">End Date</Label>
                        <Input
                          id="contractEndDate"
                          type="date"
                          value={formData.contractEndDate}
                          onChange={(e) => updateFormData("contractEndDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Documents */}
            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Supporting Documents</CardTitle>
                  <CardDescription>
                    Upload the required supporting documents for your contract submission. 
                    The checklist below shows documents required based on your contract classification.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document Checklist */}
                  <div className="rounded-lg border border-border p-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-primary" />
                        Required Documents
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {documentRequirements.always.map((doc) => {
                          const isUploaded = files.some(f => f.documentType === doc.value)
                          return (
                            <div key={doc.value} className="flex items-center gap-2">
                              {isUploaded ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                              )}
                              <span className={`text-sm ${isUploaded ? "text-foreground" : "text-muted-foreground"}`}>
                                {doc.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {documentRequirements.optional.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground text-sm mb-2">Optional Documents (If Applicable)</h4>
                        <div className="flex flex-wrap gap-2">
                          {documentRequirements.optional.map((doc) => (
                            <Badge key={doc.value} variant="outline" className="text-xs">
                              {doc.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {missingRequiredDocs.length > 0 && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        Missing required documents: {missingRequiredDocs.map(d => d.label).join(", ")}. 
                        You may still submit, but your request may be returned for additional information.
                      </AlertDescription>
                    </Alert>
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
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>
                    Please review your contract submission details before submitting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border divide-y divide-border">
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Contract Classification</h4>
                      <div className="grid gap-2 sm:grid-cols-3">
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
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Ministry Contact</h4>
                      <p className="text-foreground">{MINISTRIES.find(m => m.value === formData.ministry)?.label}</p>
                      <p className="text-sm text-muted-foreground">{formData.contactName} - {formData.contactEmail}</p>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Contractor</h4>
                      <p className="text-foreground">{formData.contractorName}</p>
                      {formData.contractorAddress && (
                        <p className="text-sm text-muted-foreground">{formData.contractorAddress}</p>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Contract Details</h4>
                      <p className="text-foreground font-medium">{formData.contractTitle}</p>
                      <p className="text-sm text-muted-foreground mt-1">Value: BBD ${Number(formData.contractValue).toLocaleString()}</p>
                      {formData.contractStartDate && formData.contractEndDate && (
                        <p className="text-sm text-muted-foreground">
                          Period: {formData.contractStartDate} to {formData.contractEndDate}
                        </p>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Documents ({files.length})</h4>
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
