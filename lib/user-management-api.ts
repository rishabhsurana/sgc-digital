import { apiDelete, apiGet, apiPost, apiPut, type ApiResponse } from '@/lib/api-client'

export type PaginatedApiResponse<T> = ApiResponse<T> & {
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

export type PortalUserApiRow = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  submitter_type: string
  organization: string | null
  department: string | null
  status: string
  last_login: string | null
  created_at?: string | null
  createdAt?: string | null
  updated_at?: string | null
  updatedAt?: string | null
  mda?: { id: number; name: string; code?: string } | null
  entity?: { entity_name?: string } | null
}

export type ManagementUserApiRow = {
  id: string
  email: string
  name: string
  role: string
  department: string | null
  is_active: boolean
  created_at?: string | null
  createdAt?: string | null
  updated_at?: string | null
  updatedAt?: string | null
}

export type StaffRequestOptions = {
  departments: Array<{ department_id: number; department_name: string; department_code?: string }>
  roles: Array<{ role_id: number; role_name: string; role_code?: string }>
}

export type StaffRequestApiRow = Record<string, unknown>

export type MdaOption = { id: number; name: string; code: string }

export async function fetchAllPortalUsers(): Promise<PortalUserApiRow[]> {
  const pageSize = 100
  let page = 1
  const all: PortalUserApiRow[] = []
  for (;;) {
    const res = (await apiGet<PortalUserApiRow[]>(
      `/api/users?page=${page}&limit=${pageSize}`
    )) as PaginatedApiResponse<PortalUserApiRow[]>
    if (!res.success || !Array.isArray(res.data)) break
    all.push(...res.data)
    const totalPages = res.pagination?.totalPages ?? 1
    if (page >= totalPages || res.data.length < pageSize) break
    page += 1
  }
  return all
}

export async function fetchStaffRequestOptions(): Promise<StaffRequestOptions | null> {
  const res = await apiGet<StaffRequestOptions>('/api/staff-requests/options')
  if (!res.success || !res.data) return null
  return res.data
}

export async function fetchStaffRequestsRaw(): Promise<StaffRequestApiRow[]> {
  const res = await apiGet<StaffRequestApiRow[]>('/api/staff-requests')
  if (!res.success || !Array.isArray(res.data)) return []
  return res.data
}

export async function fetchManagementUsers(): Promise<ManagementUserApiRow[]> {
  const res = await apiGet<ManagementUserApiRow[]>('/api/management/users')
  if (!res.success || !Array.isArray(res.data)) return []
  return res.data
}

export async function createManagementUserApi(body: {
  email: string
  name: string
  password?: string
  role: string
  department?: string | null
}): Promise<ApiResponse<ManagementUserApiRow>> {
  return apiPost<ManagementUserApiRow>('/api/management/users', body)
}

export async function updateManagementUserApi(
  id: string,
  body: Partial<{ name: string; role: string; department: string | null; is_active: boolean }>
): Promise<ApiResponse<ManagementUserApiRow>> {
  return apiPut<ManagementUserApiRow>(`/api/management/users/${id}`, body)
}

export async function fetchMdasForSelect(): Promise<MdaOption[]> {
  const res = await apiGet<Array<{ id: number; name: string; code: string }>>('/api/mdas')
  if (!res.success || !Array.isArray(res.data)) return []
  return res.data.map((m) => ({ id: m.id, name: m.name, code: m.code }))
}

export async function createPortalUserApi(body: Record<string, unknown>): Promise<ApiResponse<unknown>> {
  return apiPost('/api/users', body)
}

export async function updatePortalUserApi(
  id: string,
  body: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  return apiPut(`/api/users/${id}`, body)
}

export async function updatePortalUserStatusApi(
  id: string,
  status: string
): Promise<ApiResponse<unknown>> {
  return apiPut(`/api/users/${id}/status`, { status })
}

export async function deletePortalUserApi(id: string): Promise<ApiResponse<unknown>> {
  return apiDelete(`/api/users/${id}`)
}

export function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = String(full || '')
    .trim()
    .split(/\s+/)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export type PortalUserRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  organizationLabel: string
  role: string
  status: string
  submitterType: string
  department: string | null
  lastLoginAt: Date | null
  createdAt: Date | null
}

export function mapPortalRow(row: PortalUserApiRow): PortalUserRow {
  const { firstName, lastName } = splitFullName(row.full_name)
  const org =
    row.mda?.name ||
    row.organization ||
    (row.entity && typeof row.entity === 'object' && 'entity_name' in row.entity
      ? String((row.entity as { entity_name?: string }).entity_name || '')
      : '') ||
    null
  const createdRaw = row.created_at ?? row.createdAt ?? ''
  const createdDate = new Date(createdRaw)

  return {
    id: row.id,
    firstName,
    lastName,
    email: row.email,
    phone: row.phone,
    organizationLabel: org || '—',
    role: row.role,
    status: row.status,
    submitterType: row.submitter_type,
    department: row.department,
    lastLoginAt: row.last_login ? new Date(row.last_login) : null,
    createdAt: Number.isNaN(createdDate.getTime()) ? null : createdDate,
  }
}
