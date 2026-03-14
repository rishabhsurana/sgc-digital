// API helper functions for making requests to the backend

export interface ApiResponse<T> {
  data?: T
  error?: string
  success?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'An error occurred' }
    }

    return { data, success: true }
  } catch (error) {
    console.error('API Error:', error)
    return { error: 'Network error. Please try again.' }
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }),

  register: (data: {
    email: string
    password: string
    name: string
    mda_id?: string
    phone?: string
  }) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSession: () =>
    apiFetch('/api/auth/session'),
}

// Users API
export const usersApi = {
  list: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params)
    return apiFetch(`/api/users?${searchParams}`)
  },

  get: (id: string) =>
    apiFetch(`/api/users/${id}`),

  create: (data: {
    email: string
    password: string
    name: string
    role: string
    status?: string
    mda_id?: string
    phone?: string
  }) =>
    apiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
}

// MDAs API
export const mdasApi = {
  list: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params)
    return apiFetch(`/api/mdas?${searchParams}`)
  },

  get: (id: string) =>
    apiFetch(`/api/mdas/${id}`),

  create: (data: {
    code: string
    name: string
    description?: string
    contact_email?: string
    contact_phone?: string
    address?: string
  }) =>
    apiFetch('/api/mdas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/mdas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/api/mdas/${id}`, { method: 'DELETE' }),
}

// Contracts API
export const contractsApi = {
  list: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params)
    return apiFetch(`/api/contracts?${searchParams}`)
  },

  get: (id: string) =>
    apiFetch(`/api/contracts/${id}`),

  create: (data: {
    title: string
    description?: string
    mda_id: string
    contractor_name: string
    contractor_email?: string
    contractor_phone?: string
    contract_value: number
    currency?: string
    start_date: string
    end_date: string
    assigned_to?: string
    notes?: string
  }) =>
    apiFetch('/api/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/contracts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/api/contracts/${id}`, { method: 'DELETE' }),
}

// Correspondence API
export const correspondenceApi = {
  list: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params)
    return apiFetch(`/api/correspondence?${searchParams}`)
  },

  get: (id: string) =>
    apiFetch(`/api/correspondence/${id}`),

  create: (data: {
    subject: string
    description?: string
    type: 'incoming' | 'outgoing'
    sender_name: string
    sender_organization?: string
    sender_email?: string
    recipient_mda_id: string
    date_received: string
    date_due?: string
    priority?: string
    assigned_to?: string
    notes?: string
  }) =>
    apiFetch('/api/correspondence', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/correspondence/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/api/correspondence/${id}`, { method: 'DELETE' }),
}

// Documents API
export const documentsApi = {
  list: (entityType: string, entityId: string) =>
    apiFetch(`/api/documents?entity_type=${entityType}&entity_id=${entityId}`),

  upload: async (
    file: File,
    entityType: string,
    entityId: string,
    documentType?: string,
    description?: string
  ) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entity_type', entityType)
    formData.append('entity_id', entityId)
    if (documentType) formData.append('document_type', documentType)
    if (description) formData.append('description', description)

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Upload failed' }
      }

      return { data, success: true }
    } catch (error) {
      console.error('Upload error:', error)
      return { error: 'Upload failed. Please try again.' }
    }
  },

  download: (id: string) =>
    `/api/documents/${id}`,

  delete: (id: string) =>
    apiFetch(`/api/documents/${id}`, { method: 'DELETE' }),
}

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    apiFetch('/api/dashboard'),
}

// Activity API
export const activityApi = {
  list: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params)
    return apiFetch(`/api/activity?${searchParams}`)
  },
}

// Reports API
export const reportsApi = {
  generate: (type: string, params?: Record<string, string>) => {
    const searchParams = new URLSearchParams({ type, ...params })
    return apiFetch(`/api/reports?${searchParams}`)
  },
}
