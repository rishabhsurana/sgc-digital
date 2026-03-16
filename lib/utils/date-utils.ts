/**
 * Date formatting utilities that work consistently on server and client
 * Uses fixed locale to prevent hydration mismatches
 */

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  // Use ISO format parts to avoid locale issues
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${day}/${month}/${year}`
}

export function formatDateLong(date: string | Date): string {
  const d = new Date(date)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  return `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  const dateStr = formatDate(d)
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  return `${dateStr} ${hours}:${minutes}`
}
