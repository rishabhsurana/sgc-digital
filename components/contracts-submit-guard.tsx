"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AskRex } from "@/components/ask-rex"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  FileText,
  Home,
  LogIn,
  ShieldAlert,
} from "lucide-react"
import { getToken, getUser } from "@/lib/auth"

type AccessState = "loading" | "allowed" | "sign_in_required" | "forbidden"

function ContractsAccessDenied({ variant }: { variant: "sign_in_required" | "forbidden" }) {
  const isSignIn = variant === "sign_in_required"

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
                {isSignIn ? (
                  <LogIn className="h-7 w-7 text-white" />
                ) : (
                  <ShieldAlert className="h-7 w-7 text-white" />
                )}
              </div>
              <Badge className="mb-3 border-0 bg-white/20 text-white hover:bg-white/25">
                {isSignIn ? "Authentication required" : "Access restricted"}
              </Badge>
              <h1 className="font-serif text-2xl font-bold tracking-tight">
                {isSignIn ? "Sign in to continue" : "Contract submission unavailable"}
              </h1>
              <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed max-w-sm mx-auto">
                {isSignIn
                  ? "Government contract requests can only be submitted by signed-in users with the appropriate ministry or MDA access."
                  : "Post-award contract submissions are limited to Ministry and Government Agency (MDA) accounts. Your profile can still submit registry correspondence."}
              </p>
            </div>

            <CardContent className="pt-6 pb-8 space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">What you can do</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Use <span className="text-foreground font-medium">Correspondence</span> for all registry submissions</li>
                  {!isSignIn && (
                    <li>Contact your organisation administrator if you believe you need contract access</li>
                  )}
                  {isSignIn && (
                    <li>Sign in with a ministry or MDA account that has been enabled for contract submission</li>
                  )}
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
                {isSignIn && (
                  <Button
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  >
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </Link>
                  </Button>
                )}
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

export function ContractsSubmitGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessState>("loading")

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token || !user) {
      setState("sign_in_required")
      return
    }
    if (!user.can_submit_contracts) {
      setState("forbidden")
      return
    }
    setState("allowed")
  }, [])

  if (state === "loading") {
    return <ContractsGuardLoading />
  }

  if (state === "sign_in_required" || state === "forbidden") {
    return <ContractsAccessDenied variant={state} />
  }

  return <>{children}</>
}
