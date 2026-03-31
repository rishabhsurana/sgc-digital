import { apiDelete, apiGet, apiPut, type ApiResponse } from '@/lib/api-client'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export type DashboardUiStatus =
  | 'pending'
  | 'in-review'
  | 'clarification'
  | 'approved'
  | 'completed'
  | 'rejected'

export interface DashboardSubmissionItem {
  id: string
  type: 'correspondence' | 'contract'
  transaction_number: string | null
  title: string
  ministry: string | null
  status: string
  ui_status: DashboardUiStatus
  stage: string
  submitted_date: string | null
  last_updated: string
}

export interface DashboardStats {
  total: number
  active: number
  actionRequired: number
  completed: number
}

export interface DashboardPayload {
  submissions: DashboardSubmissionItem[]
  stats: DashboardStats
}

export interface DashboardDraft {
  draftId: string
  userId: string
  draftType: 'contract' | 'correspondence'
  formData: Record<string, unknown>
  currentStep: number
  totalSteps: number
  progressPercentage: number
  submissionStatusId: number
  submissionAttempts: number
  lastSubmissionError: string | null
  lastSubmissionErrorType: string | null
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  title: string
}

export async function fetchDashboardSubmissions(): Promise<
  ApiResponse<DashboardPayload>
> {
  return apiGet<DashboardPayload>('/api/dashboard/submissions')
}

type DraftApiRow = {
  draft_id: string
  user_id: string
  draft_name: string | null
  form_data: string
  current_step: number
  total_steps: number
  progress_percentage: number
  submission_status_id: number
  submission_attempts: number
  last_submission_error: string | null
  created_at: string
  updated_at: string
  expires_at: string
}

function safeParseJson(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
    return {}
  } catch {
    return {}
  }
}

function buildDraftTitle(
  type: 'contract' | 'correspondence',
  row: DraftApiRow,
  formData: Record<string, unknown>
): string {
  if (row.draft_name?.trim()) return row.draft_name.trim()
  if (type === 'contract') {
    const nature = String(formData.contractNature || formData.contract_nature || 'Contract')
    const contractor = String(formData.contractorName || formData.contractor_name || 'Unknown')
    return `${nature.charAt(0).toUpperCase() + nature.slice(1)} - ${contractor}`
  }
  const cType = String(formData.correspondenceType || formData.correspondence_type || 'Correspondence')
  const subject = String(formData.subject || 'Untitled')
  return `${cType} - ${subject.slice(0, 50)}`
}

function mapDraft(type: 'contract' | 'correspondence', row: DraftApiRow): DashboardDraft {
  const formData = safeParseJson(row.form_data)
  return {
    draftId: row.draft_id,
    userId: row.user_id,
    draftType: type,
    formData,
    currentStep: Number(row.current_step || 1),
    totalSteps: Number(row.total_steps || 1),
    progressPercentage: Number(row.progress_percentage || 0),
    submissionStatusId: Number(row.submission_status_id || 1),
    submissionAttempts: Number(row.submission_attempts || 0),
    lastSubmissionError: row.last_submission_error || null,
    lastSubmissionErrorType: null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    expiresAt: new Date(row.expires_at),
    title: buildDraftTitle(type, row, formData),
  }
}

export async function fetchAllDrafts(): Promise<ApiResponse<DashboardDraft[]>> {
  const [contractRes, correspondenceRes] = await Promise.all([
    apiGet<DraftApiRow[]>('/api/drafts/contract'),
    apiGet<DraftApiRow[]>('/api/drafts/correspondence'),
  ])

  if (!contractRes.success && !correspondenceRes.success) {
    return {
      success: false,
      error: contractRes.error || correspondenceRes.error || 'Failed to load drafts',
    }
  }

  const drafts: DashboardDraft[] = []
  if (contractRes.success && contractRes.data) {
    drafts.push(...contractRes.data.map((d) => mapDraft('contract', d)))
  }
  if (correspondenceRes.success && correspondenceRes.data) {
    drafts.push(...correspondenceRes.data.map((d) => mapDraft('correspondence', d)))
  }

  drafts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  return { success: true, data: drafts }
}

export async function deleteDraftByType(
  draftType: 'contract' | 'correspondence',
  draftId: string
): Promise<ApiResponse<null>> {
  return apiDelete<null>(`/api/drafts/${draftType}/${draftId}`)
}

export interface HistoryEventRow {
  id: string
  action: string
  stage: string | null
  note: string | null
  created_at: string
  performer?: { full_name?: string } | null
}

export interface DocumentRow {
  id: string
  file_name: string
  file_size: number
  mime_type: string
  uploaded_date: string
  uploaded_by: string
  document_type_label?: string
}

export async function fetchCorrespondenceDetail(id: string): Promise<
  ApiResponse<{ correspondence: Record<string, unknown>; documents: DocumentRow[]; history: HistoryEventRow[] }>
> {
  return apiGet(`/api/correspondences/${id}`)
}

export async function fetchContractDetail(id: string): Promise<
  ApiResponse<{ contract: Record<string, unknown>; documents: DocumentRow[]; history: HistoryEventRow[] }>
> {
  return apiGet(`/api/contracts/${id}`)
}

export async function submitCorrespondenceResponse(
  id: string,
  body: { note?: string }
): Promise<ApiResponse<unknown>> {
  return apiPut(`/api/correspondences/${id}/respond`, body)
}

export async function submitContractResponse(
  id: string,
  body: { note?: string }
): Promise<ApiResponse<unknown>> {
  return apiPut(`/api/contracts/${id}/respond`, body)
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('sgc_token')
}

export async function uploadSubmissionDocuments(
  submissionType: 'correspondence' | 'contract',
  submissionId: string,
  files: File[]
): Promise<void> {
  const token = getToken()
  const formData = new FormData()
  formData.append('submission_type', submissionType)
  formData.append('submission_id', submissionId)
  formData.append('document_type_code', 'CLARIFICATION_RESPONSE')
  formData.append('document_type_label', 'Clarification response')
  formData.append('condition', 'if_applicable')
  for (const f of files) {
    formData.append('files', f)
  }

  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((json as { message?: string }).message || 'Upload failed')
  }
}

export async function downloadDocumentAuthorized(
  documentId: string,
  fileName: string
): Promise<void> {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/documents/${documentId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    throw new Error('Download failed')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatYmd(iso: string | undefined | null): string {
  if (!iso) return '—'
  return iso.slice(0, 10)
}
