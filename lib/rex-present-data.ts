/**
 * Validated shape streamed from Ask Rex `presentData` tool (server Zod must match).
 */

export type RexCellValue = string | number | boolean

export type RexPresentDataTable = {
  view: "table"
  title?: string
  columns: { key: string; label: string }[]
  rows: Record<string, RexCellValue>[]
}

export type RexPresentDataKeyValue = {
  view: "keyValue"
  title?: string
  pairs: { label: string; value: RexCellValue }[]
}

export type RexPresentDataBlock = RexPresentDataTable | RexPresentDataKeyValue

function isCellValue(v: unknown): v is RexCellValue {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean"
}

export function parsePresentDataBlock(raw: unknown): RexPresentDataBlock | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  if (o.view === "table") {
    if (!Array.isArray(o.columns) || !Array.isArray(o.rows)) return null
    const columns: { key: string; label: string }[] = []
    for (const c of o.columns) {
      if (!c || typeof c !== "object") return null
      const col = c as Record<string, unknown>
      if (typeof col.key !== "string" || typeof col.label !== "string") return null
      if (col.key.length > 64 || col.label.length > 120) return null
      columns.push({ key: col.key, label: col.label })
    }
    if (columns.length < 1 || columns.length > 8) return null
    const keySet = new Set(columns.map((c) => c.key))
    const rows: Record<string, RexCellValue>[] = []
    for (const r of o.rows) {
      if (!r || typeof r !== "object") return null
      const row = r as Record<string, unknown>
      const out: Record<string, RexCellValue> = {}
      for (const [k, v] of Object.entries(row)) {
        if (!keySet.has(k)) return null
        if (!isCellValue(v)) return null
        if (typeof v === "string" && v.length > 500) return null
        out[k] = v
      }
      rows.push(out)
      if (rows.length > 15) return null
    }
    const title =
      typeof o.title === "string" && o.title.length <= 200 ? o.title : undefined
    return { view: "table", title, columns, rows }
  }
  if (o.view === "keyValue") {
    if (!Array.isArray(o.pairs)) return null
    const pairs: { label: string; value: RexCellValue }[] = []
    for (const p of o.pairs) {
      if (!p || typeof p !== "object") return null
      const pair = p as Record<string, unknown>
      if (typeof pair.label !== "string" || pair.label.length > 120) return null
      if (!isCellValue(pair.value)) return null
      if (typeof pair.value === "string" && pair.value.length > 500) return null
      pairs.push({ label: pair.label, value: pair.value })
      if (pairs.length > 24) return null
    }
    if (pairs.length < 1) return null
    const title =
      typeof o.title === "string" && o.title.length <= 200 ? o.title : undefined
    return { view: "keyValue", title, pairs }
  }
  return null
}
