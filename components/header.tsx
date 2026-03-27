"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Menu, User, LogIn, FileText, FileSignature, 
  LayoutDashboard, Home, ChevronDown, Shield, LogOut, Building2 
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface HeaderProps {
  isStaff?: boolean
}

interface UserSession {
  fullName: string
  email: string
  organization?: string
  submitterType?: string
}

export function Header({ isStaff: isStaffProp = false }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isStaff, setIsStaff] = useState(isStaffProp)
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for user session in sessionStorage
    const checkUserSession = () => {
      const storedUser = sessionStorage.getItem("sgc_user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUserSession(userData)
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
    
    // Check for staff session via client-readable cookie
    const checkStaffStatus = () => {
      // Check the simple staff flag cookie
      const cookies = document.cookie.split(';')
      const staffCookie = cookies.find(c => c.trim().startsWith('sgc_is_staff='))
      
      if (staffCookie) {
        const value = staffCookie.split('=')[1]?.trim()
        if (value === '1') {
          setIsStaff(true)
          return
        }
      }
      
      // Fallback to sessionStorage for backwards compatibility
      const adminSession = sessionStorage.getItem("sgc_admin")
      if (adminSession) {
        setIsStaff(true)
      }
    }
    
    checkUserSession()
    checkStaffStatus()
  }, [isStaffProp])
  
  const handleLogout = () => {
    sessionStorage.removeItem("sgc_user")
    sessionStorage.removeItem("sgc_admin")
    // Clear cookies
    document.cookie = "sgc_is_staff=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setUserSession(null)
    setIsStaff(false)
    router.push("/")
  }
  
  // Check if a nav item is active
  const isActive = (path: string) => pathname === path
  const isServicesActive = pathname === '/correspondence' || pathname === '/contracts'

  return (
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
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* SGC Digital Branding */}
          <Link href="/" className="flex items-center group">
            <div>
              <p className="text-base font-bold text-primary group-hover:text-primary/80 transition-colors">SGC Digital</p>
              <p className="text-xs text-muted-foreground">Correspondence & Contract Management Portal</p>
            </div>
          </Link>

          {/* Navigation - Consistent pill buttons with matching saturation */}
          <nav className="hidden items-center gap-2 lg:flex">
            <Link 
              href="/" 
              className={cn(
                "relative flex items-center justify-center gap-2 min-w-[120px] px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200",
                isActive('/') 
                  ? "text-white bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg shadow-teal-200" 
                  : "text-teal-700 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-teal-50 hover:to-teal-100 border border-slate-300"
              )}
            >
              <Home className={cn("h-4 w-4", isActive('/') ? "text-white" : "text-teal-600")} />
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={cn(
                  "relative flex items-center justify-center gap-2 min-w-[120px] px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 outline-none",
                  isServicesActive 
                    ? "text-white bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-blue-200" 
                    : "text-primary bg-gradient-to-r from-slate-100 to-slate-200 hover:from-blue-50 hover:to-blue-100 border border-slate-300"
                )}
              >
                <FileText className={cn("h-4 w-4", isServicesActive ? "text-white" : "text-primary")} />
                Services
                <ChevronDown className={cn("h-3.5 w-3.5", isServicesActive ? "text-white/80" : "text-primary/60")} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 p-2">
                <DropdownMenuItem asChild className="rounded-lg p-3 cursor-pointer">
                  <Link href="/correspondence" className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Correspondence</p>
                      <p className="text-xs text-slate-500 mt-0.5">Submit registry correspondence</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg p-3 cursor-pointer">
                  <Link href="/contracts" className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <FileSignature className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Contracts</p>
                      <p className="text-xs text-slate-500 mt-0.5">Government contract requests</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link 
              href="/dashboard" 
              className={cn(
                "relative flex items-center justify-center gap-2 min-w-[120px] px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200",
                isActive('/dashboard') 
                  ? "text-white bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg shadow-slate-300" 
                  : "text-slate-600 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300"
              )}
            >
              <LayoutDashboard className={cn("h-4 w-4", isActive('/dashboard') ? "text-white" : "text-slate-500")} />
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isStaff && (
              <Link 
                href="/management/landing"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-primary border border-slate-200 rounded-full hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Shield className="h-3.5 w-3.5" />
                Management
              </Link>
            )}
            
            {userSession ? (
              /* Logged In State - Show Organization/User Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="hidden sm:flex items-center gap-2 rounded-full border-slate-200 hover:border-primary/50 hover:bg-primary/5 px-4">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                      {(userSession.organization || userSession.fullName).charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[160px] truncate font-medium text-slate-700">
                      {userSession.organization || userSession.fullName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <div className="px-3 py-2 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold">
                        {(userSession.organization || userSession.fullName).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{userSession.fullName}</p>
                        <p className="text-xs text-slate-500">{userSession.email}</p>
                      </div>
                    </div>
                    {userSession.organization && (
                      <div className="mt-2 px-2 py-1 bg-primary/5 rounded-md">
                        <p className="text-xs font-medium text-primary">{userSession.organization}</p>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2 py-2">
                      <LayoutDashboard className="h-4 w-4 text-slate-400" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2 py-2">
                      <User className="h-4 w-4 text-slate-400" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 rounded-lg cursor-pointer py-2">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Logged Out State - Show Sign In / Register Buttons */
              <div className="hidden sm:flex items-center gap-2">
                <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-5" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-5" asChild>
                  <Link href="/register">
                    <User className="mr-2 h-4 w-4" />
                    Register
                  </Link>
                </Button>
              </div>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-slate-100 rounded-full">
                  <Menu className="h-5 w-5 text-slate-600" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-white p-0">
                {/* Mobile Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src="/images/barbados-coat-of-arms.png"
                      alt="Government of Barbados"
                      width={36}
                      height={36}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Government of Barbados</p>
                      <p className="text-xs text-slate-500">Solicitor General{"'"}s Chambers</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-primary text-lg">SGC Digital</p>
                    <p className="text-xs text-slate-500">Correspondence & Contract Management</p>
                  </div>
                </div>
                
                <nav className="flex flex-col p-4 gap-1">
                  <Link 
                    href="/" 
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive('/') ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Home className={cn("h-5 w-5", isActive('/') ? "text-white" : "text-teal-500")} />
                    <span className="font-medium">Home</span>
                  </Link>
                  
                  <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                    Services
                  </p>
                  
                  <Link 
                    href="/correspondence" 
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all ml-1",
                      isActive('/correspondence') ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg", isActive('/correspondence') ? "bg-white/20" : "bg-slate-100")}>
                      <FileText className={cn("h-4 w-4", isActive('/correspondence') ? "text-white" : "text-blue-500")} />
                    </div>
                    <span className="font-medium">Correspondence</span>
                  </Link>
                  <Link 
                    href="/contracts" 
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all ml-1",
                      isActive('/contracts') ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg", isActive('/contracts') ? "bg-white/20" : "bg-slate-100")}>
                      <FileSignature className={cn("h-4 w-4", isActive('/contracts') ? "text-white" : "text-emerald-500")} />
                    </div>
                    <span className="font-medium">Contracts</span>
                  </Link>
                  
                  <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                    My Account
                  </p>
                  
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all ml-1",
                      isActive('/dashboard') ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg", isActive('/dashboard') ? "bg-white/20" : "bg-slate-100")}>
                      <LayoutDashboard className={cn("h-4 w-4", isActive('/dashboard') ? "text-white" : "text-amber-500")} />
                    </div>
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  
                  <hr className="my-4 border-slate-100" />
                  
                  {isStaff && (
                    <Link 
                      href="/management/landing" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-600 border border-slate-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-sm mb-3"
                    >
                      <Shield className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">Management Portal</span>
                    </Link>
                  )}
                  
                  {userSession ? (
                    /* Logged In State - Mobile */
                    <>
                      <div className="px-4 py-4 mb-3 bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold">
                            {(userSession.organization || userSession.fullName).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{userSession.fullName}</p>
                            <p className="text-xs text-slate-500">{userSession.email}</p>
                          </div>
                        </div>
                        {userSession.organization && (
                          <p className="text-xs font-medium text-primary bg-white/70 px-2 py-1 rounded-md inline-block">{userSession.organization}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => { handleLogout(); setIsOpen(false); }}
                        className="flex items-center justify-center gap-2 px-4 py-3 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all font-medium w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    /* Logged Out State - Mobile */
                    <div className="flex flex-col gap-2">
                      <Link 
                        href="/login" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Link>
                      <Link 
                        href="/register" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                      >
                        <User className="h-4 w-4" />
                        Register
                      </Link>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
