const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const USER_LOGIN_PATH = '/login';
const MANAGEMENT_LOGIN_PATH = '/management/login';

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

function isManagementContext(): boolean {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname;
  const rawUser = localStorage.getItem('sgc_user');

  if (pathname.startsWith('/management')) {
    return true;
  }

  if (!rawUser) return false;
  try {
    const user = JSON.parse(rawUser) as { submitter_type?: string; role?: string };
    if (user.submitter_type === 'management_user') return true;
    const normalizedRole = String(user.role || '').toLowerCase();
    return (
      normalizedRole.includes('admin')
      || normalizedRole.includes('manager')
      || normalizedRole.includes('supervisor')
      || normalizedRole.includes('staff')
    );
  } catch {
    return false;
  }
}

export function handleUnauthorizedResponse(status: number): void {
  if (typeof window === 'undefined' || status !== 401) return;

  const managementContext = isManagementContext();
  const loginPath = managementContext ? MANAGEMENT_LOGIN_PATH : USER_LOGIN_PATH;
  const redirectParam = managementContext ? 'redirect' : 'returnUrl';
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  localStorage.removeItem('sgc_token');
  localStorage.removeItem('sgc_user');

  if (window.location.pathname === loginPath) return;

  const querySuffix = currentPath && currentPath !== loginPath
    ? `?${redirectParam}=${encodeURIComponent(currentPath)}`
    : '';
  window.location.href = `${loginPath}${querySuffix}`;
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

  handleUnauthorizedResponse(res.status);
  const json = await res.json().catch(() => ({} as Record<string, unknown>));

  if (!res.ok) {
    return {
      success: false,
      error: (json as { error?: string; message?: string }).error
        || (json as { error?: string; message?: string }).message
        || `Request failed (${res.status})`,
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
