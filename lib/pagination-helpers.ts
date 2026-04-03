/** Page numbers for compact pagination (with ellipses). */
export function buildPageList(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages < 1) return []
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const set = new Set<number>()
  const add = (n: number) => {
    if (n >= 1 && n <= totalPages) set.add(n)
  }
  add(1)
  add(totalPages)
  for (let d = -2; d <= 2; d++) add(current + d)
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | "ellipsis")[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("ellipsis")
    out.push(p)
    prev = p
  }
  return out
}

export function paginationRangeLabel(page: number, limit: number, total: number): string {
  if (total === 0) return "0 of 0"
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  return `${from}–${to} of ${total}`
}
