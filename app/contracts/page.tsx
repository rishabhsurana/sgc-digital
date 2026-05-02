"use client"

import { useState, useMemo, useEffect, useCallback, Suspense } from "react"
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
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, ArrowRight, Save, Send, Info,
  Package, Briefcase, HardHat, Plus, RefreshCw,
  CheckCircle, AlertTriangle, FileText, Building2, User,
  Calendar, DollarSign, Clock, MapPin, Mail, Phone,
  FileCheck, Shield, Banknote, CalendarDays, Timer, AlertCircle,
  Trash2
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { AskRex } from "@/components/ask-rex"
import Link from "next/link"
import { MINISTRIES_DEPARTMENTS_AGENCIES } from "@/lib/constants"
import { apiGet, apiPost, apiPostFormData, apiPut, apiDelete } from "@/lib/api-client"
import { validateOriginalContract, type OriginalContractData, type ValidationResult } from "@/lib/actions/contract-validation-actions"
import { ContractsSubmitGuard } from "@/components/contracts-submit-guard"
import { RequireAuthGuard } from "@/components/require-auth-guard"
import { getUser } from "@/lib/auth"

interface ExistingDocument {
  id: string
  file_name: string
  file_size: number
  mime_type: string
  document_type_code: string
  document_type_label: string
  uploaded_date: string
}

const STEPS = [
  { id: "nature", title: "Contract Nature", description: "Select contract type" },
  { id: "details", title: "Contract Details", description: "Enter contract information" },
  { id: "documents", title: "Documents", description: "Upload required files" },
  { id: "review", title: "Review", description: "Review and submit" }
]

const CONTRACT_NATURES = [
  { 
    value: "goods", 
    // value: "NAT_GDS",
    label: "Goods", 
    description: "Procurement of goods, supplies, and equipment",
    icon: Package,
    bgColor: "from-blue-500 to-blue-600",
    borderColor: "border-blue-600"
  },
  { 
    value: "consultancy_services", 
    // value: "NAT_CSV",
    label: "Consultancy / Services", 
    description: "Professional services, consulting, and service contracts",
    icon: Briefcase,
    bgColor: "from-purple-500 to-purple-600",
    borderColor: "border-purple-600"
  },
  { 
    value: "works", 
    // value: "NAT_WKS",
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
    { value: "CAT_INTER", label: "Inter-Agency / MOU (Supply-related)" }

  ],
  consultancy_services: [
    { value: "CAT_CONS", label: "Consultancy / Professional Services" },
    { value: "CAT_PROC", label: "Procurement of Goods & Services" },
    { value: "CAT_EMP", label: "Employment / Personnel" },
    { value: "CAT_INTER", label: "Inter-Agency / MOU" }
  ],
  works: [
    { value: "CAT_CONST", label: "Construction / Public Works" },
    { value: "CAT_PROC", label: "Procurement of Goods & Services" },
    { value: "CAT_INTER", label: "Inter-Agency / MOU (Infrastructure-related)" },
    { value: "CAT_OTHER", label: "Other (Requires justification)" }
  ]
}

const CONTRACT_INSTRUMENTS = {
  goods: [
    { value: "GDS", label: "Goods" },
    { value: "UNI", label: "Uniforms" },
    { value: "OTHER", label: "Other" }
  ],
  consultancy_services: [
    { value: "CLEAN", label: "Cleaning Services" },
    { value: "CONS_CO", label: "Consultancy - Company" },
    { value: "IC", label: "Individual Consultant" },
    { value: "IC_IDB", label: "Individual Consultant (IDB-funded)" },
    { value: "SVC", label: "Services" },
    { value: "OTHER", label: "Other" }
  ],
  works: [
    { value: "WKS", label: "Works" },
    { value: "OTHER", label: "Other" }
  ]
}

const CONTRACT_TYPES = [
  { value: "NEW", label: "New Contract", icon: Plus },
  { value: "REN", label: "Renewal", icon: RefreshCw },
  { value: "SUP", label: "Supplemental", icon: Plus }
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
  { value: "TENDER", label: "Open Competitive Tender" },
  { value: "RFQ", label: "Selective / Limited Tender" },
  { value: "SSP", label: "Single Source Procurement" },
  { value: "framework", label: "Framework Agreement" },
  { value: "DIRECT", label: "Direct Procurement (Below Threshold)" },
  { value: "emergency", label: "Emergency Procurement" }
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

const CONTRACTING_PARTY_SCOPES = [
  { value: "International", label: "International" },
  { value: "Local", label: "Local" },
  { value: "Regional", label: "Regional" }
]

const CPO_APPROVAL_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" }
]

const CURRENCIES = [
  { value: "BDS", label: "BBD - Barbados Dollar" },
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

type DocumentChecklistItem = {
  value: string
  label: string
  condition: "always" | "if_applicable"
}

type DocumentChecklistRequirement = {
  always: Array<{ value: string; label: string }>
  optional: Array<{ value: string; label: string }>
}

type DocumentChecklistApiRule = {
  document_type_code: string
  document_type_label: string
  condition: "always" | "if_applicable"
}

const FALLBACK_DOCUMENT_CHECKLIST_CONFIG: Record<string, DocumentChecklistItem[]> = {
  "goods|CAT_PROC|GDS": [
    { value: "FORM_ACCEPT", label: "Acceptance of Award", condition: "always" },
    { value: "FORM_DRAFT", label: "Draft Contract", condition: "if_applicable" },
    { value: "FORM_LOA", label: "Letter of Award", condition: "always" },
    { value: "FORM_PAY_SCHED", label: "Payment Schedule", condition: "always" },
    { value: "PROC_SPECS", label: "Specifications", condition: "always" },
    { value: "PROC_SSP_APPR", label: "Single Source Approval", condition: "if_applicable" },
    { value: "PROC_SSP_REQ", label: "Single Source Procurement Request", condition: "if_applicable" },
    { value: "PROC_TENDER", label: "Tender Documents", condition: "always" },
  ],
  "goods|CAT_PROC|UNI": [
    { value: "FORM_ACCEPT", label: "Acceptance of Award", condition: "always" },
    { value: "FORM_DRAFT", label: "Draft Contract", condition: "if_applicable" },
    { value: "FORM_LOA", label: "Letter of Award", condition: "always" },
    { value: "FORM_PAY_SCHED", label: "Payment Schedule", condition: "always" },
    { value: "PROC_SPECS", label: "Specifications", condition: "always" },
    { value: "PROC_SSP_APPR", label: "Single Source Approval", condition: "if_applicable" },
    { value: "PROC_SSP_REQ", label: "Single Source Procurement Request", condition: "if_applicable" },
    { value: "PROC_TENDER", label: "Tender Documents", condition: "always" },
  ],
  "consultancy_services|CAT_PROC|CLEAN": [
    { value: "FORM_ACCEPT", label: "Acceptance of Award", condition: "always" },
    { value: "FORM_DRAFT", label: "Draft Contract", condition: "if_applicable" },
    { value: "FORM_LOA", label: "Letter of Award", condition: "always" },
    { value: "FORM_LOE", label: "Letter of Engagement", condition: "if_applicable" },
    { value: "FORM_PAY_SCHED", label: "Payment Schedule", condition: "always" },
    { value: "FORM_SCHED_DELIV", label: "Schedule of Deliverables", condition: "always" },
    { value: "PROC_PROP", label: "Proposal", condition: "always" },
    { value: "PROC_TENDER", label: "Tender Documents", condition: "always" },
    { value: "PROC_TOR", label: "Terms of Reference", condition: "always" },
    { value: "DUE_BUS_REG", label: "Business Registration", condition: "if_applicable" },
    { value: "DUE_GS", label: "Certificate of Good Standing", condition: "if_applicable" },
    { value: "DUE_INCORP", label: "Company Incorporation Documents", condition: "if_applicable" },
    { value: "FIN_BOND", label: "Performance Bond", condition: "if_applicable" },
    { value: "FIN_SURETY", label: "Proof of Surety", condition: "if_applicable" },
    { value: "PROC_CAB_APPR", label: "Cabinet Approval", condition: "if_applicable" },
    { value: "PROC_CAB_PAPER", label: "Cabinet Paper", condition: "if_applicable" },
    { value: "PROC_SSP_APPR", label: "Single Source Approval", condition: "if_applicable" },
    { value: "PROC_SSP_REQ", label: "Single Source Procurement Request", condition: "if_applicable" },
  ],
  "consultancy_services|CAT_PROC|SVC": [
    { value: "FORM_ACCEPT", label: "Acceptance of Award", condition: "always" },
    { value: "FORM_DRAFT", label: "Draft Contract", condition: "if_applicable" },
    { value: "FORM_LOA", label: "Letter of Award", condition: "always" },
    { value: "FORM_LOE", label: "Letter of Engagement", condition: "if_applicable" },
    { value: "FORM_PAY_SCHED", label: "Payment Schedule", condition: "always" },
    { value: "FORM_SCHED_DELIV", label: "Schedule of Deliverables", condition: "always" },
    { value: "PROC_PROP", label: "Proposal", condition: "always" },
    { value: "PROC_TENDER", label: "Tender Documents", condition: "always" },
    { value: "PROC_TOR", label: "Terms of Reference", condition: "always" },
    { value: "DUE_BUS_REG", label: "Business Registration", condition: "if_applicable" },
    { value: "DUE_GS", label: "Certificate of Good Standing", condition: "if_applicable" },
    { value: "DUE_INCORP", label: "Company Incorporation Documents", condition: "if_applicable" },
    { value: "FIN_BOND", label: "Performance Bond", condition: "if_applicable" },
    { value: "FIN_SURETY", label: "Proof of Surety", condition: "if_applicable" },
    { value: "PROC_CAB_APPR", label: "Cabinet Approval", condition: "if_applicable" },
    { value: "PROC_CAB_PAPER", label: "Cabinet Paper", condition: "if_applicable" },
    { value: "PROC_SSP_APPR", label: "Single Source Approval", condition: "if_applicable" },
    { value: "PROC_SSP_REQ", label: "Single Source Procurement Request", condition: "if_applicable" },
  ],
  "consultancy_services|CAT_CONS|CONS_CO": [
    { value: "FORM_ACCEPT", label: "Acceptance of Award", condition: "always" },
    { value: "FORM_LOA", label: "Letter of Award", condition: "always" },
    { value: "FORM_PAY_SCHED", label: "Payment Schedule", condition: "always" },
    { value: "PROC_PROP", label: "Proposal", condition: "always" },
    { value: "PROC_TOR", label: "Terms of Reference", condition: "always" },
    { value: "PROC_TENDER", label: "Tender Documents", condition: "always" },
    { value: "DUE_BUS_REG", label: "Business Registration", condition: "if_applicable" },
    { value: "DUE_GS", label: "Certificate of Good Standing", condition: "if_applicable" },
    { value: "DUE_INCORP", label: "Company Incorporation Documents", condition: "if_applicable" },
  ],
  "consultancy_services|CAT_CONS|IC": [
    { value: "FORM_ACCEPT", label: "Acceptance of Award", condition: "always" },
    { value: "FORM_LOA", label: "Letter of Award", condition: "always" },
    { value: "FORM_PAY_SCHED", label: "Payment Schedule", condition: "always" },
    { value: "PROC_PROP", label: "Proposal", condition: "always" },
    { value: "PROC_TOR", label: "Terms of Reference", condition: "always" },
    { value: "PROC_TENDER", label: "Tender Documents", condition: "always" },
  ],
  "consultancy_services|CAT_CONS|IC_IDB": [
    { value: "FORM_ACCEPT", label: "Acceptance of Award", condition: "always" },
    { value: "FORM_LOA", label: "Letter of Award", condition: "always" },
    { value: "FORM_PAY_SCHED", label: "Payment Schedule", condition: "always" },
    { value: "PROC_PROP", label: "Proposal", condition: "always" },
    { value: "PROC_TOR", label: "Terms of Reference", condition: "always" },
    { value: "PROC_TENDER", label: "Tender Documents", condition: "always" },
  ],
  "works|CAT_CONST|WKS": [
    { value: "FORM_ACCEPT", label: "Acceptance of Award", condition: "always" },
    { value: "FORM_DRAFT", label: "Draft Contract", condition: "if_applicable" },
    { value: "FORM_LOA", label: "Letter of Award", condition: "always" },
    { value: "FORM_PAY_SCHED", label: "Payment Schedule", condition: "always" },
    { value: "FORM_SCHED_WORKS", label: "Schedule of Works/Completion Schedule", condition: "always" },
    { value: "PROC_PROP", label: "Proposal", condition: "always" },
    { value: "PROC_SCOPE", label: "Scope of Works", condition: "always" },
    { value: "PROC_TENDER", label: "Tender Documents", condition: "always" },
    { value: "DUE_BUS_REG", label: "Business Registration", condition: "always" },
    { value: "DUE_GS", label: "Certificate of Good Standing", condition: "always" },
    { value: "DUE_INCORP", label: "Company Incorporation Documents", condition: "always" },
    { value: "FIN_BOND", label: "Performance Bond", condition: "if_applicable" },
    { value: "FIN_SURETY", label: "Proof of Surety", condition: "if_applicable" },
    { value: "PROC_CAB_APPR", label: "Cabinet Approval", condition: "if_applicable" },
    { value: "PROC_CAB_PAPER", label: "Cabinet Paper", condition: "if_applicable" },
    { value: "PROC_SSP_APPR", label: "Single Source Approval", condition: "if_applicable" },
    { value: "PROC_SSP_REQ", label: "Single Source Procurement Request", condition: "if_applicable" },
  ],
}

function toChecklistRequirement(rules: DocumentChecklistItem[]): DocumentChecklistRequirement {
  const always = rules.filter((rule) => rule.condition === "always").map((rule) => ({ value: rule.value, label: rule.label }))
  const optional = rules.filter((rule) => rule.condition !== "always").map((rule) => ({ value: rule.value, label: rule.label }))
  return { always, optional }
}

function normalizeClassificationField(field: string, value: string | boolean): string | boolean {
  if (typeof value !== "string") return value
  if (field === "contractNature" && value === "consultancy") return "consultancy_services"
  if (field === "contractCategory" && value === "CAT_MOU") return "CAT_INTER"
  if (field === "contractInstrument") {
    if (value === "WORKS") return "WKS"
    if (value === "CONS_INDV" || value === "CONS_IND") return "IC"
    if (value === "CONS_IDB") return "IC_IDB"
  }
  return value
}

function ContractsPageContent() {
  type ContractDraftApiRow = {
    draft_id: string
    form_data: string
    current_step: number
    total_steps: number
    progress_percentage: number
  }

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Contract Classification
    contractNature: "",
    contractCategory: "",
    contractInstrument: "",
    contractInstrumentOther: "",
    contractType: "NEW",
    parentContractNumber: "",
    originalTransactionNumber: "",
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
    contractCurrency: "BDS",
    contractValue: "",
    urgency: "Normal",
    confidentiality: "standard",
    contractingPartyScope: "",
    fundingSource: "budget",
    procurementMethod: "TENDER",
    cpoApproved: "",
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
  const [draftId, setDraftId] = useState<string | null>(null)
  const [resubmitId, setResubmitId] = useState<string | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [documentRequirements, setDocumentRequirements] = useState<DocumentChecklistRequirement>({ always: [], optional: [] })
  const [isChecklistLoading, setIsChecklistLoading] = useState(false)
  const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>([])
  const [removedDocumentIds, setRemovedDocumentIds] = useState<Set<string>>(new Set())
  
  // Validation state for Parent Contract Number field
  const [isValidatingParentContract, setIsValidatingParentContract] = useState(false)
  const [validationResultParent, setValidationResultParent] = useState<ValidationResult | null>(null)
  const [originalContractDataParent, setOriginalContractDataParent] = useState<OriginalContractData | null>(null)
  // Validation state for Original Transaction Number field
  const [isValidatingOriginalTransaction, setIsValidatingOriginalTransaction] = useState(false)
  const [validationResultOriginalTransaction, setValidationResultOriginalTransaction] = useState<ValidationResult | null>(null)
  const [originalContractDataOriginalTransaction, setOriginalContractDataOriginalTransaction] = useState<OriginalContractData | null>(null)
  
  const searchParams = useSearchParams()
  const documentsStepIndex = STEPS.findIndex((step) => step.id === "documents")
  const isAutoSaveActive =
    !isSubmitting &&
    !isSubmitted &&
    (documentsStepIndex === -1 || currentStep < documentsStepIndex)

  const buildDraftPayload = useCallback(() => {
    return {
      draft_name: formData.contractTitle?.trim() || null,
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
        const result = await apiGet<ContractDraftApiRow>(`/api/drafts/contract/${draftParam}`)
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

  // Load existing contract for resubmission if URL has resubmit parameter
  useEffect(() => {
    const resubmitParam = searchParams.get("resubmit")
    if (!resubmitParam) return

    const loadContractForResubmit = async () => {
      setIsLoadingDraft(true)
      try {
        const result = await apiGet<{ contract: Record<string, unknown>; applicant_documents?: ExistingDocument[] }>(`/api/contracts/${resubmitParam}`)
        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to load contract for resubmission")
        }
        const c = result.data.contract
        setResubmitId(resubmitParam)

        // Load previously uploaded applicant documents
        const applicantDocs = (result.data.applicant_documents || []).map((d: any) => ({
          id: d.id,
          file_name: d.file_name,
          file_size: d.file_size,
          mime_type: d.mime_type,
          document_type_code: d.document_type_code,
          document_type_label: d.document_type_label,
          uploaded_date: d.uploaded_date,
        }))
        setExistingDocuments(applicantDocs)
        setRemovedDocumentIds(new Set())
        setFormData((prev) => ({
          ...prev,
          contractNature: (c.contract_nature as string) || prev.contractNature,
          contractCategory: (c.contract_category as string) || prev.contractCategory,
          contractInstrument: (c.contract_instrument as string) || prev.contractInstrument,
          contractInstrumentOther: (c.contract_instrument_other as string) || prev.contractInstrumentOther,
          contractType: (c.contract_type as string) || prev.contractType,
          parentContractNumber: (c.parent_contract_number as string) || prev.parentContractNumber,
          originalTransactionNumber: (c.original_transaction_number as string) || prev.originalTransactionNumber,
          categoryOtherJustification: (c.category_other_justification as string) || prev.categoryOtherJustification,
          ministry: (c.ministry as string) || prev.ministry,
          department: (c.department as string) || prev.department,
          ministryFileReference: (c.ministry_file_reference as string) || prev.ministryFileReference,
          contactName: (c.contact_name as string) || prev.contactName,
          contactEmail: (c.contact_email as string) || prev.contactEmail,
          contactPhone: (c.contact_phone as string) || prev.contactPhone,
          contractorType: (c.contractor_type as string) || prev.contractorType,
          contractorName: (c.contractor_name as string) || prev.contractorName,
          contractorAddress: (c.contractor_address as string) || prev.contractorAddress,
          contractorCity: (c.contractor_city as string) || prev.contractorCity,
          contractorCountry: (c.contractor_country as string) || prev.contractorCountry,
          contractorEmail: (c.contractor_email as string) || prev.contractorEmail,
          contractorPhone: (c.contractor_phone as string) || prev.contractorPhone,
          companyRegistrationNumber: (c.company_registration_number as string) || prev.companyRegistrationNumber,
          taxIdentificationNumber: (c.tax_identification_number as string) || prev.taxIdentificationNumber,
          contractTitle: (c.contract_title as string) || prev.contractTitle,
          contractDescription: (c.contract_description as string) || prev.contractDescription,
          scopeOfWork: (c.scope_of_work as string) || prev.scopeOfWork,
          keyDeliverables: (c.key_deliverables as string) || prev.keyDeliverables,
          contractCurrency: (c.contract_currency as string) || prev.contractCurrency,
          contractValue: c.contract_value !== undefined ? String(c.contract_value) : prev.contractValue,
          fundingSource: (c.funding_source as string) || prev.fundingSource,
          procurementMethod: (c.procurement_method as string) || prev.procurementMethod,
          awardDate: (c.award_date as string) || prev.awardDate,
          contractStartDate: (c.contract_start_date as string) || prev.contractStartDate,
          contractEndDate: (c.contract_end_date as string) || prev.contractEndDate,
          contractDuration: (c.contract_duration as string) || prev.contractDuration,
          renewalTerm: (c.renewal_term as string) || prev.renewalTerm,
          missingDocumentReason: (c.missing_document_reason as string) || prev.missingDocumentReason,
        }))
        setCurrentStep(0)
      } catch (err) {
        console.error("Load contract for resubmit failed", err)
      } finally {
        setIsLoadingDraft(false)
      }
    }

    loadContractForResubmit()
  }, [searchParams])

  useEffect(() => {
    const loggedInUser = getUser()
    const userOrg = (loggedInUser?.organization || "").trim()
    if (!userOrg) return

    const match = MINISTRIES.find((ministry) => {
      const label = ministry.label.toLowerCase()
      const value = ministry.value.toLowerCase()
      const probe = userOrg.toLowerCase()
      return probe === label || probe === value
    })
    if (!match) return

    setFormData((prev) => (prev.ministry ? prev : { ...prev, ministry: match.value }))
  }, [])

  const upsertDraft = useCallback(async (): Promise<string | null> => {
    const payload = buildDraftPayload()
    if (draftId) {
      const result = await apiPut(`/api/drafts/contract/${draftId}`, payload)
      if (!result.success) throw new Error(result.error || "Failed to update draft")
      return draftId
    }
    const result = await apiPost<{ draft_id: string }>("/api/drafts/contract", payload)
    if (!result.success || !result.data?.draft_id) {
      throw new Error(result.error || "Failed to create draft")
    }
    setDraftId(result.data.draft_id)
    return result.data.draft_id
  }, [buildDraftPayload, draftId])
  
  // Auto-save draft every 30 seconds when form data changes
  useEffect(() => {
    if (!isAutoSaveActive) return

    const autoSaveTimer = setInterval(async () => {
      if (formData.contractNature || formData.contractTitle) {
        try {
          await upsertDraft()
          setLastSaved(new Date())
        } catch (e) {
          console.error("Auto-save failed", e)
        }
      }
    }, 30000) // 30 seconds
    
    return () => clearInterval(autoSaveTimer)
  }, [formData.contractNature, formData.contractTitle, isAutoSaveActive, upsertDraft])
  
  // Manual save draft function
  const handleSaveDraft = useCallback(async () => {
    setIsSavingDraft(true)
    try {
      await upsertDraft()
      setLastSaved(new Date())
    } catch (e) {
      console.error("Save draft failed", e)
    } finally {
      setIsSavingDraft(false)
    }
  }, [upsertDraft])
  
  // Shared prepopulate helper
  const prepopulateFromContractData = useCallback((contractData: OriginalContractData, contractType: 'REN' | 'SUP') => {
    setFormData(prev => ({
      ...prev,
      ministry: contractData.ministry || prev.ministry,
      department: contractData.department || prev.department,
      contractorType: contractData.contractorType || prev.contractorType,
      contractorName: contractData.contractorName || prev.contractorName,
      contractorAddress: contractData.contractorAddress || prev.contractorAddress,
      contractorCity: contractData.contractorCity || prev.contractorCity,
      contractorCountry: contractData.contractorCountry || prev.contractorCountry,
      contractorEmail: contractData.contractorEmail || prev.contractorEmail,
      contractorPhone: contractData.contractorPhone || prev.contractorPhone,
      companyRegistrationNumber: contractData.companyRegistrationNumber || prev.companyRegistrationNumber,
      taxIdentificationNumber: contractData.taxIdentificationNumber || prev.taxIdentificationNumber,
      contractTitle: contractType === 'REN'
        ? `Renewal: ${contractData.contractTitle}`
        : `Supplemental: ${contractData.contractTitle}`,
      contractDescription: contractData.contractDescription || prev.contractDescription,
      scopeOfWork: contractData.scopeOfWork || prev.scopeOfWork,
      contractNature: contractData.contractNature || prev.contractNature,
      contractCategory: contractData.contractCategory || prev.contractCategory,
      contractInstrument: contractData.contractInstrument || prev.contractInstrument,
      contractCurrency: contractData.contractCurrency || prev.contractCurrency,
      fundingSource: contractData.fundingSource || prev.fundingSource,
      procurementMethod: contractData.procurementMethod || prev.procurementMethod,
    }))
  }, [])

  // Validate Parent Contract Number
  const handleValidateParentContract = useCallback(async () => {
    if (!formData.parentContractNumber) return
    setIsValidatingParentContract(true)
    setValidationResultParent(null)
    setOriginalContractDataParent(null)
    try {
      const entityId = 'ENT-MOF-001'
      const contractType = formData.contractType as 'REN' | 'SUP'
      const result = await validateOriginalContract(formData.parentContractNumber, entityId, contractType)
      setValidationResultParent(result)
      if (result.isValid && result.contractData) {
        setOriginalContractDataParent(result.contractData)
        prepopulateFromContractData(result.contractData, contractType)
      }
    } catch (error) {
      console.error('[v0] Contract validation error:', error)
      setValidationResultParent({
        isValid: false,
        contractData: null,
        errors: ['An error occurred while validating the contract. Please try again.'],
        warnings: []
      })
    } finally {
      setIsValidatingParentContract(false)
    }
  }, [formData.parentContractNumber, formData.contractType, prepopulateFromContractData])

  // Validate Original Transaction Number
  const handleValidateOriginalTransaction = useCallback(async () => {
    if (!formData.originalTransactionNumber) return
    setIsValidatingOriginalTransaction(true)
    setValidationResultOriginalTransaction(null)
    setOriginalContractDataOriginalTransaction(null)
    try {
      const entityId = 'ENT-MOF-001'
      const contractType = formData.contractType as 'REN' | 'SUP'
      const result = await validateOriginalContract(formData.originalTransactionNumber, entityId, contractType)
      setValidationResultOriginalTransaction(result)
      if (result.isValid && result.contractData) {
        setOriginalContractDataOriginalTransaction(result.contractData)
        prepopulateFromContractData(result.contractData, contractType)
      }
    } catch (error) {
      console.error('[v0] Contract validation error:', error)
      setValidationResultOriginalTransaction({
        isValid: false,
        contractData: null,
        errors: ['An error occurred while validating the contract. Please try again.'],
        warnings: []
      })
    } finally {
      setIsValidatingOriginalTransaction(false)
    }
  }, [formData.originalTransactionNumber, formData.contractType, prepopulateFromContractData])

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const normalizedValue = normalizeClassificationField(field, value)
      const newData = { ...prev, [field]: normalizedValue }
      
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

  useEffect(() => {
    const nature = formData.contractNature
    const category = formData.contractCategory
    const instrument = formData.contractInstrument

    if (!nature || !category || !instrument || instrument === "OTHER") {
      setDocumentRequirements({ always: [], optional: [] })
      return
    }

    const fallbackKey = `${nature}|${category}|${instrument}`
    const fallback = toChecklistRequirement(FALLBACK_DOCUMENT_CHECKLIST_CONFIG[fallbackKey] || [])

    const fetchChecklist = async () => {
      setIsChecklistLoading(true)
      try {
        const response = await apiGet<DocumentChecklistApiRule[]>(
          `/api/constants/document-checklist?nature=${encodeURIComponent(nature)}&category=${encodeURIComponent(category)}&instrument=${encodeURIComponent(instrument)}`
        )

        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          const mapped: DocumentChecklistItem[] = response.data.map((row) => ({
            value: row.document_type_code,
            label: row.document_type_label,
            condition: row.condition === "always" ? "always" : "if_applicable",
          }))
          setDocumentRequirements(toChecklistRequirement(mapped))
          return
        }
      } catch (error) {
        console.error("Checklist API failed, using fallback config", error)
      } finally {
        setIsChecklistLoading(false)
      }

      setDocumentRequirements(fallback)
    }

    fetchChecklist()
  }, [formData.contractNature, formData.contractCategory, formData.contractInstrument])

  // Get all document types for file upload
  const allDocumentTypes = useMemo(() => {
    return [
      ...documentRequirements.always,
      ...documentRequirements.optional,
      { value: "OTHER", label: "Other Document" }
    ]
  }, [documentRequirements])

  // Existing documents that haven't been removed
  const keptExistingDocuments = useMemo(() => {
    return existingDocuments.filter(d => !removedDocumentIds.has(d.id))
  }, [existingDocuments, removedDocumentIds])

  // Check if required documents are uploaded
  const missingRequiredDocs = useMemo(() => {
    const uploadedTypes = files.map(f => f.documentType)
    const existingTypes = keptExistingDocuments.map(d => d.document_type_code)
    const allTypes = [...uploadedTypes, ...existingTypes]
    return documentRequirements.always.filter(doc => !allTypes.includes(doc.value))
  }, [files, keptExistingDocuments, documentRequirements.always])

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
          formData.contractingPartyScope !== "" &&
          formData.urgency !== "" &&
          formData.confidentiality !== "" &&
          formData.procurementMethod !== "" &&
          (formData.procurementMethod !== "single-source" || formData.cpoApproved !== "") &&
          formData.fundingSource !== "" &&
          (formData.contractType === "NEW" || formData.parentContractNumber !== "" || formData.originalTransactionNumber !== "")
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
    setSubmissionError(null)
    
    try {
      let contractData: Record<string, unknown>

      if (resubmitId) {
        // Delete removed documents before resubmitting
        for (const docId of removedDocumentIds) {
          await apiDelete(`/api/documents/${docId}`)
        }

        // Resubmit path — update existing contract and call BPM updateproperties
        const result = await apiPut<{ transaction_number: string; id: string }>(
          `/api/contracts/${resubmitId}/resubmit`,
          {
            ...formData,
            ministryLabel: MINISTRIES.find((m) => m.value === formData.ministry)?.label || formData.ministry,
          }
        )
        if (!result.success) throw new Error(result.error || "Resubmission failed")
        contractData = (result.data || {}) as Record<string, unknown>
      } else {
        // Normal new submission path
        if (draftId) {
          await upsertDraft()
        }
        const result = await apiPost<{ transaction_number: string }>(
          "/api/contracts",
          {
            ...formData,
            ministryLabel: MINISTRIES.find((m) => m.value === formData.ministry)?.label || formData.ministry,
            status: "submitted",
            draftId: draftId ?? undefined,
          }
        )
        if (!result.success) throw new Error(result.error || "Submission failed")
        contractData = (result.data || {}) as Record<string, unknown>
      }

      const contractId = resubmitId || (typeof contractData.id === "string" ? contractData.id : null)

      if (contractId && files.length > 0) {
        const uploadPromises = files.map((uploaded) => {
          const form = new FormData()
          form.append("files", uploaded.file)
          form.append("submission_type", "contract")
          form.append("submission_id", contractId)
          form.append("document_type_code", uploaded.documentType || "OTHER")
          form.append("document_type_label", allDocumentTypes.find((t) => t.value === uploaded.documentType)?.label || "Other Document")
          form.append("condition", "if_applicable")
          return apiPostFormData("/api/documents/upload", form)
        })

        const uploadResults = await Promise.all(uploadPromises)
        const failedUpload = uploadResults.find((r) => !r.success)
        if (failedUpload) {
          throw new Error(failedUpload.error || "Document upload failed")
        }
      }

      // After all document changes are persisted, trigger BPM document sync for resubmissions
      if (resubmitId && (files.length > 0 || removedDocumentIds.size > 0)) {
        apiPost(`/api/contracts/${resubmitId}/sync-documents-bpm`, {}).catch((err) =>
          console.error("BPM document sync failed (non-blocking):", err)
        )
      }

      setTransactionNumber(
        (typeof contractData.transaction_number === "string" && contractData.transaction_number)
          || `CON-${Date.now().toString(36).toUpperCase()}`
      )

      setDraftId(null)
      setResubmitId(null)
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

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <AskRex />
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
        <Footer compact />
      </div>
    )
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <AskRex />
      
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

          {/* Resubmit banner */}
          {resubmitId && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <span className="font-medium">You are editing a returned application.</span> Make the necessary
                corrections and click <span className="font-medium">Resubmit Contract</span> on the final step.
              </AlertDescription>
            </Alert>
          )}

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

                  {/* Parent Contract Reference - two fields */}
                  {(formData.contractType === "REN" || formData.contractType === "SUP") && (
                    <div className="space-y-6">
                      <p className="text-xs text-muted-foreground">
                        Provide at least one of the following reference numbers. Use <strong>Validate &amp; Load</strong> to verify ownership and auto-fill contract details.
                      </p>

                      {/* Field 1: Parent Contract Number */}
                      <div className="space-y-2">
                        <Label htmlFor="parentContractNumber">Parent Contract Number</Label>
                        <div className="flex gap-2">
                          <Input
                            id="parentContractNumber"
                            value={formData.parentContractNumber}
                            onChange={(e) => {
                              updateFormData("parentContractNumber", e.target.value)
                              setValidationResultParent(null)
                              setOriginalContractDataParent(null)
                            }}
                            placeholder="e.g., CON-2024-0001"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleValidateParentContract}
                            disabled={!formData.parentContractNumber || isValidatingParentContract}
                          >
                            {isValidatingParentContract ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                Validating...
                              </>
                            ) : (
                              <>
                                <FileCheck className="h-4 w-4 mr-2" />
                                Validate &amp; Load
                              </>
                            )}
                          </Button>
                        </div>
                        {validationResultParent && (
                          <div className="space-y-2 mt-1">
                            {validationResultParent.errors.length > 0 && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  <ul className="list-disc list-inside space-y-1">
                                    {validationResultParent.errors.map((error, idx) => (
                                      <li key={idx}>{error}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}
                            {validationResultParent.warnings.length > 0 && (
                              <Alert className="bg-amber-50 border-amber-200">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800">
                                  <ul className="list-disc list-inside space-y-1">
                                    {validationResultParent.warnings.map((warning, idx) => (
                                      <li key={idx}>{warning}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}
                            {validationResultParent.isValid && originalContractDataParent && (
                              <Alert className="bg-emerald-50 border-emerald-200">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <AlertDescription className="text-emerald-800">
                                  <p className="font-medium mb-2">Contract validated successfully! Details have been loaded.</p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-emerald-600">Original Contract:</span>{' '}{originalContractDataParent.referenceNumber}</div>
                                    <div><span className="text-emerald-600">Title:</span>{' '}{originalContractDataParent.contractTitle}</div>
                                    <div><span className="text-emerald-600">Contractor:</span>{' '}{originalContractDataParent.contractorName}</div>
                                    <div><span className="text-emerald-600">Value:</span>{' '}{originalContractDataParent.contractCurrency} {Number(originalContractDataParent.contractValue).toLocaleString()}</div>
                                    <div><span className="text-emerald-600">Start Date:</span>{' '}{originalContractDataParent.contractStartDate}</div>
                                    <div><span className="text-emerald-600">End Date:</span>{' '}{originalContractDataParent.contractEndDate}</div>
                                    <div><span className="text-emerald-600">Renewals:</span>{' '}{originalContractDataParent.renewalCount} of {3} used</div>
                                    <div>
                                      <span className="text-emerald-600">Days to Expiry:</span>{' '}
                                      <Badge variant={originalContractDataParent.daysUntilExpiry <= 30 ? 'destructive' : originalContractDataParent.daysUntilExpiry <= 60 ? 'secondary' : 'outline'}>
                                        {originalContractDataParent.daysUntilExpiry} days
                                      </Badge>
                                    </div>
                                  </div>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Field 2: Original Transaction Number */}
                      <div className="space-y-2">
                        <Label htmlFor="originalTransactionNumber">Original Transaction Number</Label>
                        <div className="flex gap-2">
                          <Input
                            id="originalTransactionNumber"
                            value={formData.originalTransactionNumber}
                            onChange={(e) => {
                              updateFormData("originalTransactionNumber", e.target.value)
                              setValidationResultOriginalTransaction(null)
                              setOriginalContractDataOriginalTransaction(null)
                            }}
                            placeholder="e.g., CON-2024-0001"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleValidateOriginalTransaction}
                            disabled={!formData.originalTransactionNumber || isValidatingOriginalTransaction}
                          >
                            {isValidatingOriginalTransaction ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                Validating...
                              </>
                            ) : (
                              <>
                                <FileCheck className="h-4 w-4 mr-2" />
                                Validate &amp; Load
                              </>
                            )}
                          </Button>
                        </div>
                        {validationResultOriginalTransaction && (
                          <div className="space-y-2 mt-1">
                            {validationResultOriginalTransaction.errors.length > 0 && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  <ul className="list-disc list-inside space-y-1">
                                    {validationResultOriginalTransaction.errors.map((error, idx) => (
                                      <li key={idx}>{error}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}
                            {validationResultOriginalTransaction.warnings.length > 0 && (
                              <Alert className="bg-amber-50 border-amber-200">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800">
                                  <ul className="list-disc list-inside space-y-1">
                                    {validationResultOriginalTransaction.warnings.map((warning, idx) => (
                                      <li key={idx}>{warning}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}
                            {validationResultOriginalTransaction.isValid && originalContractDataOriginalTransaction && (
                              <Alert className="bg-emerald-50 border-emerald-200">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <AlertDescription className="text-emerald-800">
                                  <p className="font-medium mb-2">Contract validated successfully! Details have been loaded.</p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-emerald-600">Original Contract:</span>{' '}{originalContractDataOriginalTransaction.referenceNumber}</div>
                                    <div><span className="text-emerald-600">Title:</span>{' '}{originalContractDataOriginalTransaction.contractTitle}</div>
                                    <div><span className="text-emerald-600">Contractor:</span>{' '}{originalContractDataOriginalTransaction.contractorName}</div>
                                    <div><span className="text-emerald-600">Value:</span>{' '}{originalContractDataOriginalTransaction.contractCurrency} {Number(originalContractDataOriginalTransaction.contractValue).toLocaleString()}</div>
                                    <div><span className="text-emerald-600">Start Date:</span>{' '}{originalContractDataOriginalTransaction.contractStartDate}</div>
                                    <div><span className="text-emerald-600">End Date:</span>{' '}{originalContractDataOriginalTransaction.contractEndDate}</div>
                                    <div><span className="text-emerald-600">Renewals:</span>{' '}{originalContractDataOriginalTransaction.renewalCount} of {3} used</div>
                                    <div>
                                      <span className="text-emerald-600">Days to Expiry:</span>{' '}
                                      <Badge variant={originalContractDataOriginalTransaction.daysUntilExpiry <= 30 ? 'destructive' : originalContractDataOriginalTransaction.daysUntilExpiry <= 60 ? 'secondary' : 'outline'}>
                                        {originalContractDataOriginalTransaction.daysUntilExpiry} days
                                      </Badge>
                                    </div>
                                  </div>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </div>
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
                            if (value !== "single-source") {
                              updateFormData("cpoApproved", "")
                            }
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
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgency Indicator <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.urgency}
                          onValueChange={(value) => updateFormData("urgency", value)}
                        >
                          <SelectTrigger id="urgency">
                            <SelectValue placeholder="Select urgency" />
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
                        <Label htmlFor="confidentiality">Confidentiality Indicator <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.confidentiality}
                          onValueChange={(value) => updateFormData("confidentiality", value)}
                        >
                          <SelectTrigger id="confidentiality">
                            <SelectValue placeholder="Select confidentiality" />
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
                      <div className="space-y-2">
                        <Label htmlFor="contractingPartyScope">Contracting Party Scope <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.contractingPartyScope}
                          onValueChange={(value) => updateFormData("contractingPartyScope", value)}
                        >
                          <SelectTrigger id="contractingPartyScope">
                            <SelectValue placeholder="Select scope" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTRACTING_PARTY_SCOPES.map((scope) => (
                              <SelectItem key={scope.value} value={scope.value}>
                                {scope.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {formData.procurementMethod === "single-source" && (
                      <div className="space-y-2">
                        <Label htmlFor="cpoApproved">CPO Approved <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.cpoApproved}
                          onValueChange={(value) => updateFormData("cpoApproved", value)}
                        >
                          <SelectTrigger id="cpoApproved">
                            <SelectValue placeholder="Select Yes or No" />
                          </SelectTrigger>
                          <SelectContent>
                            {CPO_APPROVAL_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
                    
                    {(formData.contractType === "REN") && (
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
                      value={documentRequirements.always.length > 0 ? ((documentRequirements.always.length - missingRequiredDocs.length) / documentRequirements.always.length) * 100 : 0}
                      className="h-2 mb-4"
                    />
                    {isChecklistLoading && (
                      <p className="text-xs text-muted-foreground mb-2">Loading checklist from server...</p>
                    )}
                    <div className="grid gap-2 sm:grid-cols-2">
                      {documentRequirements.always.map((doc) => {
                        const isUploaded = files.some(f => f.documentType === doc.value) || keptExistingDocuments.some(d => d.document_type_code === doc.value)
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

                  {/* Previously uploaded documents (resubmission only) */}
                  {resubmitId && existingDocuments.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Previously Uploaded Documents</Label>
                      {existingDocuments.map((doc) => {
                        const isRemoved = removedDocumentIds.has(doc.id)
                        return (
                          <div
                            key={doc.id}
                            className={`rounded-lg border p-4 flex items-start justify-between gap-3 transition-colors ${
                              isRemoved ? "bg-red-50/50 border-red-200 opacity-60" : "border-border bg-card"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="h-8 w-8 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className={`text-sm font-medium truncate ${isRemoved ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {doc.file_name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{doc.document_type_label}</span>
                                  <span>•</span>
                                  <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                              </div>
                            </div>
                            {isRemoved ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                                onClick={() => setRemovedDocumentIds((prev) => {
                                  const next = new Set(prev)
                                  next.delete(doc.id)
                                  return next
                                })}
                              >
                                Undo
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setRemovedDocumentIds((prev) => new Set(prev).add(doc.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove document</span>
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
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
                      {formData.originalTransactionNumber && (
                        <p className="text-sm text-muted-foreground mt-2">Original Transaction: {formData.originalTransactionNumber}</p>
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
                          <p className="text-sm text-muted-foreground">
                            Urgency: {URGENCY_LEVELS.find((u) => u.value === formData.urgency)?.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Confidentiality: {CONFIDENTIALITY_LEVELS.find((c) => c.value === formData.confidentiality)?.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Contracting Scope: {CONTRACTING_PARTY_SCOPES.find((s) => s.value === formData.contractingPartyScope)?.label}
                          </p>
                          {formData.procurementMethod === "single-source" && formData.cpoApproved && (
                            <p className="text-sm text-muted-foreground">
                              CPO Approved: {formData.cpoApproved}
                            </p>
                          )}
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
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Documents ({keptExistingDocuments.length + files.length})
                      </h4>
                      {keptExistingDocuments.length === 0 && files.length === 0 ? (
                        <p className="text-muted-foreground">No documents uploaded</p>
                      ) : (
                        <ul className="space-y-1">
                          {keptExistingDocuments.map((doc) => (
                            <li key={doc.id} className="text-sm text-foreground flex items-center gap-2">
                              <FileText className="h-3 w-3 text-primary" />
                              {doc.file_name} ({doc.document_type_label})
                              <Badge variant="outline" className="text-xs">Existing</Badge>
                            </li>
                          ))}
                          {files.map((file) => (
                            <li key={file.id} className="text-sm text-foreground flex items-center gap-2">
                              <FileText className="h-3 w-3 text-primary" />
                              {file.file.name} ({allDocumentTypes.find(t => t.value === file.documentType)?.label})
                              {resubmitId && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">New</Badge>}
                            </li>
                          ))}
                        </ul>
                      )}
                      {removedDocumentIds.size > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {removedDocumentIds.size} previously uploaded document(s) will be removed.
                        </p>
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
                      className="mt-0.5 h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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
                        className="cursor-pointer underline font-medium hover:no-underline"
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
                
                {/* Last saved indicator */}
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
                    className={resubmitId ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        {resubmitId ? "Resubmitting..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {resubmitId ? "Resubmit Contract" : "Submit Contract Request"}
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
function ContractsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading contracts form...</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer compact />
    </div>
  )
}

// Export with Suspense boundary for useSearchParams
export default function ContractsPage() {
  return (
    <RequireAuthGuard returnPath="/contracts">
      <ContractsSubmitGuard>
        <Suspense fallback={<ContractsLoading />}>
          <ContractsPageContent />
        </Suspense>
      </ContractsSubmitGuard>
    </RequireAuthGuard>
  )
}
