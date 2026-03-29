"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AskRex } from "@/components/ask-rex"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Home, ShieldAlert } from "lucide-react"
import { getUser } from "@/lib/auth"

function ContractsForbidden() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <AskRex position="content" />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-lg">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <Card className="bg-card border-border overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-800 px-6 py-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <ShieldAlert className="h-7 w-7 text-white" />
              </div>
              <Badge className="mb-3 border-0 bg-white/20 text-white hover:bg-white/25">
                Access restricted
              </Badge>
              <h1 className="font-serif text-2xl font-bold tracking-tight">
                Contract submission unavailable
              </h1>
              <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed max-w-sm mx-auto">
                Post-award contract submissions are limited to Ministry and Government Agency (MDA)
                accounts. Your profile can still submit registry correspondence.
              </p>
            </div>

            <CardContent className="pt-6 pb-8 space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">What you can do</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    Use <span className="text-foreground font-medium">Correspondence</span> for all
                    registry submissions
                  </li>
                  <li>Contact your organisation administrator if you believe you need contract access</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/correspondence">
                    <FileText className="mr-2 h-4 w-4" />
                    Correspondence
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Solicitor General&apos;s Chambers — SGC Digital
          </p>
        </div>
      </main>
      <Footer compact />
    </div>
  )
}

function ContractsGuardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading…</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer compact />
    </div>
  )
}

/**
 * Assumes the user is already authenticated (wrap with RequireAuthGuard).
 * Blocks contract form when can_submit_contracts is false.
 */
export function ContractsSubmitGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "forbidden">("loading")

  useEffect(() => {
    const user = getUser()
    if (!user?.can_submit_contracts) {
      setState("forbidden")
      return
    }
    setState("allowed")
  }, [])

  if (state === "loading") {
    return <ContractsGuardLoading />
  }

  if (state === "forbidden") {
    return <ContractsForbidden />
  }

  return <>{children}</>
}
