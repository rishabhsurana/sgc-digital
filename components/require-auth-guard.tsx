"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { getToken, getUser } from "@/lib/auth"

function AuthCheckLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Checking your session…</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer compact />
    </div>
  )
}

export function RequireAuthGuard({
  children,
  returnPath,
}: {
  children: ReactNode
  returnPath: string
}) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token || !user) {
      const next = encodeURIComponent(returnPath)
      router.replace(`/login?returnUrl=${next}`)
      return
    }
    setAllowed(true)
  }, [router, returnPath])

  if (!allowed) {
    return <AuthCheckLoading />
  }

  return <>{children}</>
}
