/**
 * Resolve post-login redirect: only same-origin relative paths (no open redirects).
 */
export function getSafeReturnUrl(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (raw == null || typeof raw !== "string") return fallback
  try {
    const decoded = decodeURIComponent(raw.trim())
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback
    return decoded
  } catch {
    return fallback
  }
}
