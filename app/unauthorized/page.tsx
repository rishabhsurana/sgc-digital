"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, ArrowLeft, Home, LogIn } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <Card className="bg-card border-border overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/20 backdrop-blur">
                <ShieldAlert className="h-7 w-7 text-red-300" />
              </div>
              <h1 className="text-2xl font-medium text-white">Unauthorized Access</h1>
              <p className="text-slate-300 mt-2">
                You do not have permission to view this page.
              </p>
            </div>

            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center mb-6">
                If you believe this is a mistake, sign in with the correct account or contact an administrator.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
