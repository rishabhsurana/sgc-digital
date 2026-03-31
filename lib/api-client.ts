const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sgc_token');
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    return {
      success: false,
      error: json.error || json.message || `Request failed (${res.status})`,
    };
  }

  return json as ApiResponse<T>;
}

export function apiGet<T = unknown>(path: string) {
  return apiRequest<T>(path, { method: 'GET' });
}

export function apiPost<T = unknown>(path: string, body: unknown) {
  return apiRequest<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiPut<T = unknown>(path: string, body: unknown) {
  return apiRequest<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function apiDelete<T = unknown>(path: string) {
  return apiRequest<T>(path, {
    method: 'DELETE',
  });
}
