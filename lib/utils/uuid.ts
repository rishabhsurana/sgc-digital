export function normalizeUuid(id: string | null | undefined): string | null {
  return typeof id === "string" ? id.trim().toLowerCase() : null
}

export function sameUuid(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = normalizeUuid(a)
  const right = normalizeUuid(b)
  return !!left && !!right && left === right
}
