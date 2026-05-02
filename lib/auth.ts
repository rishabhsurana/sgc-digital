const TOKEN_KEY = 'sgc_token';
const USER_KEY = 'sgc_user';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  submitter_type: string;
  organization: string | null;
  entity_id: string | null;
  mda_id: number | null;
  can_submit_contracts: boolean;
  status: string;
  phone: string | null;
  department: string | null;
}

export function setAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isManagementUser(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.submitter_type === 'management_user') return true;

  const normalizedRole = String(user.role || '').toLowerCase();
  return (
    normalizedRole.includes('admin') ||
    normalizedRole.includes('manager') ||
    normalizedRole.includes('supervisor') ||
    normalizedRole.includes('staff')
  );
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function logout(): void {
  clearAuth();
  window.location.href = '/login';
}
