import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  handleUnauthorizedResponse,
  type ApiResponse,
} from '@/lib/api-client'
import { toast } from 'sonner'

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
  stage_history: { stage: string; date: string }[]
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
  case_stage_history_id: number
  case_id: string
  from_stage_code: string | null
  to_stage_code: string
  changed_at: string
  notes: string | null
  is_visible_to_applicant: boolean
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

export interface ApplicantResponseRow {
  applicant_response_id: number
  clarification_request_id: number | null
  case_id: string
  responded_by_user_id: string | null
  response_message: string
  responded_at: string
}

export interface SubmissionResponseRow {
  response_id: string
  submission_type: 'correspondence' | 'contract'
  submission_id: string
  response_text: string | null
  responded_by: string
  response_source: string
  created_at: string
}

export interface ClarificationDocumentRow {
  id: string
  file_name: string
  file_size: number
  mime_type: string
}

export interface ClarificationRequestRow {
  clarification_request_id: number
  case_id: string
  requested_by_user_id: string
  request_title: string
  request_message: string
  requested_at: string
  response_due_at: string | null
  status_code: string
  is_validated: boolean | null
  responses: ApplicantResponseRow[]
  documents: ClarificationDocumentRow[]
}

export async function fetchCorrespondenceDetail(id: string): Promise<
  ApiResponse<{
    correspondence: Record<string, unknown>
    documents: DocumentRow[]
    history: HistoryEventRow[]
    clarification_requests: ClarificationRequestRow[]
    submission_responses: SubmissionResponseRow[]
  }>
> {
  return apiGet(`/api/correspondences/${id}`)
}

export async function fetchContractDetail(id: string): Promise<
  ApiResponse<{
    contract: Record<string, unknown>
    documents: DocumentRow[]
    history: HistoryEventRow[]
    clarification_requests: ClarificationRequestRow[]
    submission_responses: SubmissionResponseRow[]
  }>
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

export async function resubmitContract(
  id: string,
  formData: Record<string, unknown>
): Promise<ApiResponse<{ transaction_number?: string; id?: string }>> {
  return apiPut(`/api/contracts/${id}/resubmit`, formData)
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

  handleUnauthorizedResponse(res.status)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((json as { message?: string }).message || 'Upload failed')
  }
}

export async function downloadDocumentAuthorized(
  documentId: string,
  fileName: string
): Promise<void> {
  try {
    const token = getToken()
    const res = await fetch(`${API_BASE}/api/documents/${documentId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    handleUnauthorizedResponse(res.status)
    if (!res.ok) {
      toast.error('Download failed')
      return
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
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Download failed')
  }
}

export interface ReportsFilters {
  dateRange?: 'last-7' | 'last-30' | 'last-90' | 'last-year' | 'all-time'
  ministry?: string
  from?: string
  to?: string
}

export interface ReportsSummaryStats {
  totalSubmissions: number
  submissionsChange: number
  pendingReview: number
  pendingChange: number
  avgProcessingDays: number
  processingChange: number
  completionRate: number
  completionChange: number
  totalCorrespondences: number
  totalContracts: number
}

export interface ReportsCorrespondenceType {
  type: string
  count: number
  percentage: number
}

export interface ReportsContractsNatureRow {
  type: string
  count: number
  value: number
  avgValue: number
  maxValue: number
}

export interface ReportsContractsNaturePayload {
  rows: ReportsContractsNatureRow[]
  totalValue: number
  totalCount: number
  averageValue: number
  largestValue: number
}

export interface ReportsMinistryRow {
  name: string
  submissions: number
  percentage: number
}

export interface ReportsStatusOverviewSummary {
  pending: number
  inProgress: number
  completed: number
  requiresAction: number
}

export interface ReportsStatusOverviewPayload {
  correspondence: Array<{ status: string; count: string | number }>
  contracts: Array<{ status: string; count: string | number }>
  summary: ReportsStatusOverviewSummary
}

export interface ReportsMonthlyTrend {
  ym: string
  month: string
  correspondence: number
  contracts: number
}

function buildReportsQuery(filters?: ReportsFilters): string {
  const q = new URLSearchParams()
  const dateRange = filters?.dateRange || 'last-30'
  q.set('date_range', dateRange)
  if (filters?.ministry && filters.ministry !== 'all') q.set('ministry', filters.ministry)
  if (filters?.from) q.set('from', filters.from)
  if (filters?.to) q.set('to', filters.to)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function fetchReportsSummary(filters?: ReportsFilters): Promise<ApiResponse<ReportsSummaryStats>> {
  return apiGet(`/api/reports/summary${buildReportsQuery(filters)}`)
}

export function fetchReportsCorrespondenceByType(
  filters?: ReportsFilters
): Promise<ApiResponse<ReportsCorrespondenceType[]>> {
  return apiGet(`/api/reports/correspondence-by-type${buildReportsQuery(filters)}`)
}

export function fetchReportsContractsByNature(
  filters?: ReportsFilters
): Promise<ApiResponse<ReportsContractsNaturePayload>> {
  return apiGet(`/api/reports/contracts-by-nature${buildReportsQuery(filters)}`)
}

export function fetchReportsTopMinistries(
  filters?: ReportsFilters
): Promise<ApiResponse<ReportsMinistryRow[]>> {
  return apiGet(`/api/reports/top-ministries${buildReportsQuery(filters)}`)
}

export function fetchReportsStatusOverview(
  filters?: ReportsFilters
): Promise<ApiResponse<ReportsStatusOverviewPayload>> {
  return apiGet(`/api/reports/status-overview${buildReportsQuery(filters)}`)
}

export function fetchReportsMonthlyTrends(
  filters?: ReportsFilters
): Promise<ApiResponse<ReportsMonthlyTrend[]>> {
  return apiGet(`/api/reports/monthly-trends${buildReportsQuery(filters)}`)
}

export function fetchReportsMinistries(filters?: ReportsFilters): Promise<ApiResponse<string[]>> {
  return apiGet(`/api/reports/ministries${buildReportsQuery(filters)}`)
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

export interface ManagementMdaItem {
  id: number
  code: string
  name: string
  type: 'Ministry' | 'Department' | 'Agency'
  status: 'active' | 'inactive'
  correspondenceCount: number
  contractsCount: number
  usersCount: number
  createdDate: string | null
}

export interface ManagementMdaListParams {
  page?: number
  limit?: number
  search?: string
  status?: 'all' | 'active' | 'inactive'
  type?: 'all' | 'Ministry' | 'Department' | 'Agency'
}

export interface ManagementMdaListResponse extends ApiResponse<ManagementMdaItem[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UpsertManagementMdaPayload {
  code: string
  name: string
  type: 'Ministry' | 'Department' | 'Agency'
  status?: 'active' | 'inactive'
}

function buildMdaQuery(params: ManagementMdaListParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search?.trim()) query.set('search', params.search.trim())
  if (params.status && params.status !== 'all') query.set('status', params.status)
  if (params.type && params.type !== 'all') query.set('type', params.type)
  const value = query.toString()
  return value ? `?${value}` : ''
}

export function fetchManagementMdas(
  params: ManagementMdaListParams = {}
): Promise<ManagementMdaListResponse> {
  return apiGet<ManagementMdaItem[]>(`/api/management/mda${buildMdaQuery(params)}`) as Promise<ManagementMdaListResponse>
}

export function createManagementMda(payload: UpsertManagementMdaPayload): Promise<ApiResponse<ManagementMdaItem>> {
  return apiPost<ManagementMdaItem>('/api/management/mda', payload)
}

export function updateManagementMda(
  id: number,
  payload: Partial<UpsertManagementMdaPayload>
): Promise<ApiResponse<ManagementMdaItem>> {
  return apiPut<ManagementMdaItem>(`/api/management/mda/${id}`, payload)
}

export function deleteManagementMda(id: number): Promise<ApiResponse<null>> {
  return apiDelete<null>(`/api/management/mda/${id}`)
}

/* ---------- User-scoped register types & fetchers ---------- */

export interface RegisterContractRow {
  register_id: string
  contract_id: string | null
  transaction_number: string | null
  contract_title: string | null
  date_received: string | null
  date_completed: string | null
  contract_start_date: string | null
  contract_end_date: string | null
  originating_mda: string | null
  subject: string | null
  nature_of_contract: string | null
  category: string | null
  contract_number: string | null
  contract_type: string | null
  current_status_code: string | null
  contract_value?: string | number | null
  contract_currency?: string | null
  contractor_name?: string | null
  submitted_by_name?: string | null
  submitted_by_email?: string | null
}

export interface RegisterCorrespondenceRow {
  register_id: string
  correspondence_id: string | null
  reference_number: string | null
  correspondence_type: string | null
  subject: string | null
  originating_mda: string | null
  ministry_file_reference: string | null
  submitter_name: string | null
  date_received: string | null
  priority_level: string | null
  current_status_code: string | null
}

export interface RegisterFetchParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export interface ContractRegisterFetchParams extends RegisterFetchParams {
  contract_type?: string
  nature_of_contract?: string
}

function buildRegisterQuery(params: ContractRegisterFetchParams): string {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.search?.trim()) q.set('search', params.search.trim())
  if (params.status && params.status !== 'all') q.set('status', params.status)
  if (params.contract_type && params.contract_type !== 'all') q.set('contract_type', params.contract_type)
  if (params.nature_of_contract && params.nature_of_contract !== 'all') q.set('nature_of_contract', params.nature_of_contract)
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function fetchUserContractRegister(
  params: ContractRegisterFetchParams = {}
): Promise<ApiResponse<RegisterContractRow[]>> {
  return apiGet<RegisterContractRow[]>(`/api/dashboard/registers/contracts${buildRegisterQuery(params)}`)
}

export function fetchUserCorrespondenceRegister(
  params: RegisterFetchParams = {}
): Promise<ApiResponse<RegisterCorrespondenceRow[]>> {
  return apiGet<RegisterCorrespondenceRow[]>(`/api/dashboard/registers/correspondence${buildRegisterQuery(params)}`)
}
