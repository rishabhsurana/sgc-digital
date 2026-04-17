"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
import { ArrowLeft, ArrowRight, Save, Send, Info, FileText, Gavel, FileStack, HelpCircle, CheckCircle, Scale, Globe, UserCheck, Lock, AlertCircle } from "lucide-react"
import { AskRex } from "@/components/ask-rex"
import Link from "next/link"
import { MINISTRIES_DEPARTMENTS_AGENCIES } from "@/lib/constants"
import { apiGet, apiPost, apiPostFormData, apiPut } from "@/lib/api-client"
import { RequireAuthGuard } from "@/components/require-auth-guard"
import { getUser } from "@/lib/auth"

const STEPS = [
  { id: "type", title: "Type", description: "Select correspondence type" },
  { id: "details", title: "Details", description: "Enter submission details" },
  { id: "documents", title: "Documents", description: "Upload supporting files" },
  { id: "review", title: "Review", description: "Review and submit" }
]

const CORRESPONDENCE_TYPES = [
  { 
    value: "general", 
    label: "General", 
    description: "General enquiries and correspondence to the SGC",
    icon: FileText,
    bgColor: "from-blue-500 to-blue-600",
    borderColor: "border-blue-600"
  },
  { 
    value: "litigation", 
    label: "Litigation", 
    description: "Court-related matters and litigation correspondence",
    icon: Gavel,
    bgColor: "from-rose-500 to-rose-600",
    borderColor: "border-rose-600"
  },
  { 
    value: "compensation", 
    label: "Compensation", 
    description: "Compensation claims and related matters",
    icon: Scale,
    bgColor: "from-amber-500 to-amber-600",
    borderColor: "border-amber-600"
  },
  { 
    value: "public-trustee", 
    label: "Public Trustee", 
    description: "Matters relating to the Public Trustee",
    icon: UserCheck,
    bgColor: "from-emerald-500 to-emerald-600",
    borderColor: "border-emerald-600"
  },
  { 
    value: "advisory", 
    label: "Advisory", 
    description: "Requests for legal opinions and advice",
    icon: HelpCircle,
    bgColor: "from-purple-500 to-purple-600",
    borderColor: "border-purple-600"
  },
  { 
    value: "international-law", 
    label: "International Law", 
    description: "International law and treaty matters",
    icon: Globe,
    bgColor: "from-teal-500 to-teal-600",
    borderColor: "border-teal-600"
  },
  { 
    value: "cabinet", 
    label: "Cabinet / Confidential", 
    description: "Cabinet-level documents requiring restricted access",
    icon: Lock,
    bgColor: "from-slate-600 to-slate-700",
    borderColor: "border-slate-700"
  }
]

const SUBMITTER_TYPES = [
  { value: "ministry", label: "Ministry / Government Agency (MDA)" },
  { value: "court", label: "Court" },
  { value: "statutory", label: "Statutory Body" },
  { value: "public", label: "Member of the Public" },
  { value: "attorney", label: "Attorney-at-Law" },
  { value: "other", label: "Other" }
]

const URGENCY_LEVELS = [
  { value: "Normal", label: "Standard" },
  { value: "Urgent", label: "Urgent" }
]

const CONFIDENTIALITY_LEVELS = [
  { value: "standard", label: "Standard" },
  { value: "confidential", label: "Confidential" },
  { value: "cabinet", label: "Cabinet-Level-Restricted" }
]

const DOCUMENT_TYPES = [
  { value: "correspondence", label: "Correspondence Letter" },
  { value: "supporting", label: "Supporting Document" },
  { value: "court_doc", label: "Court Document" },
  { value: "legal_opinion", label: "Legal Opinion Request" },
  { value: "cabinet_paper", label: "Cabinet Paper" },
  { value: "reference", label: "Reference Material" },
  { value: "other", label: "Other" }
]

function CorrespondencePageContent() {
  type CorrespondenceDraftApiRow = {
    draft_id: string
    form_data: string
    current_step: number
    total_steps: number
    progress_percentage: number
  }

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    correspondenceType: "",
    submitterType: "",
    submitterName: "",
    submitterEmail: "",
    submitterPhone: "",
    organizationName: "",
    ministryDepartment: "",
    contactUnit: "",
    registryFileNumber: "",
    courtFileNumber: "",
    ministryFileReference: "",
    urgency: "Normal",
    urgentReason: "",
    confidentiality: "standard",
    subject: "",
    description: "",
    declaration: false
  })
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [transactionNumber, setTransactionNumber] = useState("")
  const [draftId, setDraftId] = useState<string | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const searchParams = useSearchParams()

  const buildDraftPayload = useCallback(() => {
    return {
      draft_name: formData.subject?.trim() || null,
      form_data: formData,
      current_step: currentStep + 1,
      total_steps: STEPS.length,
      progress_percentage: Math.round(((currentStep + 1) / STEPS.length) * 100),
    }
  }, [formData, currentStep])
  
  // Load draft if URL has draft parameter
  useEffect(() => {
    const draftParam = searchParams.get("draft")
    if (!draftParam) return

    const loadDraft = async () => {
      setIsLoadingDraft(true)
      try {
        const result = await apiGet<CorrespondenceDraftApiRow>(`/api/drafts/correspondence/${draftParam}`)
        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to load draft")
        }

        const parsed = JSON.parse(result.data.form_data || "{}") as Record<string, unknown>
        setFormData((prev) => ({ ...prev, ...parsed }))
        setDraftId(result.data.draft_id)
        if (typeof result.data.current_step === "number" && result.data.current_step > 0) {
          setCurrentStep(Math.min(result.data.current_step - 1, STEPS.length - 1))
        }
      } catch (err) {
        console.error("Load draft failed", err)
      } finally {
        setIsLoadingDraft(false)
      }
    }

    loadDraft()
  }, [searchParams])

  useEffect(() => {
    const loggedInUser = getUser()
    if (!loggedInUser) return

    const normalizedSubmitterType = String(loggedInUser.submitter_type || "").toLowerCase()
    const submitterTypeMap: Record<string, string> = {
      ministry: "ministry",
      mda: "ministry",
      mda_staff: "ministry",
      statutory: "statutory",
      statutory_body: "statutory",
      court: "court",
      attorney: "attorney",
      attorney_at_law: "attorney",
      public: "public",
      individual: "public",
      member_of_public: "public",
    }
    const mappedSubmitterType =
      submitterTypeMap[normalizedSubmitterType] ||
      (["ministry", "statutory", "court", "attorney", "public", "other"].includes(normalizedSubmitterType)
        ? normalizedSubmitterType
        : "")

    const userOrg = (loggedInUser.organization || "").trim()

    const match = MINISTRIES_DEPARTMENTS_AGENCIES.find((mda) => {
      const label = mda.label.toLowerCase()
      const value = mda.value.toLowerCase()
      const probe = userOrg.toLowerCase()
      return probe === label || probe === value
    })

    setFormData((prev) => ({
      ...prev,
      submitterType: prev.submitterType || mappedSubmitterType || "other",
      organizationName: prev.organizationName || match?.label || "",
    }))
  }, [])

  const upsertDraft = useCallback(async (): Promise<string | null> => {
    const payload = buildDraftPayload()
    if (draftId) {
      const result = await apiPut(`/api/drafts/correspondence/${draftId}`, payload)
      if (!result.success) throw new Error(result.error || "Failed to update draft")
      return draftId
    }
    const result = await apiPost<{ draft_id: string }>("/api/drafts/correspondence", payload)
    if (!result.success || !result.data?.draft_id) {
      throw new Error(result.error || "Failed to create draft")
    }
    setDraftId(result.data.draft_id)
    return result.data.draft_id
  }, [buildDraftPayload, draftId])
  
  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveTimer = setInterval(async () => {
      if (formData.correspondenceType || formData.subject) {
        try {
          await upsertDraft()
          setLastSaved(new Date())
        } catch (e) {
          console.error("Auto-save failed", e)
        }
      }
    }, 30000)
    
    return () => clearInterval(autoSaveTimer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, formData, upsertDraft])
  
  // Manual save draft
  const handleSaveDraft = useCallback(async () => {
    setIsSavingDraft(true)
    setSaveMessage(null)
    try {
      await upsertDraft()
      setLastSaved(new Date())
      setSaveMessage({ type: 'success', text: `Draft saved successfully!` })
    } catch (e) {
      console.error("Save draft failed", e)
      setSaveMessage({ type: 'error', text: 'Failed to save draft. Please try again.' })
    } finally {
      setTimeout(() => setSaveMessage(null), 5000)
      setIsSavingDraft(false)
    }
  }, [upsertDraft])

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.correspondenceType !== ""
      case 1:
        return (
          formData.submitterType !== "" &&
          formData.submitterName !== "" &&
          formData.submitterEmail !== "" &&
          formData.subject !== "" &&
          formData.description !== "" &&
          (formData.urgency !== "Urgent" || formData.urgentReason !== "")
        )
      case 2:
        return files.length === 0 || files.every(f => f.documentType !== "")
      case 3:
        return formData.declaration
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmissionError(null)
    
    try {
      if (draftId) {
        await upsertDraft()
      }
      const result = await apiPost<{ transaction_number: string }>("/api/correspondences", {
        ...formData,
        status: "submitted",
        draftId: draftId ?? undefined,
      })
      if (!result.success) throw new Error(result.error || "Submission failed")
      const correspondenceData = (result.data || {}) as Record<string, unknown>
      const correspondenceId = typeof correspondenceData.id === "string" ? correspondenceData.id : null

      if (correspondenceId && files.length > 0) {
        for (const uploaded of files) {
          const form = new FormData()
          form.append("files", uploaded.file)
          form.append("submission_type", "correspondence")
          form.append("submission_id", correspondenceId)
          form.append("document_type_code", uploaded.documentType || "OTHER")
          form.append("document_type_label", DOCUMENT_TYPES.find((t) => t.value === uploaded.documentType)?.label || "Other")
          form.append("condition", "if_applicable")
          if (uploaded.description?.trim()) {
            form.append("description", uploaded.description.trim())
          }

          const uploadResult = await apiPostFormData("/api/documents/upload", form)
          if (!uploadResult.success) {
            throw new Error(uploadResult.error || "Document upload failed")
          }
        }
      }

      setTransactionNumber(
        (typeof correspondenceData.transaction_number === "string" && correspondenceData.transaction_number)
          || `COR-${Date.now().toString(36).toUpperCase()}`
      )

      setDraftId(null)
      setIsSubmitted(true)
    } catch (error) {
      console.error('[v0] Submission failed:', error)
      setSubmissionError(
        `We're sorry, your application could not be submitted. ${error instanceof Error ? error.message : 'Please try again.'}`
      )
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Loading state when resuming a draft
  if (isLoadingDraft) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your draft...</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer compact />
      </div>
    )
  }

  if (isSubmitted) {
    const selectedType = CORRESPONDENCE_TYPES.find(t => t.value === formData.correspondenceType)
    
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
                <h1 className="text-2xl font-bold text-white mb-1">Correspondence Submitted</h1>
                <p className="text-green-100">
                  Your request is now being processed by the SGC Registry
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
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium text-foreground">{selectedType?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="font-medium text-foreground truncate max-w-[200px]">{formData.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitter:</span>
                      <span className="font-medium text-foreground">{formData.submitterName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-foreground">{formData.submitterEmail}</span>
                    </div>
                  </div>
                </div>
                
                {/* Next Steps */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2">What Happens Next?</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Your submission will be reviewed by the SGC Registry</li>
                    <li>You will receive email updates as your submission progresses</li>
                    <li>Track status anytime from your Dashboard</li>
                  </ol>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/dashboard">
                      Go to Dashboard
                    </Link>
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
        <Footer compact />
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
            <div className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-slate-800 p-6 mb-6 text-white">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                    Submit Registry Correspondence
                  </h1>
                  <p className="mt-1 text-white/80">
                    Complete the form below to submit correspondence to the Solicitor General{"'"}s Chambers Registry.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <FormStepper steps={STEPS} currentStep={currentStep} className="mb-8" />
          
          {/* Save Draft Message */}
          {saveMessage && (
            <Alert className={`mb-4 ${saveMessage.type === 'success' ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800'}`}>
              {saveMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="ml-2 font-medium">
                {saveMessage.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Card */}
          <Card className="bg-card border-border">
            {/* Step 1: Correspondence Type */}
            {currentStep === 0 && (
              <>
                <CardHeader>
                  <CardTitle>Select Correspondence Type</CardTitle>
                  <CardDescription>
                    Choose the type of correspondence you wish to submit.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={formData.correspondenceType}
                    onValueChange={(value) => updateFormData("correspondenceType", value)}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    {CORRESPONDENCE_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = formData.correspondenceType === type.value
                      return (
                        <Label
                          key={type.value}
                          htmlFor={type.value}
                          className={`flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all ${
                            isSelected 
                              ? `bg-gradient-to-br ${type.bgColor} ${type.borderColor} shadow-lg` 
                              : "border-border hover:border-primary/50 hover:shadow-md"
                          }`}
                        >
                          <RadioGroupItem value={type.value} id={type.value} className={`mt-1 ${isSelected ? "border-white text-white" : ""}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`h-4 w-4 ${isSelected ? "text-white" : "text-primary"}`} />
                              <span className={`font-medium ${isSelected ? "text-white" : "text-foreground"}`}>{type.label}</span>
                            </div>
                            <p className={`text-sm ${isSelected ? "text-white/90" : "text-muted-foreground"}`}>{type.description}</p>
                          </div>
                        </Label>
                      )
                    })}
                  </RadioGroup>
                </CardContent>
              </>
            )}

            {/* Step 2: Details */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Submission Details</CardTitle>
                  <CardDescription>
                    Provide your details and information about your correspondence.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Submitter Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Submitter Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="submitterType">Submitter Type <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.submitterType}
                          onValueChange={(value) => updateFormData("submitterType", value)}
                        >
                          <SelectTrigger id="submitterType">
                            <SelectValue placeholder="Select type" />
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
                        <Label htmlFor="submitterName">Full Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="submitterName"
                          value={formData.submitterName}
                          onChange={(e) => updateFormData("submitterName", e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="submitterEmail">Email Address <span className="text-destructive">*</span></Label>
                        <Input
                          id="submitterEmail"
                          type="email"
                          value={formData.submitterEmail}
                          onChange={(e) => updateFormData("submitterEmail", e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="submitterPhone">Phone Number</Label>
                        <Input
                          id="submitterPhone"
                          type="tel"
                          value={formData.submitterPhone}
                          onChange={(e) => updateFormData("submitterPhone", e.target.value)}
                          placeholder="+1 (246) XXX-XXXX"
                        />
                      </div>
                    </div>
                    
                    {(formData.submitterType === "ministry" || formData.submitterType === "statutory") && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="organizationName">Ministry / Department / Agency <span className="text-destructive">*</span></Label>
                          <Select
                            value={formData.organizationName}
                            onValueChange={(value) => updateFormData("organizationName", value)}
                          >
                            <SelectTrigger id="organizationName">
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
                        <div className="space-y-2">
                          <Label htmlFor="ministryDepartment">Contact Unit / Section</Label>
                          <Input
                            id="ministryDepartment"
                            value={formData.ministryDepartment}
                            onChange={(e) => updateFormData("ministryDepartment", e.target.value)}
                            placeholder="Unit or section name"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File References */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">File References (if known)</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="registryFileNumber">Registry File Number</Label>
                        <Input
                          id="registryFileNumber"
                          value={formData.registryFileNumber}
                          onChange={(e) => updateFormData("registryFileNumber", e.target.value)}
                          placeholder="REG-XXXX"
                        />
                      </div>
                      {formData.correspondenceType === "litigation" && (
                        <div className="space-y-2">
                          <Label htmlFor="courtFileNumber">Court File Number</Label>
                          <Input
                            id="courtFileNumber"
                            value={formData.courtFileNumber}
                            onChange={(e) => updateFormData("courtFileNumber", e.target.value)}
                            placeholder="CV-XXXX"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="ministryFileReference">Ministry File Reference</Label>
                        <Input
                          id="ministryFileReference"
                          value={formData.ministryFileReference}
                          onChange={(e) => updateFormData("ministryFileReference", e.target.value)}
                          placeholder="Your internal reference"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Priority and Confidentiality */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Priority & Confidentiality</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgency <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.urgency}
                          onValueChange={(value) => updateFormData("urgency", value)}
                        >
                          <SelectTrigger id="urgency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {URGENCY_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confidentiality">Confidentiality <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.confidentiality}
                          onValueChange={(value) => updateFormData("confidentiality", value)}
                        >
                          <SelectTrigger id="confidentiality">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONFIDENTIALITY_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {formData.urgency === "Urgent" && (
                      <div className="space-y-2">
                        <Label htmlFor="urgentReason">Reason for Urgency <span className="text-destructive">*</span></Label>
                        <Textarea
                          id="urgentReason"
                          value={formData.urgentReason}
                          onChange={(e) => updateFormData("urgentReason", e.target.value)}
                          placeholder="Please explain why this matter is urgent..."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  {/* Subject Matter */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Subject Matter</h3>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => updateFormData("subject", e.target.value)}
                        placeholder="Brief subject line"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Detailed Description <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData("description", e.target.value)}
                        placeholder="Provide a detailed description of your correspondence..."
                        rows={5}
                      />
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
                    Upload any supporting documents for your correspondence. Each document must be assigned a type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-muted border-muted-foreground/20">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Documents are optional but recommended. All uploaded files must have a document type selected.
                    </AlertDescription>
                  </Alert>
                  
                  <FileUpload
                    files={files}
                    onFilesChange={setFiles}
                    documentTypes={DOCUMENT_TYPES}
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
                    Please review your submission details before submitting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border divide-y divide-border">
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Correspondence Type</h4>
                      <p className="text-foreground">
                        {CORRESPONDENCE_TYPES.find(t => t.value === formData.correspondenceType)?.label}
                      </p>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Submitter</h4>
                      <p className="text-foreground">{formData.submitterName}</p>
                      <p className="text-sm text-muted-foreground">{formData.submitterEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        {SUBMITTER_TYPES.find(t => t.value === formData.submitterType)?.label}
                      </p>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Subject</h4>
                      <p className="text-foreground font-medium">{formData.subject}</p>
                      <p className="text-sm text-muted-foreground mt-1">{formData.description}</p>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Priority</h4>
                      <div className="flex gap-4">
                        <span className="text-foreground">
                          Urgency: <span className="font-medium">{formData.urgency === "Urgent" ? "Urgent" : "Standard"}</span>
                        </span>
                        <span className="text-foreground">
                          Confidentiality: <span className="font-medium">{CONFIDENTIALITY_LEVELS.find(l => l.value === formData.confidentiality)?.label}</span>
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Documents</h4>
                      {files.length === 0 ? (
                        <p className="text-muted-foreground">No documents uploaded</p>
                      ) : (
                        <ul className="space-y-1">
                          {files.map((file) => (
                            <li key={file.id} className="text-sm text-foreground">
                              {file.file.name} ({DOCUMENT_TYPES.find(t => t.value === file.documentType)?.label})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                    <Checkbox
                      id="declaration"
                      checked={formData.declaration}
                      onCheckedChange={(checked) => updateFormData("declaration", checked === true)}
                      className="mt-0.5 h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
                      I declare that the information provided in this submission is true and accurate to the best of my knowledge. 
                      I understand that providing false information may result in legal consequences.
                    </Label>
                  </div>
                </CardContent>
              </>
            )}

            {/* Submission Error Alert */}
            {submissionError && (
              <div className="border-t border-border p-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <p className="font-medium">{submissionError}</p>
                    <p className="text-sm mt-2">
                      Your application has been saved. You can{' '}
                      <button 
                        onClick={handleSubmit}
                        className="underline font-medium hover:no-underline"
                      >
                        try again now
                      </button>
                      {' '}or resume later from your{' '}
                      <Link href="/dashboard" className="underline font-medium hover:no-underline">
                        Dashboard
                      </Link>.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-border p-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                {lastSaved && (
                  <span className="text-xs text-muted-foreground">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </>
                  )}
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
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer compact />
    </div>
  )
}

// Loading component for Suspense fallback
function CorrespondenceLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading correspondence form...</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer compact />
    </div>
  )
}

// Export with Suspense boundary for useSearchParams
export default function CorrespondencePage() {
  return (
    <RequireAuthGuard returnPath="/correspondence">
      <Suspense fallback={<CorrespondenceLoading />}>
        <CorrespondencePageContent />
      </Suspense>
    </RequireAuthGuard>
  )
}
