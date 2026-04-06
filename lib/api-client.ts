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

function extractFilenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const simpleMatch = disposition.match(/filename="?([^"]+)"?/i);
  return simpleMatch?.[1] ?? null;
}

export async function apiDownloadFile(path: string, fallbackFileName = 'download'): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers,
  });

  handleUnauthorizedResponse(res.status);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition');
  const fileName = extractFilenameFromDisposition(disposition) || fallbackFileName;
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
