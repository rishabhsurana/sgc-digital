"use client"

import { useEffect, useMemo, useState } from "react"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { AskRex } from "@/components/ask-rex"
import Link from "next/link"
import Image from "next/image"
import { 
  CheckCircle,
  BarChart3,
  History,
  Users,
  LogIn,
  UserPlus,
  Globe,
  LayoutDashboard,
  LogOut
} from "lucide-react"
import { clearAuth, getToken, getUser, isManagementUser } from "@/lib/auth"

export default function ManagementLandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    setIsLoggedIn(Boolean(token) && isManagementUser(user))
  }, [])

  // Helper function to get the correct link based on login status
  const getLink = useMemo(() => (destination: string) => {
    return isLoggedIn ? destination : `/management/login?redirect=${destination}`
  }, [isLoggedIn])

  const handleLogout = () => {
    clearAuth()
    window.location.href = "/management/login"
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Management Portal Header */}
      <header className="sticky top-0 z-50 w-full">
        {/* Top Bar with Government Branding */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex h-10 items-center justify-between px-4 lg:px-6 text-xs">
            <div className="flex items-center gap-3">
              <Image
                src="/images/barbados-coat-of-arms.png"
                alt="Government of Barbados"
                width={28}
                height={28}
              />
              <div className="hidden sm:flex items-center">
                <span className="font-semibold">Government of Barbados</span>
                <span className="mx-2 opacity-50">|</span>
                <span className="opacity-90">Solicitor General{"'"}s Chambers</span>
              </div>
              <span className="sm:hidden font-medium">Gov. of Barbados</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/help" className="hover:underline">Help</Link>
              <Link href="/contact" className="hover:underline">Contact</Link>
            </div>
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="border-b border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-card/95">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* SGC Digital Branding */}
          <Link href="/management/landing" className="flex items-center group">
            <div>
              <p className="text-base font-bold text-primary group-hover:text-primary/80 transition-colors">SGC Digital</p>
              <p className="text-xs text-muted-foreground font-medium">Correspondence & Contract Management Portal</p>
            </div>
          </Link>

          {/* Spacer for nav alignment */}
          <nav className="hidden items-center gap-1 lg:flex" />

          <div className="flex items-center gap-2">
            {/* SGC Public Portal Button */}
            <Button size="sm" className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <Link href="/">
                <Globe className="mr-2 h-4 w-4" />
                SGC Public Portal
              </Link>
            </Button>
            
            {!isLoggedIn ? (
              <>
                <Button size="sm" className="hidden sm:flex bg-slate-700 hover:bg-slate-800 text-white" asChild>
                  <Link href="/management/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" asChild>
                  <Link href="/management/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Request Access
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" asChild>
                  <Link href="/management">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="hidden sm:flex border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            )}
            
            {/* Mobile buttons */}
            <Button variant="outline" size="sm" className="sm:hidden" asChild>
              <Link href="/">
                <Globe className="h-4 w-4" />
              </Link>
            </Button>
            {!isLoggedIn && (
              <Button variant="ghost" size="sm" className="sm:hidden" asChild>
                <Link href="/management/login">
                  <LogIn className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {isLoggedIn && (
              <Button variant="ghost" size="sm" className="sm:hidden" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        </div>
      </header>
      <AskRex />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
          
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                <span className="text-emerald-400">SGC</span> <span className="text-blue-500">Digital</span>
              </h1>
              <p className="mt-3 text-xl text-white font-semibold">
                Management Portal
              </p>
              <p className="mt-2 text-lg text-emerald-400 italic">
                Transforming Government Services, Powering Tomorrow
              </p>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto text-pretty">
                SGC-Digital Management Portal for tracking, managing and monitoring 
                Government Contracts and Correspondence Applications.
              </p>
              
              {/* Quick Action Buttons */}
              <div className="mt-10 grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full sm:w-48 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg" asChild>
                  <Link href={getLink("/management")}>
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Dashboard
                  </Link>
                </Button>
                <Button size="lg" className="w-full sm:w-48 bg-blue-600 hover:bg-blue-700 text-white shadow-lg" asChild>
                  <Link href={getLink("/management/activity")}>
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Monitoring
                  </Link>
                </Button>
                <Button size="lg" className="w-full sm:w-48 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" asChild>
                  <Link href={getLink("/management/correspondence-history")}>
                    <History className="mr-2 h-5 w-5" />
                    Transaction History
                  </Link>
                </Button>
                <Button size="lg" className="w-full sm:w-48 bg-slate-600 hover:bg-slate-700 text-white shadow-lg" asChild>
                  <Link href={getLink("/management/status")}>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Status Overview
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Public Portal Access - Subtle link */}
        <section className="py-6 bg-slate-100 dark:bg-slate-900 border-t">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Looking for the public portal?</span>
              <Link 
                href="/" 
                className="font-medium text-primary hover:underline"
              >
                Go to Public Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
