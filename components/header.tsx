"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Menu, User, LogIn, FileText, FileSignature, 
  LayoutDashboard, BarChart3, Home, ChevronDown, Settings 
} from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

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
      <div className="border-b border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* SGC Digital Branding */}
          <Link href="/" className="flex items-center group">
            <div>
              <p className="text-base font-bold text-primary group-hover:text-primary/80 transition-colors">SGC Digital</p>
              <p className="text-xs text-muted-foreground font-medium">Correspondence & Contract Management Portal</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/80 rounded-lg transition-all hover:text-primary hover:bg-primary/5"
            >
              <Home className="h-4 w-4 text-teal-600" />
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/80 rounded-lg transition-all hover:text-primary hover:bg-primary/5">
                <FileText className="h-4 w-4 text-blue-600" />
                Services
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/correspondence" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">Correspondence</p>
                      <p className="text-xs text-muted-foreground">Submit registry correspondence</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contracts" className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="font-medium">Contracts</p>
                      <p className="text-xs text-muted-foreground">Government contract requests</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/80 rounded-lg transition-all hover:text-primary hover:bg-primary/5"
            >
              <LayoutDashboard className="h-4 w-4 text-amber-600" />
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-primary/10 hover:text-primary" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button size="sm" className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" asChild>
              <Link href="/register">
                <User className="mr-2 h-4 w-4" />
                Register
              </Link>
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-primary/10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-gradient-to-b from-card to-primary/5">
                <div className="mb-8 mt-4">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-primary/10">
                    <Image
                      src="/images/barbados-coat-of-arms.png"
                      alt="Government of Barbados"
                      width={32}
                      height={32}
                    />
                    <div>
                      <p className="text-xs font-semibold text-primary">Government of Barbados</p>
                      <p className="text-[10px] text-muted-foreground">Solicitor General{"'"}s Chambers</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-primary">SGC Digital</p>
                    <p className="text-xs text-muted-foreground">Correspondence & Contract Management Portal</p>
                  </div>
                </div>
                
                <nav className="flex flex-col gap-1">
                  <Link 
                    href="/" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Home className="h-5 w-5 text-teal-600" />
                    Home
                  </Link>
                  
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Services
                  </div>
                  
                  <Link 
                    href="/correspondence" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors ml-2"
                  >
                    <FileText className="h-5 w-5 text-blue-600" />
                    Correspondence
                  </Link>
                  <Link 
                    href="/contracts" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors ml-2"
                  >
                    <FileSignature className="h-5 w-5 text-emerald-600" />
                    Contracts
                  </Link>
                  
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                    My Account
                  </div>
                  
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-primary/10 hover:text-primary transition-colors ml-2"
                  >
                    <LayoutDashboard className="h-5 w-5 text-amber-600" />
                    Dashboard
                  </Link>
                  
                  <hr className="my-4 border-primary/20" />
                  
                  <Link 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    <User className="h-5 w-5" />
                    Register
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
