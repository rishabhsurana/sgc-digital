"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload, type UploadedFile } from "@/components/file-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, Save, Send, AlertCircle, CheckCircle, Clock, FileText, 
  AlertTriangle, History, Upload, Edit3, Eye, Download, Calendar,
  Building2, User, Phone, Mail, DollarSign, FileCheck
} from "lucide-react"
import Link from "next/link"

// Types
interface CorrectionRequest {
  correctionRequestId: string
  submissionId: string
  submissionType: 'contract' | 'correspondence'
  transactionNumber: string
  title: string
  correctionCycleNumber: number
  primaryReason: string
  additionalReasons: string[]
  instructions: string
  specificIssues: Array<{
    field: string
    section: string
    issue: string
    required: boolean
  }>
  affectedDocuments: Array<{
    documentId: string
    documentName: string
    issue: string
  }>
  requestedAt: string
  deadlineDate: string
  daysRemaining: number
  status: 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  requestedBy: string
  // Original submission data for editing
  originalData: Record<string, unknown>
}

// Mock data for demonstration
const MOCK_CORRECTION_REQUEST: CorrectionRequest = {
  correctionRequestId: 'cr-001',
  submissionId: 'con-001',
  submissionType: 'contract',
  transactionNumber: 'CON-N5PQ3Y',
  title: 'IT Services Contract - Ministry of Finance',
  correctionCycleNumber: 1,
  primaryReason: 'Missing Documents',
  additionalReasons: ['Incomplete Information'],
  instructions: 'Please provide the following corrections:\n\n1. Upload the Performance Bond documentation\n2. Complete the insurance details section\n3. Clarify the payment terms schedule',
  specificIssues: [
    { field: 'performanceBondNumber', section: 'Financial', issue: 'Performance bond number is required', required: true },
    { field: 'performanceBondAmount', section: 'Financial', issue: 'Bond amount must match contract value', required: true },
    { field: 'insuranceProvider', section: 'Insurance', issue: 'Insurance provider name is missing', required: true },
    { field: 'insurancePolicyNumber', section: 'Insurance', issue: 'Policy number is required', required: true },
    { field: 'paymentSchedule', section: 'Payment Terms', issue: 'Payment schedule needs clarification', required: false },
  ],
  affectedDocuments: [
    { documentId: 'doc-001', documentName: 'Performance Bond Certificate', issue: 'Document not uploaded' },
    { documentId: 'doc-002', documentName: 'Insurance Certificate', issue: 'Document not uploaded' },
  ],
  requestedAt: '2026-03-01',
  deadlineDate: '2026-03-08',
  daysRemaining: 5,
  status: 'PENDING',
  requestedBy: 'SGC Legal Officer',
  originalData: {
    // Contract details
    contractTitle: 'IT Services Contract - Ministry of Finance',
    contractDescription: 'Provision of IT infrastructure and support services for the Ministry of Finance headquarters.',
    ministry: 'Ministry of Finance',
    department: 'IT Department',
    contractNature: 'consultancy',
    contractCategory: 'CAT_CONS',
    contractValue: '150000',
    contractCurrency: 'BBD',
    contractStartDate: '2026-04-01',
    contractEndDate: '2027-03-31',
    // Contractor details
    contractorName: 'TechCorp Solutions Ltd',
    contractorAddress: '123 Business Park, Bridgetown',
    contractorEmail: 'contracts@techcorp.bb',
    contractorPhone: '246-555-1234',
    // Missing/incomplete fields
    performanceBondNumber: '',
    performanceBondAmount: '',
    performanceBondExpiry: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiry: '',
    paymentSchedule: 'Monthly installments',
  }
}

export default function CorrectionResponsePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [correctionRequest, setCorrectionRequest] = useState<CorrectionRequest | null>(null)
  
  // Editable form data (copy of original data that user can modify)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set())
  
  // Response data
  const [responseComments, setResponseComments] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  
  // Load correction request data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCorrectionRequest(MOCK_CORRECTION_REQUEST)
      setFormData(MOCK_CORRECTION_REQUEST.originalData as Record<string, string>)
      setIsLoading(false)
    }, 500)
  }, [resolvedParams.id])
  
  // Track field changes
  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Track if field was changed from original
    if (correctionRequest?.originalData[field] !== value) {
      setChangedFields(prev => new Set(prev).add(field))
    } else {
      setChangedFields(prev => {
        const next = new Set(prev)
        next.delete(field)
        return next
      })
    }
  }
  
  // Save draft
  const handleSaveDraft = async () => {
    setIsSaving(true)
    // TODO: Save to CorrectionResponseDrafts table
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }
  
  // Submit corrections
  const handleSubmitCorrections = async () => {
    setIsSubmitting(true)
    
    // TODO: Call API to:
    // 1. Update the main submission record with corrected data
    // 2. Store the changes in CorrectionDataChanges table
    // 3. Upload new documents to CorrectionDocuments table
    // 4. Update CorrectionRequest status to 'SUBMITTED'
    // 5. Move submission back to review queue
    // 6. Send notification to reviewer
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirect to dashboard with success message
    router.push('/dashboard?correction_submitted=true')
  }
  
  // Check if field has an issue
  const hasIssue = (field: string) => {
    return correctionRequest?.specificIssues.some(i => i.field === field)
  }
  
  // Get issue for field
  const getIssue = (field: string) => {
    return correctionRequest?.specificIssues.find(i => i.field === field)
  }
  
  // Check if all required issues are addressed
  const allRequiredIssuesAddressed = () => {
    if (!correctionRequest) return false
    
    const requiredIssues = correctionRequest.specificIssues.filter(i => i.required)
    return requiredIssues.every(issue => {
      const value = formData[issue.field]
      return value && value.trim() !== ''
    })
  }
  
  // Check if required documents are uploaded
  const allRequiredDocumentsUploaded = () => {
    if (!correctionRequest) return false
    return correctionRequest.affectedDocuments.every(doc => 
      uploadedFiles.some(f => f.documentType === doc.documentId)
    )
  }
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading correction request...</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  if (!correctionRequest) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Correction request not found.</AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          {/* Back Button */}
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="font-mono">
                    {correctionRequest.transactionNumber}
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    Correction Cycle #{correctionRequest.correctionCycleNumber}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{correctionRequest.title}</h1>
                <p className="text-muted-foreground mt-1">
                  Please review and address the corrections requested below
                </p>
              </div>
              
              {/* Deadline Badge */}
              <div className="text-right">
                <div className={`flex items-center gap-2 ${correctionRequest.daysRemaining <= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">
                    {correctionRequest.daysRemaining} days remaining
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Deadline: {correctionRequest.deadlineDate}
                </p>
              </div>
            </div>
          </div>
          
          {/* Correction Instructions Alert */}
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <p className="font-medium mb-2">Corrections Required - {correctionRequest.primaryReason}</p>
              <div className="whitespace-pre-wrap text-sm">{correctionRequest.instructions}</div>
            </AlertDescription>
          </Alert>
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="edit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Data
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="issues" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Issues ({correctionRequest.specificIssues.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>
            
            {/* Edit Data Tab */}
            <TabsContent value="edit">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5" />
                    Edit Submission Data
                  </CardTitle>
                  <CardDescription>
                    Update the fields below to address the corrections. Changed fields are highlighted in blue.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contract Details Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Contract Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contractTitle">Contract Title</Label>
                        <Input
                          id="contractTitle"
                          value={formData.contractTitle || ''}
                          onChange={(e) => updateFormField('contractTitle', e.target.value)}
                          className={changedFields.has('contractTitle') ? 'border-blue-500 bg-blue-50' : ''}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ministry">Ministry/Department</Label>
                        <Input
                          id="ministry"
                          value={formData.ministry || ''}
                          onChange={(e) => updateFormField('ministry', e.target.value)}
                          className={changedFields.has('ministry') ? 'border-blue-500 bg-blue-50' : ''}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contractDescription">Description</Label>
                      <Textarea
                        id="contractDescription"
                        value={formData.contractDescription || ''}
                        onChange={(e) => updateFormField('contractDescription', e.target.value)}
                        rows={3}
                        className={changedFields.has('contractDescription') ? 'border-blue-500 bg-blue-50' : ''}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contractValue">Contract Value</Label>
                        <Input
                          id="contractValue"
                          value={formData.contractValue || ''}
                          onChange={(e) => updateFormField('contractValue', e.target.value)}
                          className={changedFields.has('contractValue') ? 'border-blue-500 bg-blue-50' : ''}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contractStartDate">Start Date</Label>
                        <Input
                          id="contractStartDate"
                          type="date"
                          value={formData.contractStartDate || ''}
                          onChange={(e) => updateFormField('contractStartDate', e.target.value)}
                          className={changedFields.has('contractStartDate') ? 'border-blue-500 bg-blue-50' : ''}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contractEndDate">End Date</Label>
                        <Input
                          id="contractEndDate"
                          type="date"
                          value={formData.contractEndDate || ''}
                          onChange={(e) => updateFormField('contractEndDate', e.target.value)}
                          className={changedFields.has('contractEndDate') ? 'border-blue-500 bg-blue-50' : ''}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Financial Details Section - Contains Issues */}
                  <div className="space-y-4 p-4 border-2 border-orange-200 bg-orange-50/50 rounded-lg">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financial Details
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 text-xs">
                        Corrections Required
                      </Badge>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="performanceBondNumber" className="flex items-center gap-2">
                          Performance Bond Number
                          {hasIssue('performanceBondNumber') && (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </Label>
                        <Input
                          id="performanceBondNumber"
                          value={formData.performanceBondNumber || ''}
                          onChange={(e) => updateFormField('performanceBondNumber', e.target.value)}
                          placeholder="Enter bond number"
                          className={`${changedFields.has('performanceBondNumber') ? 'border-blue-500 bg-blue-50' : ''} ${hasIssue('performanceBondNumber') && !formData.performanceBondNumber ? 'border-orange-500' : ''}`}
                        />
                        {hasIssue('performanceBondNumber') && (
                          <p className="text-xs text-orange-600">{getIssue('performanceBondNumber')?.issue}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="performanceBondAmount" className="flex items-center gap-2">
                          Bond Amount
                          {hasIssue('performanceBondAmount') && (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </Label>
                        <Input
                          id="performanceBondAmount"
                          value={formData.performanceBondAmount || ''}
                          onChange={(e) => updateFormField('performanceBondAmount', e.target.value)}
                          placeholder="Enter amount"
                          className={`${changedFields.has('performanceBondAmount') ? 'border-blue-500 bg-blue-50' : ''} ${hasIssue('performanceBondAmount') && !formData.performanceBondAmount ? 'border-orange-500' : ''}`}
                        />
                        {hasIssue('performanceBondAmount') && (
                          <p className="text-xs text-orange-600">{getIssue('performanceBondAmount')?.issue}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="performanceBondExpiry">Bond Expiry Date</Label>
                        <Input
                          id="performanceBondExpiry"
                          type="date"
                          value={formData.performanceBondExpiry || ''}
                          onChange={(e) => updateFormField('performanceBondExpiry', e.target.value)}
                          className={changedFields.has('performanceBondExpiry') ? 'border-blue-500 bg-blue-50' : ''}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Insurance Details Section - Contains Issues */}
                  <div className="space-y-4 p-4 border-2 border-orange-200 bg-orange-50/50 rounded-lg">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      Insurance Details
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 text-xs">
                        Corrections Required
                      </Badge>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="insuranceProvider" className="flex items-center gap-2">
                          Insurance Provider
                          {hasIssue('insuranceProvider') && (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </Label>
                        <Input
                          id="insuranceProvider"
                          value={formData.insuranceProvider || ''}
                          onChange={(e) => updateFormField('insuranceProvider', e.target.value)}
                          placeholder="Enter provider name"
                          className={`${changedFields.has('insuranceProvider') ? 'border-blue-500 bg-blue-50' : ''} ${hasIssue('insuranceProvider') && !formData.insuranceProvider ? 'border-orange-500' : ''}`}
                        />
                        {hasIssue('insuranceProvider') && (
                          <p className="text-xs text-orange-600">{getIssue('insuranceProvider')?.issue}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="insurancePolicyNumber" className="flex items-center gap-2">
                          Policy Number
                          {hasIssue('insurancePolicyNumber') && (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </Label>
                        <Input
                          id="insurancePolicyNumber"
                          value={formData.insurancePolicyNumber || ''}
                          onChange={(e) => updateFormField('insurancePolicyNumber', e.target.value)}
                          placeholder="Enter policy number"
                          className={`${changedFields.has('insurancePolicyNumber') ? 'border-blue-500 bg-blue-50' : ''} ${hasIssue('insurancePolicyNumber') && !formData.insurancePolicyNumber ? 'border-orange-500' : ''}`}
                        />
                        {hasIssue('insurancePolicyNumber') && (
                          <p className="text-xs text-orange-600">{getIssue('insurancePolicyNumber')?.issue}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="insuranceExpiry">Policy Expiry Date</Label>
                        <Input
                          id="insuranceExpiry"
                          type="date"
                          value={formData.insuranceExpiry || ''}
                          onChange={(e) => updateFormField('insuranceExpiry', e.target.value)}
                          className={changedFields.has('insuranceExpiry') ? 'border-blue-500 bg-blue-50' : ''}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Terms */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Payment Terms</h3>
                    <div className="space-y-2">
                      <Label htmlFor="paymentSchedule" className="flex items-center gap-2">
                        Payment Schedule
                        {hasIssue('paymentSchedule') && (
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        )}
                      </Label>
                      <Textarea
                        id="paymentSchedule"
                        value={formData.paymentSchedule || ''}
                        onChange={(e) => updateFormField('paymentSchedule', e.target.value)}
                        rows={3}
                        placeholder="Describe the payment schedule..."
                        className={changedFields.has('paymentSchedule') ? 'border-blue-500 bg-blue-50' : ''}
                      />
                      {hasIssue('paymentSchedule') && (
                        <p className="text-xs text-amber-600">{getIssue('paymentSchedule')?.issue}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Changes Summary */}
                  {changedFields.size > 0 && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <p className="font-medium">You have made changes to {changedFields.size} field(s):</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {Array.from(changedFields).map(field => (
                            <li key={field}>{field}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Required Documents
                  </CardTitle>
                  <CardDescription>
                    Upload the documents requested to address the corrections.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Required Documents */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Required Documents</h3>
                    
                    {correctionRequest.affectedDocuments.map((doc) => (
                      <div key={doc.documentId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground flex items-center gap-2">
                              {doc.documentName}
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{doc.issue}</p>
                          </div>
                          {uploadedFiles.some(f => f.documentType === doc.documentId) && (
                            <Badge className="bg-emerald-100 text-emerald-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                          )}
                        </div>
                        
                        <FileUpload
                          files={uploadedFiles.filter(f => f.documentType === doc.documentId)}
                          onFilesChange={(files) => {
                            const updatedFiles = uploadedFiles.filter(f => f.documentType !== doc.documentId)
                            const newFiles = files.map(f => ({ ...f, documentType: doc.documentId }))
                            setUploadedFiles([...updatedFiles, ...newFiles])
                          }}
                          documentTypes={[{ value: doc.documentId, label: doc.documentName }]}
                          acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Additional Documents */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Additional Supporting Documents (Optional)</h3>
                    <FileUpload
                      files={uploadedFiles.filter(f => f.documentType === 'additional')}
                      onFilesChange={(files) => {
                        const additionalFiles = files.map(f => ({ ...f, documentType: 'additional' }))
                        const existingRequired = uploadedFiles.filter(f => f.documentType !== 'additional')
                        setUploadedFiles([...existingRequired, ...additionalFiles])
                      }}
                      documentTypes={[{ value: 'additional', label: 'Additional Supporting Document' }]}
                      acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Issues Tab */}
            <TabsContent value="issues">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Issues to Address
                  </CardTitle>
                  <CardDescription>
                    Complete checklist of all issues that need to be corrected.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {correctionRequest.specificIssues.map((issue, index) => {
                      const isResolved = formData[issue.field] && formData[issue.field].trim() !== ''
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex items-start gap-4 p-4 rounded-lg border ${isResolved ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isResolved ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                            {isResolved ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${isResolved ? 'text-emerald-700' : 'text-orange-700'}`}>
                                {issue.field}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {issue.section}
                              </Badge>
                              {issue.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className={`text-sm ${isResolved ? 'text-emerald-600' : 'text-orange-600'}`}>
                              {issue.issue}
                            </p>
                            {isResolved && (
                              <p className="text-xs text-emerald-600 mt-1">
                                Resolved - New value: {formData[issue.field]}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Progress Summary */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {correctionRequest.specificIssues.filter(i => formData[i.field] && formData[i.field].trim() !== '').length} of {correctionRequest.specificIssues.length} issues addressed
                      </span>
                    </div>
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(correctionRequest.specificIssues.filter(i => formData[i.field] && formData[i.field].trim() !== '').length / correctionRequest.specificIssues.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Correction History
                  </CardTitle>
                  <CardDescription>
                    Timeline of correction requests and responses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Corrections Requested</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Requested by {correctionRequest.requestedBy} on {correctionRequest.requestedAt}
                        </p>
                        <p className="text-sm text-orange-600 mt-2">
                          Reason: {correctionRequest.primaryReason}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Response Comments */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Response Comments</CardTitle>
              <CardDescription>
                Add any comments or explanations about the corrections you have made.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={responseComments}
                onChange={(e) => setResponseComments(e.target.value)}
                placeholder="Enter any comments about the corrections made..."
                rows={4}
              />
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-4">
              {!allRequiredIssuesAddressed() && (
                <span className="text-sm text-amber-600">
                  Please address all required issues before submitting
                </span>
              )}
              
              <Button
                onClick={handleSubmitCorrections}
                disabled={isSubmitting || !allRequiredIssuesAddressed()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Submitting Corrections...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Corrections
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
