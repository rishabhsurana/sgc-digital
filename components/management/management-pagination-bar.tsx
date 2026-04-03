"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buildPageList, paginationRangeLabel } from "@/lib/pagination-helpers"

type Props = {
  page: number
  totalPages: number
  total: number
  limit: number
  loading: boolean
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  limitOptions?: number[]
}

const DEFAULT_LIMITS = [10, 20, 50]

export function ManagementPaginationBar({
  page,
  totalPages,
  total,
  limit,
  loading,
  onPageChange,
  onLimitChange,
  limitOptions = DEFAULT_LIMITS,
}: Props) {
  const safeTotalPages = Math.max(1, totalPages)
  const pages = buildPageList(page, safeTotalPages)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 border-t sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>
          Showing{" "}
          <span className="font-medium text-foreground">
            {paginationRangeLabel(page, limit, total)}
          </span>
        </span>
        <span className="hidden sm:inline" aria-hidden>
          ·
        </span>
        <span>
          Page <span className="font-medium text-foreground">{page}</span> of{" "}
          <span className="font-medium text-foreground">{safeTotalPages}</span>
        </span>
        {onLimitChange ? (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Rows per page</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                onLimitChange(Number(v))
              }}
              disabled={loading}
            >
              <SelectTrigger className="h-8 w-[72px]" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 sm:mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-0.5 px-1">
          {pages.map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`e-${idx}`}
                className="flex h-9 min-w-9 items-center justify-center px-1 text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "ghost"}
                size="sm"
                className="h-9 min-w-9 px-0"
                disabled={loading}
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Button>
            )
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= safeTotalPages || loading}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  )
}
