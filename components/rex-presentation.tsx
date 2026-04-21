"use client"

import { cn } from "@/lib/utils"
import type { RexPresentDataBlock, RexCellValue } from "@/lib/rex-present-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatCell(v: RexCellValue): string {
  if (typeof v === "boolean") return v ? "Yes" : "No"
  return String(v)
}

export function RexPresentation({
  block,
  className,
}: {
  block: RexPresentDataBlock
  className?: string
}) {
  if (block.view === "keyValue") {
    return (
      <div
        className={cn(
          "rounded-md border border-border bg-background/80 text-foreground overflow-hidden",
          className
        )}
      >
        {block.title ? (
          <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            {block.title}
          </div>
        ) : null}
        <dl className="divide-y divide-border">
          {block.pairs.map((pair, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,40%)_1fr] gap-2 px-3 py-2 text-sm">
              <dt className="font-medium text-muted-foreground break-words">{pair.label}</dt>
              <dd className="break-words tabular-nums">{formatCell(pair.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background/80 text-foreground overflow-hidden",
        className
      )}
    >
      {block.title ? (
        <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
          {block.title}
        </div>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            {block.columns.map((col) => (
              <TableHead key={col.key} className="whitespace-normal min-w-[7rem] max-w-[12rem]">
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {block.rows.map((row, ri) => (
            <TableRow key={ri}>
              {block.columns.map((col) => (
                <TableCell
                  key={col.key}
                  className="whitespace-normal break-words align-top min-w-[7rem] max-w-[14rem]"
                >
                  {row[col.key] !== undefined ? formatCell(row[col.key] as RexCellValue) : "—"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
